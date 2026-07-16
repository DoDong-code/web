import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import './MotionMasonry.css';

export type MotionItem = { id: string; src: string; type: 'image' | 'video'; alt: string; aspectRatio?: number };
type MotionMasonryProps = { items: MotionItem[] };
type Layout = { x: number; y: number; width: number; height: number };
type Placed = Layout;
const getColumns = (width: number) => {
  if (width >= 1600) return 8;
  if (width >= 1200) return 6;
  if (width >= 760) return 4;
  return 2;
};
const hashString = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
const stableMotionOrder = (source: MotionItem[]) => {
  const unique = Array.from(new Map(source.map((item) => [item.src, item])).values());
  const videos = unique.filter((item) => item.type === 'video').sort((a, b) => hashString(a.id) - hashString(b.id));
  const images = unique.filter((item) => item.type !== 'video').sort((a, b) => hashString(a.id) - hashString(b.id));
  const ordered: MotionItem[] = [];
  let videoIndex = 0;
  let imageIndex = 0;
  while (videoIndex < videos.length || imageIndex < images.length) {
    if (videoIndex < videos.length) ordered.push(videos[videoIndex++]);
    for (let count = 0; count < 3 && imageIndex < images.length; count += 1) ordered.push(images[imageIndex++]);
  }
  return ordered;
};

export default function MotionMasonry({ items }: MotionMasonryProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backgroundVideosRef = useRef(new Map<string, HTMLVideoElement>());
  const cardsRef = useRef(new Map<string, HTMLElement>());
  const isLightboxOpenRef = useRef(false);
  const activeOriginRef = useRef<string | null>(null);
  const [loadedItems, setLoadedItems] = useState<MotionItem[]>(() => stableMotionOrder(items));
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [layouts, setLayouts] = useState<Record<string, Layout>>({});
  const [fullHeight, setFullHeight] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(900);
  const [cellSize, setCellSize] = useState(160);
  const [collapsedHeight] = useState(() => Math.min(Math.max(window.innerHeight * 0.95, 900), 1080));
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState<MotionItem | null>(null);
  const [visibleVideos, setVisibleVideos] = useState(new Set<HTMLVideoElement>());
  const wasExpandedRef = useRef(false);
  const warned = useRef(new Set<string>());

  useEffect(() => {
    fetch('/motion-wall/manifest.json')
      .then((response) => response.ok ? response.json() : [])
      .then((manifest: MotionItem[]) => { if (manifest.length) setLoadedItems(stableMotionOrder(manifest)); })
      .catch(() => undefined);
  }, []);

  const markFailure = (item: MotionItem) => {
    setFailed((current) => new Set(current).add(item.id));
    if (!warned.current.has(item.id)) { warned.current.add(item.id); console.warn(`[Motion Wall] 素材加载失败: ${item.src}`); }
  };
  const markRatio = (item: MotionItem, width: number, height: number) => {
    if (width && height) setRatios((current) => ({ ...current, [item.id]: width / height }));
  };

  useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const layout = () => {
      const columns = getColumns(shell.clientWidth);
      const gap = shell.clientWidth >= 1600 ? 10 : shell.clientWidth >= 980 ? 12 : 10;
      const size = (shell.clientWidth - gap * (columns - 1)) / columns;
      setCellSize(size);
      const rows = Math.max(1, Math.ceil(loadedItems.filter((item) => !failed.has(item.id)).length / columns));
      const measuredHeight = rows * size + Math.max(0, rows - 1) * gap;
      setFullHeight(measuredHeight);
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [loadedItems, ratios, failed]);

  useLayoutEffect(() => {
    if (!loadedItems.length) return;
    const context = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { gsap.set('.motion-masonry-item', { opacity: 1, filter: 'blur(0px)' }); return; }
      gsap.fromTo('.motion-masonry-item', { opacity: 0, filter: 'blur(8px)', y: 30 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, stagger: 0.045, ease: 'power3.out' });
    }, shellRef);
    return () => context.revert();
  }, [loadedItems]);

  useEffect(() => {
    const videos = Array.from(shellRef.current?.querySelectorAll('video') ?? []);
    backgroundVideosRef.current.clear();
    videos.forEach((video) => {
      const item = loadedItems.find((candidate) => candidate.src === video.currentSrc || candidate.src === video.getAttribute('src'));
      if (item) backgroundVideosRef.current.set(item.id, video);
    });
    const observer = new IntersectionObserver((entries) => {
      setVisibleVideos((current) => {
        const next = new Set(current);
        entries.forEach((entry) => entry.isIntersecting ? next.add(entry.target as HTMLVideoElement) : next.delete(entry.target as HTMLVideoElement));
        return next;
      });
      entries.forEach((entry) => { const video = entry.target as HTMLVideoElement; if (isLightboxOpenRef.current) { video.pause(); return; } if (entry.isIntersecting) void video.play().catch(() => undefined); else video.pause(); });
    }, { threshold: 0.2 });
    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, [layouts, loadedItems]);

  useEffect(() => {
    if (!activeItem) return;
    isLightboxOpenRef.current = true;
    const originId = activeOriginRef.current;
    backgroundVideosRef.current.forEach((video) => video.pause());
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      isLightboxOpenRef.current = false;
      document.body.style.overflow = '';
      visibleVideos.forEach((video) => void video.play().catch(() => undefined));
      cardsRef.current.get(originId ?? '')?.focus();
      activeOriginRef.current = null;
    };
  }, [activeItem]);

  useEffect(() => {
    if (!activeItem) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveItem(null); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeItem]);

  const visibleItems = loadedItems.filter((item) => !failed.has(item.id));
  const openLightbox = (item: MotionItem) => { activeOriginRef.current = item.id; setActiveItem(item); };
  const toggleExpanded = () => {
    setExpanded((current) => {
      if (current) window.setTimeout(() => shellRef.current?.closest('.motion-wall-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 720);
      return !current;
    });
  };
  useLayoutEffect(() => {
    if (wasExpandedRef.current && !expanded) {
      const section = shellRef.current?.closest<HTMLElement>('.motion-wall-section');
      if (section) window.scrollTo({ top: section.offsetTop, behavior: 'auto' });
    }
    wasExpandedRef.current = expanded;
  }, [expanded]);
  return (
    <div className={`motion-wall-viewport${expanded ? ' is-expanded' : ''}`} style={{ '--motion-collapsed-height': `${collapsedHeight}px`, '--motion-full-height': `${fullHeight || 900}px` } as CSSProperties}>
      <div ref={shellRef} className={`motion-masonry${activeItem ? ' is-preview-open' : ''}`} style={{ '--motion-cell-size': `${cellSize}px` } as CSSProperties}>
        {visibleItems.map((item) => {
          const ratio = ratios[item.id] ?? item.aspectRatio ?? 1;
          const shape = ratio >= 1.35 ? 'landscape' : ratio <= 0.75 ? 'portrait' : 'square';
          const layout = { x: 0, y: 0, width: 0, height: 0 };
          return <article ref={(node) => { if (node) cardsRef.current.set(item.id, node); }} className={`motion-masonry-item motion-item--${shape}`} key={item.id} style={{ left: layout.x, top: layout.y, width: layout.width, height: layout.height }} role="button" tabIndex={0} aria-label={`放大查看 ${item.alt}`} onClick={() => openLightbox(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(item); } }}>
            <div className="motion-masonry-media">
              {item.type === 'video' ? <video src={item.src} muted loop playsInline preload="metadata" aria-label={item.alt} onLoadedMetadata={(event) => markRatio(item, event.currentTarget.videoWidth, event.currentTarget.videoHeight)} onError={() => markFailure(item)} /> : <img src={item.src} alt={item.alt} loading="lazy" draggable={false} onLoad={(event) => markRatio(item, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} onError={() => markFailure(item)} />}
            </div>
          </article>;
        })}
      </div>
      <div className="motion-wall-fade" aria-hidden="true" />
      <button className="motion-wall-toggle" type="button" onClick={() => setExpanded((value) => !value)} aria-label={expanded ? '收起全部' : '展开全部'} aria-expanded={expanded}><svg className="motion-wall-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} /></svg></button>
      {activeItem && <div className="motion-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.alt}>
        <button className="motion-lightbox-backdrop" type="button" aria-label="关闭预览" onClick={() => setActiveItem(null)} />
        <div className="motion-lightbox-content">
          <button ref={closeRef} className="motion-lightbox-close" type="button" aria-label="关闭预览" onClick={() => setActiveItem(null)}>×</button>
          {activeItem.type === 'video' ? <video src={activeItem.src} muted autoPlay loop playsInline controls /> : <img src={activeItem.src} alt={activeItem.alt} />}
        </div>
      </div>}
    </div>
  );
}
