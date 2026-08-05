import { useRef, useEffect, useState, useCallback } from "react";

export default function SignaturePad({ onChange, label = "Podpis pacjenta" }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const activePointerId = useRef(null);
  const hasDrawn = useRef(false);
  const changeTimeoutRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const applyStrokeStyle = (ctx) => {
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  };

  const emitChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }

    changeTimeoutRef.current = setTimeout(() => {
      const dataUrl = hasDrawn.current ? canvas.toDataURL("image/png") : "";
      onChangeRef.current?.(dataUrl);
      changeTimeoutRef.current = null;
    }, 150);
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || drawing.current) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const nextW = width * dpr;
    const nextH = height * dpr;

    if (canvas.width === nextW && canvas.height === nextH) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyStrokeStyle(ctx);
      return;
    }

    let snapshot = null;
    if (hasDrawn.current && canvas.width > 0 && canvas.height > 0) {
      snapshot = canvas.toDataURL("image/png");
    }

    canvas.width = nextW;
    canvas.height = nextH;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPoint = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const markDrawn = () => {
      if (!hasDrawn.current) {
        hasDrawn.current = true;
        setHasContent(true);
      }
    };

    const detachWindowListeners = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("blur", onBlur);
      // Stop page scroll while drawing on touch devices
      window.removeEventListener("touchmove", onBlockTouchScroll);
    };

    const finishStroke = () => {
      if (!drawing.current) return;
      drawing.current = false;
      lastPoint.current = null;
      activePointerId.current = null;
      detachWindowListeners();
      emitChange();
    };

    const onBlockTouchScroll = (e) => {
      if (drawing.current) e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!drawing.current) return;
      if (
        activePointerId.current != null &&
        e.pointerId !== activePointerId.current
      ) {
        return;
      }

      // Only draw while the pointer is down (buttons === 0 can happen on some devices)
      if (e.pointerType === "mouse" && e.buttons === 0) {
        finishStroke();
        return;
      }

      e.preventDefault();
      const point = getPoint(e.clientX, e.clientY);
      const last = lastPoint.current;
      if (last) {
        const dx = point.x - last.x;
        const dy = point.y - last.y;
        if (dx * dx + dy * dy < 0.5) return;

        const ctx = canvas.getContext("2d");
        applyStrokeStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
      lastPoint.current = point;
      markDrawn();
    };

    const onPointerUp = (e) => {
      if (!drawing.current) return;
      if (
        activePointerId.current != null &&
        e.pointerId !== activePointerId.current
      ) {
        return;
      }
      finishStroke();
    };

    const onBlur = () => {
      finishStroke();
    };

    const onPointerDown = (e) => {
      if (e.isPrimary === false) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      // Recover if a previous stroke never received pointerup
      if (drawing.current) {
        finishStroke();
      }

      e.preventDefault();
      drawing.current = true;
      activePointerId.current = e.pointerId;

      const point = getPoint(e.clientX, e.clientY);
      lastPoint.current = point;

      const ctx = canvas.getContext("2d");
      applyStrokeStyle(ctx);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
      ctx.fillStyle = "#1f2937";
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      markDrawn();

      // Listen on window so move/up still arrive if the finger leaves the canvas
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp, { passive: false });
      window.addEventListener("pointercancel", onPointerUp, { passive: false });
      window.addEventListener("blur", onBlur);
      window.addEventListener("touchmove", onBlockTouchScroll, { passive: false });
    };

    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });

    return () => {
      finishStroke();
      canvas.removeEventListener("pointerdown", onPointerDown);
      detachWindowListeners();
    };
  }, [emitChange]);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    drawing.current = false;
    lastPoint.current = null;
    activePointerId.current = null;
    hasDrawn.current = false;
    setHasContent(false);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    applyStrokeStyle(ctx);

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }

    onChangeRef.current?.("");
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
