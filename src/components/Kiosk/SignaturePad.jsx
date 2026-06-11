import { useRef, useEffect, useState, useCallback } from "react";

const STROKE_COLOR = "#111111";
const MIN_LINE_WIDTH = 1.75;
const MAX_LINE_WIDTH = 3.25;
const VELOCITY_FILTER = 0.85;

function getDpr() {
  return Math.min(Math.max(window.devicePixelRatio || 1, 2), 3);
}

function getPoint(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const source = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
    time: Date.now(),
  };
}

function lineWidthFromVelocity(velocity) {
  return Math.max(MAX_LINE_WIDTH / (velocity + 1), MIN_LINE_WIDTH);
}

function createContext(canvas) {
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = STROKE_COLOR;
  ctx.fillStyle = "#ffffff";
  ctx.imageSmoothingEnabled = true;
  if ("imageSmoothingQuality" in ctx) {
    ctx.imageSmoothingQuality = "high";
  }
  return ctx;
}

function paintBackground(ctx, width, height) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function configureCanvas(canvas) {
  const dpr = getDpr();
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(rect.width, 1);
  const cssHeight = Math.max(rect.height, 1);

  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);

  const ctx = createContext(canvas);
  paintBackground(ctx, canvas.width, canvas.height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, dpr, cssWidth, cssHeight };
}

function drawStroke(ctx, points) {
  if (!points.length) return;

  ctx.strokeStyle = STROKE_COLOR;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (points.length === 1) {
    const point = points[0];
    ctx.fillStyle = STROKE_COLOR;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i += 1) {
    const point = points[i];
    const next = points[i + 1];
    ctx.lineWidth = point.width;
    ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
  }

  const last = points[points.length - 1];
  const previous = points[points.length - 2];
  ctx.lineWidth = last.width;
  ctx.quadraticCurveTo(previous.x, previous.y, last.x, last.y);
  ctx.stroke();
}

function redrawStrokes(ctx, strokes) {
  strokes.forEach((stroke) => drawStroke(ctx, stroke));
}

function addPointToStroke(stroke, point) {
  const last = stroke[stroke.length - 1];
  const velocity = last
    ? Math.min(Math.hypot(point.x - last.x, point.y - last.y) / Math.max(point.time - last.time, 1), 2.5)
    : 0;
  const lastWidth = last?.width ?? MAX_LINE_WIDTH;
  const width = lastWidth * VELOCITY_FILTER + lineWidthFromVelocity(velocity) * (1 - VELOCITY_FILTER);

  stroke.push({ ...point, width });
}

export default function SignaturePad({ onChange, label = "Podpis pacjenta" }) {
  const canvasRef = useRef(null);
  const strokesRef = useRef([]);
  const activeStrokeRef = useRef(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const drawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const exportSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) {
      onChange?.("");
      return;
    }
    onChange?.(canvas.toDataURL("image/png"));
  }, [isEmpty, onChange]);

  const repaint = useCallback((canvas = canvasRef.current) => {
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const sizeChanged =
      width !== lastSizeRef.current.width || height !== lastSizeRef.current.height || canvas.width === 0;

    if (sizeChanged) {
      lastSizeRef.current = { width, height };
      configureCanvas(canvas);
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const dpr = getDpr();
    paintBackground(ctx, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    redrawStrokes(ctx, strokesRef.current);
    if (activeStrokeRef.current?.length) {
      drawStroke(ctx, activeStrokeRef.current);
    }

    return ctx;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    repaint(canvas);

    const observer = new ResizeObserver(() => {
      repaint(canvas);
    });
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [repaint]);

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawingRef.current = true;
    const point = getPoint(canvas, e);
    activeStrokeRef.current = [{ ...point, width: MAX_LINE_WIDTH }];
    repaint(canvas);

    if (isEmpty) setIsEmpty(false);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const stroke = activeStrokeRef.current;
    if (!canvas || !stroke?.length) return;

    const point = getPoint(canvas, e);
    const last = stroke[stroke.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < 0.5) return;

    addPointToStroke(stroke, point);
    repaint(canvas);
  };

  const endDraw = (e) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current = false;

    const stroke = activeStrokeRef.current;
    if (stroke?.length) {
      strokesRef.current.push(stroke);
      activeStrokeRef.current = null;
      repaint(canvasRef.current);
    }

    exportSignature();
  };

  const clear = () => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    drawingRef.current = false;
    repaint(canvasRef.current);
    setIsEmpty(true);
    onChange?.("");
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-48 cursor-crosshair block"
          style={{ touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          onTouchCancel={endDraw}
        />
      </div>
      <button
        type="button"
        onClick={clear}
        className="mt-2 text-sm text-teal-700 hover:text-teal-900 font-medium"
      >
        Wyczyść podpis
      </button>
    </div>
  );
}
