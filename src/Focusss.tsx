import * as React from "react";
import { useRef, useEffect, useCallback } from "react";
import { useWindowSize } from "react-use";

interface Target {
  x?: number;
  y?: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
}

export const Focusss = ({
  children,
  radius = 8,
  tailLength = 10,
  ballColor = "#40cb90",
  lineColor = "#2c8660",
}: {
  children: (onFocus: (element?: HTMLElement) => void) => React.ReactNode;
  radius?: number;
  tailLength?: number;
  ballColor?: string;
  lineColor?: string;
}) => {
  const state = useRef<{
    currentFocus: HTMLElement | undefined;
    head: Target;
    tail: Target[];
  }>({
    currentFocus: undefined,
    head: {
      x: undefined,
      y: undefined,
      tx: 0,
      ty: 0,
      vx: 0,
      vy: 0,
    },
    tail: [],
  });

  const onFocus = useCallback(
    (element?: HTMLElement) => {
      const { head } = state.current;

      const previousFocus = state.current.currentFocus;

      if (element) state.current.currentFocus = element;

      if (!state.current.currentFocus) return;

      const { currentFocus } = state.current;

      head.tx = currentFocus.offsetLeft - 12 - radius;
      head.ty = currentFocus.offsetTop + currentFocus.offsetHeight / 2;

      if (head.x === undefined) {
        head.x = head.tx;
        head.y = head.ty;
      }

      if (currentFocus !== previousFocus) {
        head.vx = -8 - Math.abs(head.tx - head.x) / 5;
      }
    },
    [radius]
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d")!;

      const paint = () => {
        if (!contextRef.current || !state.current) {
          return;
        }

        const { head, tail, currentFocus } = state.current;

        contextRef.current.clearRect(0, 0, width, height);
        if (currentFocus) {
          // Add to the tail
          tail.push({ ...head });
          if (tail.length > tailLength) tail.shift();

          // Paint the tail
          if (tail.length > 3) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(tail[0].x ?? 0, tail[0].y ?? 0);

            for (var i = 2; i < tail.length - 2; i++) {
              const p1 = tail[i];
              const p2 = tail[i + 1];

              contextRef.current.quadraticCurveTo(
                p1.x ?? 0,
                p1.y ?? 0,
                ((p1.x ?? 0) + (p2.x ?? 0)) / 2,
                ((p1.y ?? 0) + (p2.y ?? 0)) / 2
              );
            }

            contextRef.current.quadraticCurveTo(
              tail[i].x ?? 0,
              tail[i].y ?? 0,
              tail[i + 1].x ?? 0,
              tail[i + 1].y ?? 0
            );

            contextRef.current.lineWidth = radius;
            contextRef.current.lineCap = "round";
            contextRef.current.strokeStyle = lineColor;
            contextRef.current.stroke();
          }

          // Animate the head towards target x/y
          head.x = (head.x ?? 0) + (head.tx - (head.x ?? 0)) * 0.2;
          head.y = (head.y ?? 0) + (head.ty - (head.y ?? 0)) * 0.2;

          head.vx *= 0.8;
          head.x += head.vx;

          contextRef.current.beginPath();
          contextRef.current.arc(head.x, head.y, radius, 0, Math.PI * 2);
          contextRef.current.fillStyle = ballColor;
          contextRef.current.fill();
        }
      };

      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const redraw = () => {
        paint();
        requestAnimationFrame(redraw);
      };

      redraw();
    }
  }, [width, height, tailLength, radius, ballColor, lineColor]);

  return (
    <>
      <canvas ref={canvasRef} />
      {children(onFocus)}
    </>
  );
};
