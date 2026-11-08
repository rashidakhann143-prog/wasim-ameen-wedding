import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  opacity: number;
  wobble: number;
}

const PETAL_COLORS = [
  '#9b1b3b', // Deep crimson rose
  '#c42e53', // Ruby red
  '#dc5676', // Soft pink rose
  '#7a1129', // Burgundy
  '#d4af37', // Gold shimmer flake
];

export default function RosePetalsCanvas({ isEnabled }: { isEnabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Initial petals
    const count = Math.min(28, Math.floor(width / 16));
    const petals: Petal[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 9 + 8,
      speedY: Math.random() * 1.2 + 0.8,
      speedX: Math.random() * 1 - 0.5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      opacity: Math.random() * 0.4 + 0.45,
      wobble: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.wobble += 0.02;
        p.x += p.speedX + Math.sin(p.wobble) * 0.7;
        p.rotation += p.rotationSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        // Draw curved rose petal
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size * 1.4);
        ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
        ctx.fillStyle = p.color;
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ touchAction: 'none' }}
    />
  );
}
