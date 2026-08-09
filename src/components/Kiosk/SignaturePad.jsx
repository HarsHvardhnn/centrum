import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Signature pad for kiosk / iPad.
 * Touch "downward drift" is usually page scroll moving getBoundingClientRect() mid-stroke.
 * We lock body scroll while drawing and offer a full-screen modal signer.
 */
export default function SignaturePad({
  onChange,
  label = "Podpis pacjenta",
  value = "",
}) {
  const canvasRef = useRef(null);
  const modalCanvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPoint = useRef(null);
  const activePointerId = useRef(null);
  const strokeRect = useRef(null);
  const hasDrawn = useRef(false);
  const changeTimeoutRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const lockedScrollY = useRef(0);
  const scrollLockCount = useRef(0);
  const [hasContent, setHasContent] = useState(
    !!(value && value !== "data:image/png;base64,")
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const has = !!(value && value !== "data:image/png;base64,");
    hasDrawn.current = has;
    setHasContent(has);
  }, [value]);

  const applyStrokeStyle = (ctx) => {
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  };

  const lockBodyScroll = useCallback(() => {
    scrollLockCount.current += 1;
    if (scrollLockCount.current > 1) return;
    lockedScrollY.current = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY.current}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
  }, []);

  const unlockBodyScroll = useCallback(() => {
    scrollLockCount.current = Math.max(0, scrollLockCount.current - 1);
    if (scrollLockCount.current > 0) return;
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    body.style.touchAction = "";
    window.scrollTo(0, lockedScrollY.current || 0);
  }, []);

  const emitChange = useCallback((canvas) => {
    if (!canvas) return;
    if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
    changeTimeoutRef.current = setTimeout(() => {
      const dataUrl = hasDrawn.current ? canvas.toDataURL("image/png") : "";
      onChangeRef.current?.(dataUrl);
      changeTimeoutRef.current = null;
    }, 100);
  }, []);

  const setupCanvas = useCallback((canvas, restoreFrom) => {
    if (!canvas || drawing.current) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const nextW = Math.floor(width * dpr);
    const nextH = Math.floor(height * dpr);

    if (canvas.width === nextW && canvas.height === nextH) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyStrokeStyle(ctx);
      return;
    }

    let snapshot = restoreFrom || null;
    if (!snapshot && hasDrawn.current && canvas.width > 0 && canvas.height > 0) {
      try {
        snapshot = canvas.toDataURL("image/png");
      } catch {
        snapshot = null;
      }
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

  const paintValueOnto = useCallback((canvas, dataUrl) => {
    if (!canvas || !dataUrl) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const img = new Image();
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyStrokeStyle(ctx);
    };
    img.src = dataUrl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setupCanvas(canvas, value || null);
    const t = setTimeout(() => setupCanvas(canvas, value || null), 80);
    const onResize = () => {
      if (drawing.current) return;
      const snap = hasDrawn.current ? canvas.toDataURL("image/png") : value || null;
      setupCanvas(canvas, snap);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [setupCanvas, value]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    lockBodyScroll();
    const canvas = modalCanvasRef.current;
    const source =
      value ||
      (hasDrawn.current && canvasRef.current
        ? canvasRef.current.toDataURL("image/png")
        : "");
    const id = requestAnimationFrame(() => {
      if (!canvas) return;
      setupCanvas(canvas, source || null);
      if (source) paintValueOnto(canvas, source);
    });
    const onResize = () => {
      if (drawing.current || !modalCanvasRef.current) return;
      const snap = hasDrawn.current
        ? modalCanvasRef.current.toDataURL("image/png")
        : source || null;
      setupCanvas(modalCanvasRef.current, snap);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
      unlockBodyScroll();
    };
  }, [modalOpen, zoom, setupCanvas, paintValueOnto, value, lockBodyScroll, unlockBodyScroll]);

  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) clearTimeout(changeTimeoutRef.current);
      scrollLockCount.current = 0;
      const body = document.body;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, []);

  const bindPad = useCallback(
    (canvas, { emitLive, lockScrollOnStroke }) => {
      if (!canvas) return () => {};

      const getPoint = (e) => {
        // Prefer event offsets when the event target is the canvas itself
        // (layout coords — unaffected by page scroll).
        if (
          e.target === canvas &&
          Number.isFinite(e.offsetX) &&
          Number.isFinite(e.offsetY) &&
          !(e.pointerType !== "mouse" && e.offsetX === 0 && e.offsetY === 0)
        ) {
          return { x: e.offsetX, y: e.offsetY };
        }

        // Use rect frozen at pointerdown so scroll mid-stroke can't shift Y
        const rect = strokeRect.current || canvas.getBoundingClientRect();
        const scaleX = rect.width / Math.max(1, canvas.clientWidth);
        const scaleY = rect.height / Math.max(1, canvas.clientHeight);
        return {
          x: (e.clientX - rect.left) / (scaleX || 1),
          y: (e.clientY - rect.top) / (scaleY || 1),
        };
      };

      const markDrawn = () => {
        if (!hasDrawn.current) {
          hasDrawn.current = true;
          setHasContent(true);
        } else {
          hasDrawn.current = true;
        }
      };

      const stopTouchScroll = (e) => {
        if (drawing.current) e.preventDefault();
      };

      const detachWindowListeners = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("blur", onBlur);
        window.removeEventListener("touchmove", stopTouchScroll);
      };

      const finishStroke = () => {
        if (!drawing.current) return;
        const pid = activePointerId.current;
        drawing.current = false;
        lastPoint.current = null;
        activePointerId.current = null;
        strokeRect.current = null;
        try {
          if (pid != null) canvas.releasePointerCapture?.(pid);
        } catch {
          /* ignore */
        }
        detachWindowListeners();
        if (lockScrollOnStroke) unlockBodyScroll();
        if (emitLive) emitChange(canvas);
      };

      const onPointerMove = (e) => {
        if (!drawing.current) return;
        if (activePointerId.current != null && e.pointerId !== activePointerId.current) {
          return;
        }
        if (e.pointerType === "mouse" && e.buttons === 0) {
          finishStroke();
          return;
        }
        e.preventDefault();
        const point = getPoint(e);
        const last = lastPoint.current;
        if (last) {
          const dx = point.x - last.x;
          const dy = point.y - last.y;
          if (dx * dx + dy * dy < 0.2) return;
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
        if (activePointerId.current != null && e.pointerId !== activePointerId.current) {
          return;
        }
        finishStroke();
      };

      const onBlur = () => finishStroke();

      const onPointerDown = (e) => {
        if (e.isPrimary === false) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (drawing.current) finishStroke();

        e.preventDefault();
        e.stopPropagation();

        if (lockScrollOnStroke) lockBodyScroll();

        drawing.current = true;
        activePointerId.current = e.pointerId;
        // Freeze geometry for the whole stroke
        strokeRect.current = canvas.getBoundingClientRect();

        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }

        const point = getPoint(e);
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

        window.addEventListener("pointermove", onPointerMove, { passive: false });
        window.addEventListener("pointerup", onPointerUp, { passive: false });
        window.addEventListener("pointercancel", onPointerUp, { passive: false });
        window.addEventListener("blur", onBlur);
        window.addEventListener("touchmove", stopTouchScroll, { passive: false });
      };

      canvas.addEventListener("pointerdown", onPointerDown, { passive: false });

      return () => {
        finishStroke();
        canvas.removeEventListener("pointerdown", onPointerDown);
        detachWindowListeners();
      };
    },
    [emitChange, lockBodyScroll, unlockBodyScroll]
  );

  useEffect(
    () => bindPad(canvasRef.current, { emitLive: true, lockScrollOnStroke: true }),
    [bindPad]
  );

  useEffect(() => {
    if (!modalOpen) return undefined;
    // Modal: don't push to form until "Zapisz podpis"
    return bindPad(modalCanvasRef.current, {
      emitLive: false,
      lockScrollOnStroke: false, // body already locked by modal
    });
  }, [bindPad, modalOpen, zoom]);

  const wipe = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    drawing.current = false;
    lastPoint.current = null;
    activePointerId.current = null;
    strokeRect.current = null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    applyStrokeStyle(ctx);
  };

  const clearAll = () => {
    hasDrawn.current = false;
    setHasContent(false);
    wipe(canvasRef.current);
    wipe(modalCanvasRef.current);
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    onChangeRef.current?.("");
  };

  const clearModalOnly = () => {
    wipe(modalCanvasRef.current);
    // Keep parent signature until user confirms empty or cancels
    hasDrawn.current = !!(value && value !== "data:image/png;base64,");
    setHasContent(hasDrawn.current);
  };

  const openModal = () => {
    setZoom(1);
    setModalOpen(true);
  };

  const confirmModal = () => {
    const modal = modalCanvasRef.current;
    if (!modal) {
      setModalOpen(false);
      return;
    }
    // Detect non-empty canvas
    const ctx = modal.getContext("2d");
    const pixels = ctx.getImageData(0, 0, modal.width, modal.height).data;
    let ink = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 10) {
        ink = true;
        break;
      }
    }
    if (ink) {
      const dataUrl = modal.toDataURL("image/png");
      hasDrawn.current = true;
      setHasContent(true);
      if (canvasRef.current) {
        setupCanvas(canvasRef.current, dataUrl);
        paintValueOnto(canvasRef.current, dataUrl);
      }
      onChangeRef.current?.(dataUrl);
    }
    setModalOpen(false);
  };

  const modal = modalOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[10050] flex flex-col bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          style={{ touchAction: "none" }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-gray-200">
            <div className="min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">{label}</p>
              <p className="text-xs text-gray-500">
                Podpisz tutaj — ekran jest zablokowany, bez przewijania strony
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-gray-50 rounded-lg p-1 border border-gray-200">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                className="w-10 h-10 rounded-md text-lg font-bold text-gray-700 hover:bg-white"
                aria-label="Pomniejsz"
              >
                −
              </button>
              <span className="text-sm tabular-nums text-gray-600 w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}
                className="w-10 h-10 rounded-md text-lg font-bold text-gray-700 hover:bg-white"
                aria-label="Powiększ"
              >
                +
              </button>
            </div>
          </div>

          <div
            className="flex-1 min-h-0 p-3 overflow-auto overscroll-contain bg-gray-200"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div
              className="mx-auto bg-white rounded-xl border-2 border-teal-500 overflow-hidden touch-none shadow-lg"
              style={{
                width: `${Math.round(zoom * 100)}%`,
                maxWidth: "100%",
                minHeight: "58vh",
              }}
            >
              <canvas
                ref={modalCanvasRef}
                className="w-full cursor-crosshair touch-none select-none block"
                style={{
                  touchAction: "none",
                  WebkitTouchCallout: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                  height: "58vh",
                  minHeight: "58vh",
                }}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white border-t border-gray-200">
            <button
              type="button"
              onClick={clearModalOnly}
              className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
            >
              Wyczyść
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={confirmModal}
                className="px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold"
              >
                Zapisz podpis
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 gap-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hasContent && (
          <span className="text-xs text-green-600 font-medium shrink-0">✓ Podpisano</span>
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

      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-teal-700 hover:text-teal-900 font-medium transition-colors"
          >
            🗑️ Wyczyść podpis
          </button>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 px-3 py-2 rounded-lg transition-colors touch-manipulation"
          >
            ⛶ Podpisz na pełnym ekranie
          </button>
        </div>
        {!hasContent && (
          <p className="text-xs text-gray-500">
            Na tablecie użyj pełnego ekranu — dokładniejszy podpis
          </p>
        )}
      </div>

      {modal}
    </div>
  );
}
