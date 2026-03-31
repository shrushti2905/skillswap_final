import { useEffect, useRef } from "react";

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; z: number; radius: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 3000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width - canvas.width / 2,
          y: Math.random() * canvas.height - canvas.height / 2,
          z: Math.random() * 2000,
          radius: Math.random() * 1.5 + 0.5,
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = "rgba(25, 30, 45, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        star.z -= 2;
        if (star.z <= 0) {
          star.x = Math.random() * canvas.width - cx;
          star.y = Math.random() * canvas.height - cy;
          star.z = 2000;
        }

        const x = cx + (star.x / star.z) * 1000;
        const y = cy + (star.y / star.z) * 1000;

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) continue;

        const size = Math.max(0, star.radius * (1000 / star.z));
        
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (i % 20 === 0 && size > 1) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(124, 58, 237, 0.15)"; // primary color
            ctx.moveTo(x, y);
            const nextStar = stars[(i + 1) % stars.length];
            const nx = cx + (nextStar.x / nextStar.z) * 1000;
            const ny = cy + (nextStar.y / nextStar.z) * 1000;
            ctx.lineTo(nx, ny);
            ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{ background: "hsl(225 30% 10%)" }}
    />
  );
}
