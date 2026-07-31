import { useEffect, useRef, useState, type ImgHTMLAttributes, type VideoHTMLAttributes } from 'react';

type MediaKind = 'image' | 'video';
type MediaState = 'IDLE' | 'LOADING' | 'BUFFERING' | 'READY' | 'ERROR';

export type MediaProgressLoaderProps = {
  src: string;
  type: MediaKind;
  poster?: string;
  active?: boolean;
  alt?: string;
  className?: string;
  onReady?: (element: HTMLImageElement | HTMLVideoElement) => void;
  onError?: () => void;
  onMetadata?: (width: number, height: number) => void;
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'onLoad' | 'onError'>;
  videoProps?: Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'poster' | 'onCanPlay' | 'onLoadedData' | 'onError' | 'onLoadedMetadata'>;
};

const activeLoads = new Map<string, Promise<string>>();
const loadedSources = new Set<string>();

async function streamToBlobUrl(src: string, onProgress: (value: number | null) => void, signal: AbortSignal) {
  const existing = activeLoads.get(src);
  if (existing) return existing;
  const request = (async () => {
    const response = await fetch(src, { signal, credentials: 'same-origin' });
    if (!response.ok || !response.body) throw new Error(`Media request failed: ${response.status}`);
    const total = Number(response.headers.get('content-length'));
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    onProgress(0);
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      chunks.push(result.value);
      received += result.value.byteLength;
      onProgress(Number.isFinite(total) && total > 0 ? Math.min(100, (received / total) * 100) : null);
    }
    onProgress(100);
    return URL.createObjectURL(new Blob(chunks, { type: response.headers.get('content-type') || undefined }));
  })();
  activeLoads.set(src, request);
  try {
    return await request;
  } finally {
    activeLoads.delete(src);
  }
}

export default function MediaProgressLoader({ src, type, poster, active = true, alt = '', className, onReady, onError, onMetadata, imgProps, videoProps }: MediaProgressLoaderProps) {
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const onErrorRef = useRef(onError);
  const [state, setState] = useState<MediaState>(active ? (loadedSources.has(src) ? 'READY' : 'LOADING') : 'IDLE');
  const [progress, setProgress] = useState<number | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [useNativeSource, setUseNativeSource] = useState(false);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!active) {
      setState('IDLE');
      setProgress(null);
      setObjectUrl(null);
      setUseNativeSource(false);
      return;
    }
    if (loadedSources.has(src)) {
      setState('READY');
      setProgress(100);
      setUseNativeSource(true);
      return;
    }
    const controller = new AbortController();
    let disposed = false;
    setState('LOADING');
    setProgress(0);
    setUseNativeSource(false);
    streamToBlobUrl(src, setProgress, controller.signal)
      .then((url) => {
        if (disposed) { URL.revokeObjectURL(url); return; }
        if (type === 'video') setState('BUFFERING');
        setObjectUrl(url);
      })
      .catch(() => {
        if (!disposed && !controller.signal.aborted) {
          setUseNativeSource(true);
          setState('LOADING');
        }
      });
    return () => { disposed = true; controller.abort(); };
  }, [active, src, type]);

  useEffect(() => () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const handleReady = (element: HTMLImageElement | HTMLVideoElement) => {
    mediaRef.current = element;
    setState('READY');
    setProgress(100);
    onReady?.(element);
  };

  const loading = state === 'LOADING' || state === 'BUFFERING';
  return (
    <div className={`media-progress-loader${loading ? ' is-loading' : ''}${state === 'READY' ? ' is-ready' : ''}${state === 'ERROR' ? ' is-error' : ''}`}>
      {poster ? <img className="media-progress-loader__poster" src={poster} alt="" aria-hidden="true" /> : null}
      {(objectUrl || useNativeSource) && type === 'image' ? (
        <img {...imgProps} className={`media-progress-loader__media ${className || ''}`} src={objectUrl || src} alt={alt} onLoad={(event) => {
          const image = event.currentTarget;
          loadedSources.add(src);
          onMetadata?.(image.naturalWidth, image.naturalHeight);
          handleReady(image);
        }} onError={() => { setState('ERROR'); onErrorRef.current?.(); }} />
      ) : null}
      {(objectUrl || useNativeSource) && type === 'video' ? (
        <video {...videoProps} className={`media-progress-loader__media ${className || ''}`} src={objectUrl || src} poster={poster} onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          loadedSources.add(src);
          onMetadata?.(video.videoWidth, video.videoHeight);
        }} onLoadedData={(event) => handleReady(event.currentTarget)} onCanPlay={(event) => handleReady(event.currentTarget)} onError={() => { setState('ERROR'); onErrorRef.current?.(); }} />
      ) : null}
      {loading ? <div className="media-progress-loader__indicator" aria-live="polite"><span className="media-progress-loader__ring" />{progress === null ? <span className="media-progress-loader__label">Loading</span> : <span className="media-progress-loader__label">{Math.round(progress)}%</span>}</div> : null}
    </div>
  );
}
