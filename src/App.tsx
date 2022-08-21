import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const Cont = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const Canvas = styled.canvas`
  position: absolute;
  width: inherit;
  height: 100vh;
  z-index: -1;
  filter: blur(100px);
`;

const Board = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
`;

type Vector2 = {
  x: number;
  y: number;
};

type Circle = {
  position: Vector2;
  velocity: Vector2;
  color: string;
  radius: number;
};

function makeCircle(width: number, height: number): Circle {
  const radius = Math.random() * (300 - 100) + 50;
  const x = Math.random() * (width - radius - radius) + radius;
  const y = Math.random() * (height - radius - radius) + radius;

  const radian = Math.random() * 360;
  const speed = Math.random() * (500 - 200) + 200;
  const velocityX = speed * Math.cos(radian);
  const velocityY = speed * Math.sin(radian);

  return {
    position: { x, y },
    radius,
    velocity: { x: velocityX, y: velocityY },
    color: "#e9d2fd",
  };
}

function boundary(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

export default function LetsStart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  const width = useMemo(() => ctx?.canvas?.width ?? null, [ctx]);
  const height = useMemo(() => ctx?.canvas?.height ?? null, [ctx]);

  const frameRef = useRef<number | null>(null);

  const objects = useMemo(
    () =>
      !!width && !!height
        ? Array.from({ length: 15 }, () => makeCircle(width, height))
        : [makeCircle(1920, 1080)],
    [width, height]
  );

  const update = useCallback(
    (delta: number) => {
      for (const obj of objects) {
        obj.position.x += (obj.velocity.x * delta) / 1000;
        obj.position.y += (obj.velocity.y * delta) / 1000;

        if (
          obj.position.x - obj.radius < 0 ||
          obj.position.x + obj.radius > width!
        ) {
          obj.velocity.x *= -1;
        }

        if (
          obj.position.y - obj.radius < 0 ||
          obj.position.y + obj.radius > height!
        ) {
          obj.velocity.y *= -1;
        }
        if (width) obj.position.x = boundary(obj.position.x, obj.radius, width - obj.radius);
        if (height) obj.position.y = boundary(obj.position.y, obj.radius, height - obj.radius);
      }
    },
    [height, objects, width]
  );

  const clearRect = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (width && height) ctx.clearRect(0, 0, width + 500, height);
    },
    [width, height]
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, objects: Circle[]) => {
      clearRect(ctx);
      for (const obj of objects) {
        ctx.fillStyle = obj.color;
        ctx.beginPath();
        ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    [clearRect]
  );

  const run = useCallback(
    (previous: number) => {
      const now = Date.now();
      if (ctx) {
        update(now - previous);
        draw(ctx, objects);
      }
      frameRef.current = requestAnimationFrame(() => run(now));
    },
    [ctx, draw, objects, update]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const ctx = canvasRef.current.getContext("2d");

    if (ctx) {
      setCtx(ctx);
    }
  }, []);

  useEffect(() => {
    if (!ctx) {
      frameRef.current = null;
    }

    frameRef.current = requestAnimationFrame(() => run(Date.now()));

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [ctx, run]);

  return (
    <Cont>
      <Canvas width={1920} height={1080} ref={canvasRef} />
      <Board>HAPPY</Board>
    </Cont>
  );
}
