import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * Signature pad for kiosk / iPad.
 * Drawing is only allowed in the full-screen modal — the inline area is a preview/CTA.
 */
export default function SignaturePad({
  onChange,
  label = "Podpis pacjenta",
  value = "",
}) {
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
    if (!modalOpen) return undefined;
    lockBodyScroll();
    const canvas = modalCanvasRef.current;
    const source = value || "";
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
    (canvas, { lockScrollOnStroke }) => {
      if (!canvas) return () => {};

      const getPoint = (e) => {
        if (
          e.target === canvas &&
          Number.isFinite(e.offsetX) &&
          Number.isFinite(e.offsetY) &&
          !(e.pointerType !== "mouse" && e.offsetX === 0 && e.offsetY === 0)
        ) {
          return { x: e.offsetX, y: e.offsetY };
        }

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
    [lockBodyScroll, unlockBodyScroll]
  );

  useEffect(() => {
    if (!modalOpen) return undefined;
    return bindPad(modalCanvasRef.current, {
      lockScrollOnStroke: false,
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
    wipe(modalCanvasRef.current);
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    onChangeRef.current?.("");
  };

  const clearModalOnly = () => {
    wipe(modalCanvasRef.current);
    hasDrawn.current = false;
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
      onChangeRef.current?.(dataUrl);
    } else {
      // Empty canvas + save clears any previous signature
      hasDrawn.current = false;
      setHasContent(false);
      onChangeRef.current?.("");
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
      <div className="flex justify-between items-center mb-3 gap-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hasContent && (
          <span className="text-xs text-green-700 font-semibold shrink-0 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            ✓ Podpisano
          </span>
        )}
      </div>

      {!hasContent ? (
        <button
          type="button"
          onClick={openModal}
          className="group w-full min-h-[10.5rem] rounded-2xl border-2 border-teal-600 bg-gradient-to-b from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-700/25 hover:from-teal-500 hover:to-teal-700 hover:shadow-xl active:scale-[0.99] transition-all touch-manipulation px-6 py-8 text-center"
          aria-label={`${label} — kliknij, aby otworzyć okno podpisu`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40 text-3xl"
              aria-hidden
            >
              ✍️
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
              Kliknij, aby podpisać dokument
            </span>
            <span className="text-sm sm:text-base font-medium text-teal-50/95 max-w-md leading-snug">
              Otworzy się pełny ekran — podpiszesz palcem lub rysikiem, potem zatwierdzisz
            </span>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl border-2 border-green-400 bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={openModal}
            className="w-full text-left hover:bg-green-50/40 transition-colors touch-manipulation"
            aria-label={`${label} — otwórz, aby edytować podpis`}
          >
            {value ? (
              <img
                src={value}
                alt="Podgląd podpisu"
                className="w-full h-36 object-contain pointer-events-none select-none bg-white"
                draggable={false}
              />
            ) : null}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-green-100 bg-green-50/60">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-teal-800 hover:text-teal-950 font-medium transition-colors"
            >
              Wyczyść podpis
            </button>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 px-4 py-2.5 rounded-xl transition-colors touch-manipulation"
            >
              Edytuj podpis
            </button>
          </div>
        </div>
      )}

      {modal}
    </div>
  );
}
