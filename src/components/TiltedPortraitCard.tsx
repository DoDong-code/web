import { type MouseEvent, type ReactNode, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

const springValues = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

type TiltedPortraitCardProps = {
  children: ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  perspective?: number;
};

export default function TiltedPortraitCard({
  children,
  className = '',
  rotateAmplitude = 24,
  scaleOnHover = 1.025,
  perspective = 820,
}: TiltedPortraitCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), springValues);
  const rotateY = useSpring(useMotionValue(0), springValues);
  const scale = useSpring(1, springValues);
  const textRotateX = useSpring(useMotionValue(0), springValues);
  const textRotateY = useSpring(useMotionValue(0), springValues);
  const textX = useSpring(useMotionValue(0), springValues);
  const textY = useSpring(useMotionValue(0), springValues);

  useEffect(() => {
    const textLayer = ref.current?.parentElement?.querySelector<HTMLElement>('.portrait-text-layer');
    if (!textLayer) return;

    const updateTextLayer = () => {
      textLayer.style.setProperty('--text-rotate-x', `${textRotateX.get()}deg`);
      textLayer.style.setProperty('--text-rotate-y', `${textRotateY.get()}deg`);
      textLayer.style.setProperty('--text-x', `${textX.get()}px`);
      textLayer.style.setProperty('--text-y', `${textY.get()}px`);
    };

    const unsubscribers = [
      textRotateX.on('change', updateTextLayer),
      textRotateY.on('change', updateTextLayer),
      textX.on('change', updateTextLayer),
      textY.on('change', updateTextLayer),
    ];
    updateTextLayer();
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [textRotateX, textRotateY, textX, textY]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    const normalizedX = offsetX / (rect.width / 2);
    const normalizedY = offsetY / (rect.height / 2);

    rotateX.set(-normalizedY * rotateAmplitude);
    rotateY.set(normalizedX * rotateAmplitude);
    textRotateX.set(-normalizedY * rotateAmplitude * 0.95);
    textRotateY.set(normalizedX * rotateAmplitude * 0.95);
    textX.set(offsetX * 0.002);
    textY.set(offsetY * 0.002);
  };

  const handleMouseEnter = () => {
    scale.set(scaleOnHover);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    textRotateX.set(0);
    textRotateY.set(0);
    textX.set(0);
    textY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          transformPerspective: perspective,
          transformStyle: 'preserve-3d',
        }}
    >
      {children}
    </motion.div>
  );
}
