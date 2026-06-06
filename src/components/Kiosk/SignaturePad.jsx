import { useRef, useEffect, useState, useCallback } from "react";

const STROKE_STYLE = {
  strokeStyle: "#111",
  lineWidth: 2.5,
  lineCap: "round",
  lineJoin: "round",
};

function getTouchOrMousePoint(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const source = e.touches?.[0] ?? e.changedTouches?.[0] ?? e;
  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
}

function applyStrokeStyle(ctx) {
  Object.assign(ctx, STROKE_STYLE);
}

function configureCanvas(canvas) {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(Math.floor(rect.width), 1);
  const cssHeight = Math.max(Math.floor(rect.height), 1);

  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  applyStrokeStyle(ctx);

  return { ctx, dpr, cssWidth, cssHeight };
}

export default function SignaturePad({ onChange, label = "Podpis pacjenta" }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastSize = useRef({ width: 0, height: 0 });
  const [isEmpty, setIsEmpty] = useState(true);

  const emitChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange?.(isEmpty ? "" : canvas.toDataURL("image/png"));
  }, [isEmpty, onChange]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (
      width === lastSize.current.width &&
      height === lastSize.current.height &&
      canvas.width > 0
    ) {
      return canvas.getContext("2d");
    }

    lastSize.current = { width, height };
    const { ctx } = configureCanvas(canvas);
    setIsEmpty(true);
    onChange?.("");
    return ctx;
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    initCanvas();

    const observer = new ResizeObserver(() => {
      initCanvas();
    });
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [initCanvas]);

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    applyStrokeStyle(ctx);

    drawing.current = true;
    const { x, y } = getTouchOrMousePoint(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = getTouchOrMousePoint(canvas, e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (isEmpty) setIsEmpty(false);
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    drawing.current = false;
    emitChange();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyStrokeStyle(ctx);

    setIsEmpty(true);
    onChange?.("");
  };

  useEffect(() => {
    if (!isEmpty) emitChange();
  }, [isEmpty, emitChange]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair block"
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
