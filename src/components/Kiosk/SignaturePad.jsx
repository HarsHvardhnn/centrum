import { useRef, useEffect, useState, useCallback } from "react";

export default function SignaturePad({ onChange, label = "Podpis pacjenta" }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [hasContent, setHasContent] = useState(false);
  
  // Smooth drawing state
  const lastPoint = useRef(null);
  const currentStroke = useRef([]);

  const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Get the correct client coordinates
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate coordinates relative to canvas, accounting for DPI scaling
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    
    return { x, y };
  };

  const changeTimeoutRef = useRef(null);

  // Improved change emission with immediate feedback for validation
  const emitChange = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Immediately update validation state
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const hasSignature = imageData.data.some((pixel, index) => index % 4 < 3 && pixel < 255);
    
    setHasContent(hasSignature);
    setIsEmpty(!hasSignature);
    
    // Debounce the actual onChange call for performance
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    changeTimeoutRef.current = setTimeout(() => {
      const dataUrl = hasSignature ? canvas.toDataURL("image/png") : "";
      onChange?.(dataUrl);
      changeTimeoutRef.current = null;
    }, 150); // Reduced debounce time for better responsiveness
  }, [onChange]);

  // Enhanced canvas setup with better smoothing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const setupCanvas = () => {
      const ctx = canvas.getContext("2d");
      const dpr = window.devicePixelRatio || 1;
      
      // Force a reflow to get accurate dimensions
      canvas.style.width = '';
      canvas.style.height = '';
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas logical size (CSS pixels)
      const logicalWidth = Math.floor(rect.width);
      const logicalHeight = Math.floor(rect.height);
      
      // Set canvas actual size (device pixels)
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      
      // Set canvas display size back to logical size
      canvas.style.width = logicalWidth + 'px';
      canvas.style.height = logicalHeight + 'px';
      
      // Scale the drawing context so everything draws at the correct size
      ctx.scale(dpr, dpr);
      
      // Enhanced drawing settings for smooth signatures
      ctx.strokeStyle = "#1f2937"; // Darker for better visibility
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Anti-aliasing for smoother lines
      ctx.globalCompositeOperation = 'source-over';
    };
    
    // Setup canvas immediately and also after a brief delay to ensure proper sizing
    setupCanvas();
    const timeoutId = setTimeout(setupCanvas, 100);
    
    // Handle resize events
    const handleResize = () => {
      setTimeout(setupCanvas, 50);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Smooth line drawing using quadratic curves
  const drawSmoothLine = (ctx, points) => {
    if (points.length < 2) return;
    
    const dpr = window.devicePixelRatio || 1;
    
    if (points.length === 2) {
      // Draw straight line for first segment
      ctx.beginPath();
      ctx.moveTo(points[0].x / dpr, points[0].y / dpr);
      ctx.lineTo(points[1].x / dpr, points[1].y / dpr);
      ctx.stroke();
      return;
    }
    
    // Draw smooth curve through points
    ctx.beginPath();
    ctx.moveTo(points[0].x / dpr, points[0].y / dpr);
    
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2 / dpr;
      const yc = (points[i].y + points[i + 1].y) / 2 / dpr;
      ctx.quadraticCurveTo(points[i].x / dpr, points[i].y / dpr, xc, yc);
    }
    
    // Draw final segment
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    ctx.quadraticCurveTo(secondLastPoint.x / dpr, secondLastPoint.y / dpr, lastPoint.x / dpr, lastPoint.y / dpr);
    ctx.stroke();
  };

  const startDraw = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    drawing.current = true;
    const point = getPoint(e);
    lastPoint.current = point;
    currentStroke.current = [point];
    
    // Draw initial dot
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    ctx.save();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.arc(point.x / dpr, point.y / dpr, 1.25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Immediate feedback
    if (isEmpty) {
      setIsEmpty(false);
      setHasContent(true);
    }
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const point = getPoint(e);
    const lastPt = lastPoint.current;
    
    // Skip if point is too close (reduces jitter)
    if (lastPt) {
      const distance = Math.sqrt(
        Math.pow(point.x - lastPt.x, 2) + Math.pow(point.y - lastPt.y, 2)
      );
      if (distance < 3) return; // Slightly higher threshold for better performance
    }
    
    currentStroke.current.push(point);
    
    // Draw simple line segment for immediate feedback
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    
    if (lastPt) {
      ctx.beginPath();
      ctx.moveTo(lastPt.x / dpr, lastPt.y / dpr);
      ctx.lineTo(point.x / dpr, point.y / dpr);
      ctx.stroke();
    }
    
    lastPoint.current = point;
    
    // Update empty state immediately for responsiveness
    if (isEmpty) {
      setIsEmpty(false);
      setHasContent(true);
    }
  };

  const endDraw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    drawing.current = false;
    
    // Reset stroke data
    currentStroke.current = [];
    lastPoint.current = null;
    
    // Emit change for validation
    emitChange();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset all state
    setIsEmpty(true);
    setHasContent(false);
    drawing.current = false;
    lastPoint.current = null;
    currentStroke.current = [];
    
    // Clear timeout and emit empty signature
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }
    
    onChange?.("");
  };

  // Handle touch events to prevent scrolling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const preventTouch = (e) => {
      if (drawing.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    canvas.addEventListener('touchstart', preventTouch, { passive: false });
    canvas.addEventListener('touchmove', preventTouch, { passive: false });
    canvas.addEventListener('touchend', preventTouch, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', preventTouch);
      canvas.removeEventListener('touchmove', preventTouch);
      canvas.removeEventListener('touchend', preventTouch);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {hasContent && (
          <span className="text-xs text-green-600 font-medium">✓ Podpisano</span>
        )}
      </div>
      
      <div className={`border-2 rounded-xl bg-white overflow-hidden touch-none transition-colors ${
        hasContent 
          ? "border-green-400 shadow-sm" 
          : "border-dashed border-gray-300 hover:border-gray-400"
      }`}>
        <canvas
          ref={canvasRef}
          className="w-full h-40 cursor-crosshair touch-none select-none"
          style={{ 
            touchAction: 'none',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
            position: 'relative'
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => {
            e.preventDefault();
            startDraw(e);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            endDraw(e);
          }}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
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
          <p className="text-xs text-gray-500">Podpisz palcem lub rysikiem w powyższym polu</p>
        )}
      </div>
    </div>
  );
}
