import { useRef, useEffect, useState, useCallback } from "react";

export default function SignaturePad({ onChange, label = "Podpis pacjenta" }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const activePointerId = useRef(null);
  const hasDrawn = useRef(false);
  const changeTimeoutRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);

  // CSS-pixel coords only — ctx is already scaled by DPR in setupCanvas
  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const applyStrokeStyle = (ctx) => {
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalCompositeOperation = "source-over";
  };

  const emitChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    changeTimeoutRef.current = setTimeout(() => {
      const dataUrl = hasDrawn.current ? canvas.toDataURL("image/png") : "";
      onChange?.(dataUrl);
      changeTimeoutRef.current = null;
    }, 150);
  }, [onChange]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    let snapshot = null;
    if (hasDrawn.current && canvas.width > 0 && canvas.height > 0) {
      snapshot = canvas.toDataURL("image/png");
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale once so drawing uses CSS pixels (avoids double-DPR bug)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    applyStrokeStyle(ctx);

    if (snapshot) {
      const img = new Image();
      img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        applyStrokeStyle(ctx);
      };
      img.src = snapshot;
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const timeoutId = setTimeout(setupCanvas, 100);
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, [setupCanvas]);

  // Native non-passive touch listeners — React's synthetic handlers are often
  // passive, so preventDefault there cannot stop page scroll on touch devices.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blockScroll = (e) => {
      e.preventDefault();
    };

    canvas.addEventListener("touchstart", blockScroll, { passive: false });
    canvas.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", blockScroll);
      canvas.removeEventListener("touchmove", blockScroll);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const markDrawn = () => {
    if (!hasDrawn.current) {
      hasDrawn.current = true;
      setHasContent(true);
    }
  };

  const startDraw = (e) => {
    if (e.button != null && e.button !== 0) return;
    if (drawing.current) return;

    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    drawing.current = true;
    activePointerId.current = e.pointerId ?? null;
    try {
      canvas.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore — capture not available
    }

    const point = getPoint(e);
    lastPoint.current = point;

    const ctx = canvas.getContext("2d");
    applyStrokeStyle(ctx);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);

    markDrawn();
  };

  const draw = (e) => {
    if (!drawing.current) return;
    if (
      activePointerId.current != null &&
      e.pointerId != null &&
      e.pointerId !== activePointerId.current
    ) {
      return;
    }

    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getPoint(e);
    const last = lastPoint.current;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx * dx + dy * dy < 1) return;
    }

    const ctx = canvas.getContext("2d");
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    lastPoint.current = point;

    markDrawn();
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    if (
      activePointerId.current != null &&
      e.pointerId != null &&
      e.pointerId !== activePointerId.current
    ) {
      return;
    }

    e.preventDefault?.();
    const canvas = canvasRef.current;
    drawing.current = false;
    lastPoint.current = null;

    if (canvas && e.pointerId != null) {
      try {
        canvas.releasePointerCapture?.(e.pointerId);
      } catch {
        // ignore
      }
    }
    activePointerId.current = null;
    emitChange();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    applyStrokeStyle(ctx);

    hasDrawn.current = false;
    drawing.current = false;
    lastPoint.current = null;
    activePointerId.current = null;
    setHasContent(false);

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }

    onChange?.("");
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hasContent && (
          <span className="text-xs text-green-600 font-medium">✓ Podpisano</span>
        )}
      </div>

      <div
        className={`border-2 rounded-xl bg-white overflow-hidden touch-none transition-colors ${
          hasContent
            ? "border-green-400 shadow-sm"
            : "border-dashed border-gray-300 hover:border-gray-400"
        }`}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none select-none"
          style={{
            touchAction: "none",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerCancel={endDraw}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={clear}
          className="text-sm text-teal-700 hover:text-teal-900 font-medium transition-colors"
        >
          🗑️ Wyczyść podpis
        </button>

        {!hasContent && (
          <p className="text-xs text-gray-500">
            Podpisz palcem lub rysikiem w powyższym polu
          </p>
        )}
      </div>
    </div>
  );
}
