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
    let rafId = 0;

    const isVideoVisible = () => {
      const rect = video.getBoundingClientRect();
      const visibleWidth = Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      return visibleWidth > 0 && visibleHeight > 0;
    };

    const loadVideo = () => {
      if (hasLoadedRef.current) return;
      video.src = src;
      hasLoadedRef.current = true;
      video.load();
    };

    const playVideo = () => {
      if (!autoPlay || !isVideoVisible() || document.hidden) return;
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

    const syncPlayback = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (isVideoVisible() && !document.hidden) {
          playVideo();
        } else {
          pauseVideo();
        }
      });
    };

    if (!('IntersectionObserver' in window)) {
      loadVideo();
      playVideo();
      window.addEventListener('scroll', syncPlayback, { passive: true });
      window.addEventListener('resize', syncPlayback);
      document.addEventListener('visibilitychange', syncPlayback);
      return () => {
        pauseVideo();
        cancelAnimationFrame(rafId);
        window.removeEventListener('scroll', syncPlayback);
        window.removeEventListener('resize', syncPlayback);
        document.removeEventListener('visibilitychange', syncPlayback);
      };
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
    window.addEventListener('scroll', syncPlayback, { passive: true });
    window.addEventListener('resize', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);

    return () => {
      pauseVideo();
      cancelAnimationFrame(rafId);
      loadObserver.disconnect();
      playbackObserver.disconnect();
      window.removeEventListener('scroll', syncPlayback);
      window.removeEventListener('resize', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
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
