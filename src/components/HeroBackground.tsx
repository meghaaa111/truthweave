import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 55;

const HeroBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const particles: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      size: number;
      pulse: number;
      pulseSpeed: number;
    }[] = [];

    const resize = () => {
      width = canvas.parentElement?.clientWidth ?? window.innerWidth;
      height = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const init = () => {
      resize();
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * 300 + 200,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          vz: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.2 + 0.6,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    const drawGrid = () => {
      const spacing = 40;
      ctx.strokeStyle = "hsla(198, 38%, 43%, 0.08)";
      ctx.lineWidth = 0.6;
      for (let x = 0; x <= width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw subtle dots at intersections in Glacier & Slate Blue
      ctx.fillStyle = "hsla(199, 36%, 55%, 0.15)";
      for (let x = 0; x <= width; x += spacing) {
        for (let y = 0; y <= height; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.pulse += p.pulseSpeed;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        if (p.z < 150 || p.z > 500) p.vz *= -1;

        const scale = 250 / p.z;
        const r = p.size * scale;
        const pulseAlpha = 0.5 + Math.sin(p.pulse) * 0.3;
        const alpha = Math.min(scale * 0.5, 0.6) * pulseAlpha;

        // Soft Turquoise/Slate Blue glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
        gradient.addColorStop(0, `hsla(198, 38%, 43%, ${alpha * 0.25})`);
        gradient.addColorStop(0.5, `hsla(199, 36%, 55%, ${alpha * 0.1})`);
        gradient.addColorStop(1, `hsla(189, 40%, 80%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        // Particle dot in Slate Blue / Turquoise
        ctx.fillStyle = `hsla(198, 38%, 43%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines in Turquoise/Glacier
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.strokeStyle = `hsla(198, 38%, 43%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-neuro-bg">
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="absolute -top-40 -right-40 w-[550px] h-[550px] rounded-full bg-[#629BB5]/15 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] rounded-full bg-[#B9D8E1]/25 blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#D6EBF3]/40 blur-3xl" />
    </div>
  );
};

export default HeroBackground;
