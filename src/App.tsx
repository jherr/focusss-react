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

const Focusss = ({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();
  const { width, height } = useWindowSize();
  const currentFocus = useRef<HTMLElement>();
  const head = useRef<Target>({
    x: undefined,
    y: undefined,
    tx: 0,
    ty: 0,
    vx: 0,
    vy: 0,
  });
  const tail = useRef<Target[]>([]);

  const onFocus = useCallback(
    (element?: HTMLElement) => {
      const previousFocus = currentFocus.current;

      if (element) currentFocus.current = element;

      if (!currentFocus.current) return;

      head.current.tx = currentFocus.current.offsetLeft - 12 - radius;
      head.current.ty =
        currentFocus.current.offsetTop + currentFocus.current.offsetHeight / 2;

      if (head.current.x === undefined) {
        head.current.x = head.current.tx;
        head.current.y = head.current.ty;
      }

      if (currentFocus.current !== previousFocus) {
        head.current.vx = -8 - Math.abs(head.current.tx - head.current.x) / 5;
      }
    },
    [radius]
  );

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d")!;

      const paint = () => {
        if (!contextRef.current) {
          return;
        }

        contextRef.current.clearRect(0, 0, width, height);
        if (currentFocus.current) {
          // Add to the tail
          tail.current.push({ ...head.current });
          if (tail.current.length > tailLength) tail.current.shift();

          // Paint the tail
          if (tail.current.length > 3) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(
              tail.current[0].x ?? 0,
              tail.current[0].y ?? 0
            );

            for (var i = 2; i < tail.current.length - 2; i++) {
              const p1 = tail.current[i];
              const p2 = tail.current[i + 1];

              contextRef.current.quadraticCurveTo(
                p1.x ?? 0,
                p1.y ?? 0,
                ((p1.x ?? 0) + (p2.x ?? 0)) / 2,
                ((p1.y ?? 0) + (p2.y ?? 0)) / 2
              );
            }

            contextRef.current.quadraticCurveTo(
              tail.current[i].x ?? 0,
              tail.current[i].y ?? 0,
              tail.current[i + 1].x ?? 0,
              tail.current[i + 1].y ?? 0
            );

            contextRef.current.lineWidth = radius;
            contextRef.current.lineCap = "round";
            contextRef.current.strokeStyle = lineColor;
            contextRef.current.stroke();
          }

          // Animate the head towards target x/y
          head.current.x =
            (head.current.x ?? 0) +
            (head.current.tx - (head.current.x ?? 0)) * 0.2;
          head.current.y =
            (head.current.y ?? 0) +
            (head.current.ty - (head.current.y ?? 0)) * 0.2;

          head.current.vx *= 0.8;
          head.current.x += head.current.vx;

          contextRef.current.beginPath();
          contextRef.current.arc(
            head.current.x,
            head.current.y,
            radius,
            0,
            Math.PI * 2
          );
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

function App() {
  return (
    <div>
      <canvas></canvas>

      <Focusss>
        {(onFocus) => (
          <div className="form-wrapper">
            <form>
              <label htmlFor="name">Name</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="text"
                id="name"
              />

              <label htmlFor="email">Email</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="text"
                id="email"
              />

              <label htmlFor="password">Password</label>
              <input
                onFocus={(evt) => onFocus(evt.target)}
                type="password"
                id="password"
              />

              <button onFocus={(evt) => onFocus(evt.target)}>
                Submit The Thing
              </button>
            </form>
          </div>
        )}
      </Focusss>
    </div>
  );
}

export default App;
