import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import './MotionMasonry.css';

export type MotionItem = { id: string; src: string; type: 'image' | 'video'; alt: string; aspectRatio?: number; poster?: string; animated?: boolean; animatedSrc?: string };
type MotionMasonryProps = { items: MotionItem[] };
type Layout = { x: number; y: number; width: number; height: number };
type Placed = Layout;
const hoverVideoRegistry = new Set<HTMLVideoElement>();
const playingHoverVideos = new Set<HTMLVideoElement>();
const hoveredHoverVideos = new Set<HTMLVideoElement>();

function HoverVideo({ item, onRatio, onError, playAll }: { item: MotionItem; onRatio: (width: number, height: number) => void; onError: () => void; playAll: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const timerRef = useRef<number | null>(null);
  const unloadRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (unloadRef.current) window.clearTimeout(unloadRef.current);
    const video = videoRef.current;
    if (video) {
      video.pause();
      hoverVideoRegistry.delete(video);
      playingHoverVideos.delete(video);
      hoveredHoverVideos.delete(video);
    }
  }, []);

  useEffect(() => {
    if (playAll) {
      setHovered(true);
      setMounted(true);
      return;
    }
    setHovered(false);
    const video = videoRef.current;
      video?.pause();
    if (video) {
      playingHoverVideos.delete(video);
      hoveredHoverVideos.delete(video);
    }
    setMounted(false);
    setReady(false);
  }, [playAll]);

  const handleEnter = () => {
    setHovered(true);
    if (unloadRef.current) window.clearTimeout(unloadRef.current);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMounted(true), 150);
  };

  const handleLeave = () => {
      if (playAll) return;
    setHovered(false);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const video = videoRef.current;
    video?.pause();
    if (video) {
      playingHoverVideos.delete(video);
      hoveredHoverVideos.delete(video);
    }
    unloadRef.current = window.setTimeout(() => {
      setMounted(false);
      setReady(false);
    }, 500);
  };

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setReady(true);
    if (!hovered) return;
    hoveredHoverVideos.add(video);
    if (!playAll && playingHoverVideos.size >= 2) {
      const first = playingHoverVideos.values().next().value as HTMLVideoElement | undefined;
      first?.pause();
      if (first) playingHoverVideos.delete(first);
    }
    playingHoverVideos.add(video);
    void video.play().catch(() => undefined);
  };

  return (
    <div className="motion-hover-video" onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
      {item.poster ? <img className="motion-hover-poster" src={item.poster} alt="" aria-hidden="true" loading="lazy" decoding="async" onLoad={(event) => onRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} /> : <span className="motion-hover-poster motion-hover-poster--fallback" aria-hidden="true" />}
      {mounted ? <video ref={(node) => { if (!node && videoRef.current) hoverVideoRegistry.delete(videoRef.current); videoRef.current = node; if (node) hoverVideoRegistry.add(node); }} src={item.src} muted loop playsInline preload="metadata" aria-label={item.alt} className={ready ? 'is-ready' : ''} onLoadedMetadata={(event) => onRatio(event.currentTarget.videoWidth, event.currentTarget.videoHeight)} onCanPlay={handleCanPlay} onError={() => { setReady(false); onError(); }} /> : null}
    </div>
  );
}

function HoverImage({ item, onRatio, onError, playAll }: { item: MotionItem; onRatio: (width: number, height: number) => void; onError: () => void; playAll: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const timerRef = useRef<number | null>(null);
  const unloadRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (unloadRef.current) window.clearTimeout(unloadRef.current);
  }, []);

  useEffect(() => {
    if (playAll) {
      setMounted(true);
      return;
    }
    setMounted(false);
    setReady(false);
  }, [playAll]);

  const handleEnter = () => {
    if (unloadRef.current) window.clearTimeout(unloadRef.current);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setMounted(true), 150);
  };

  const handleLeave = () => {
    if (playAll) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    unloadRef.current = window.setTimeout(() => {
      setMounted(false);
      setReady(false);
    }, 500);
  };

  return (
    <div className="motion-hover-image" onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
      {item.poster ? <img className="motion-hover-poster" src={item.poster} alt="" aria-hidden="true" loading="lazy" decoding="async" onLoad={(event) => onRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} /> : <span className="motion-hover-poster motion-hover-poster--fallback" aria-hidden="true" />}
      {mounted ? <img className={`motion-hover-image-media${ready ? ' is-ready' : ''}`} src={item.animatedSrc || item.src} alt={item.alt} loading="eager" decoding="async" draggable={false} onLoad={(event) => { setReady(true); onRatio(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight); }} onError={() => { setReady(false); onError(); }} /> : null}
    </div>
  );
}
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
  while (imageIndex < images.length || videoIndex < videos.length) {
    for (let count = 0; count < 6 && imageIndex < images.length; count += 1) ordered.push(images[imageIndex++]);
    if (videoIndex < videos.length) ordered.push(videos[videoIndex++]);
  }
  return ordered;
};
const motionSrcSet = (src: string) => {
  if (!src.startsWith('/optimized/motion-wall/') || !src.endsWith('.webp')) return undefined;
  const base = src.slice(0, -5);
  return [480, 640, 960, 1280].map((width) => `${base}-${width}.webp ${width}w`).join(', ');
};
const isDeferredImage = (item: MotionItem) => item.type === 'image' && (item.animated === true || Boolean(item.animatedSrc) || /\.gif$/i.test(item.src));

export default function MotionMasonry({ items }: MotionMasonryProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const backgroundVideosRef = useRef(new Map<string, HTMLVideoElement>());
  const cardsRef = useRef(new Map<string, HTMLElement>());
  const isLightboxOpenRef = useRef(false);
  const activeOriginRef = useRef<string | null>(null);
  const entrancePlayedRef = useRef(false);
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
  const [playAll, setPlayAll] = useState(false);
  const playAllRef = useRef(false);
  const [renderLimit, setRenderLimit] = useState(12);
  const [visibleVideos, setVisibleVideos] = useState(new Set<HTMLVideoElement>());
  const wasExpandedRef = useRef(false);
  const warned = useRef(new Set<string>());

  useEffect(() => {
    playAllRef.current = playAll;
  }, [playAll]);

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
    const shell = shellRef.current;
    if (!shell || !loadedItems.length || entrancePlayedRef.current) return;

    let observer: IntersectionObserver | null = null;
    const context = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('.motion-masonry-item');
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(items, { opacity: 1, filter: 'blur(0px)', y: 0 });
        entrancePlayedRef.current = true;
        return;
      }

      gsap.set(items, { opacity: 0, filter: 'blur(8px)', y: 72 });

      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        entrancePlayedRef.current = true;
        observer?.disconnect();
        gsap.to(items, {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.6,
          stagger: 0.045,
          ease: 'power3.out',
          clearProps: 'opacity,filter,transform',
        });
      }, { threshold: 0.12 });

      observer.observe(shell);
    }, shellRef);

    return () => {
      observer?.disconnect();
      context.revert();
    };
  }, [loadedItems]);

  useEffect(() => {
    if (!activeItem) return;
    isLightboxOpenRef.current = true;
    const originId = activeOriginRef.current;
    hoverVideoRegistry.forEach((video) => video.pause());
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      isLightboxOpenRef.current = false;
      document.body.style.overflow = '';
      hoverVideoRegistry.forEach((video) => {
        if (playAllRef.current || hoveredHoverVideos.has(video)) void video.play().catch(() => undefined);
      });
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
  const renderedItems = expanded ? visibleItems : visibleItems.slice(0, renderLimit);
  useEffect(() => {
    if (expanded || renderLimit >= visibleItems.length) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setRenderLimit((current) => Math.min(current + 24, visibleItems.length));
    }, { rootMargin: '900px 0px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [expanded, renderLimit, visibleItems.length]);
  const openLightbox = (item: MotionItem) => { activeOriginRef.current = item.id; setActiveItem(item); };
  const toggleExpanded = () => {
    setExpanded((current) => {
      if (current) {
        window.setTimeout(() => {
          const section = shellRef.current?.closest<HTMLElement>('.motion-wall-section');
          if (!section) return;
          const top = section.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 720);
      }
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
    <div className="motion-wall-shell">
      <div className={`motion-wall-viewport${expanded ? ' is-expanded' : ''}${activeItem ? ' is-lightbox-open' : ''}`} style={{ '--motion-collapsed-height': `${collapsedHeight}px`, '--motion-full-height': `${fullHeight || 900}px` } as CSSProperties}>
      <div className="motion-wall-controls">
        <button className="motion-wall-play-all" type="button" onClick={() => setPlayAll((value) => !value)} aria-pressed={playAll}>
          {playAll ? 'Stop All' : 'Play All'}
        </button>
      </div>
      <div ref={shellRef} className={`motion-masonry${activeItem ? ' is-preview-open' : ''}`} style={{ '--motion-cell-size': `${cellSize}px` } as CSSProperties}>
        {renderedItems.map((item, index) => {
          const ratio = ratios[item.id] ?? item.aspectRatio ?? 1;
          const shape = ratio >= 1.35 ? 'landscape' : ratio <= 0.75 ? 'portrait' : 'square';
          const layout = { x: 0, y: 0, width: 0, height: 0 };
          return <article ref={(node) => { if (node) cardsRef.current.set(item.id, node); }} className={`motion-masonry-item motion-item--${shape}`} key={item.id} style={{ left: layout.x, top: layout.y, width: layout.width, height: layout.height }} role="button" tabIndex={0} aria-label={`放大查看 ${item.alt}`} onClick={() => openLightbox(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(item); } }}>
            <div className="motion-masonry-media">
              {item.type === 'video' ? <HoverVideo item={item} playAll={playAll} onRatio={(width, height) => markRatio(item, width, height)} onError={() => markFailure(item)} /> : isDeferredImage(item) ? <HoverImage item={item} playAll={playAll} onRatio={(width, height) => markRatio(item, width, height)} onError={() => markFailure(item)} /> : <img src={item.src} srcSet={motionSrcSet(item.src)} sizes={shape === 'landscape' ? '(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 25vw' : '(max-width: 760px) 50vw, (max-width: 1200px) 25vw, 12.5vw'} alt={item.alt} loading="lazy" decoding="async" draggable={false} onLoad={(event) => markRatio(item, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)} onError={() => markFailure(item)} />}
            </div>
          </article>;
        })}
      </div>
      {!expanded && renderLimit < visibleItems.length ? <div ref={loadMoreRef} aria-hidden="true" className="motion-wall-load-sentinel" /> : null}
      {activeItem && createPortal(<div className="motion-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.alt}>
        <button className="motion-lightbox-backdrop" type="button" aria-label="关闭预览" onClick={() => setActiveItem(null)} />
        <div className="motion-lightbox-content">
          <button ref={closeRef} className="motion-lightbox-close" type="button" aria-label="关闭预览" onClick={() => setActiveItem(null)}>×</button>
          {activeItem.type === 'video' ? <video src={activeItem.src} poster={activeItem.poster} muted autoPlay loop playsInline controls /> : <img src={activeItem.src} alt={activeItem.alt} />}
        </div>
      </div>, document.body)}
      </div>
      <button className="motion-wall-toggle" type="button" onClick={toggleExpanded} aria-label={expanded ? '收起全部' : '展开全部'} aria-expanded={expanded}><svg className="motion-wall-toggle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} /></svg></button>
    </div>
  );
}
