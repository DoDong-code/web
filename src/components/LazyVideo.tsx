import { useEffect, useRef } from 'react';
import type { VideoHTMLAttributes } from 'react';

type LazyVideoProps = Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  rootMargin?: string;
};

export default function LazyVideo({
  src,
  poster,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'metadata',
  rootMargin = '300px',
  ...videoProps
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadVideo = () => {
      if (hasLoadedRef.current) return;
      video.src = src;
      hasLoadedRef.current = true;
      video.load();
    };

    const playVideo = () => {
      if (!autoPlay) return;
      loadVideo();
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(() => {
          // Autoplay can still be blocked by browser policy in rare cases.
        });
      }
    };

    const pauseVideo = () => {
      if (!video.paused) video.pause();
    };

    if (!('IntersectionObserver' in window)) {
      loadVideo();
      playVideo();
      return () => pauseVideo();
    }

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadVideo();
          loadObserver.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    const playbackObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);
        if (isVisible) {
          playVideo();
        } else {
          pauseVideo();
        }
      },
      { rootMargin: '0px', threshold: 0.12 }
    );

    loadObserver.observe(video);
    playbackObserver.observe(video);

    return () => {
      pauseVideo();
      loadObserver.disconnect();
      playbackObserver.disconnect();
    };
  }, [autoPlay, rootMargin, src]);

  return (
    <video
      ref={videoRef}
      data-src={src}
      poster={poster}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={preload}
      {...videoProps}
    />
  );
}
