import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react';

const ASPECT    = 16 / 9;
const OUTPUT_W  = 1280;
const OUTPUT_H  = Math.round(OUTPUT_W / ASPECT); // 720

/* ─── CSS-transform live preview tile ───────────────────── */
function PreviewTile({ label, imgEl, imgUrl, layout, scale, offset, w }) {
  const h = Math.round(w / ASPECT);
  let imgStyle = null;
  if (imgEl && imgUrl && layout) {
    const psc = w / layout.cropW;
    const sw  = imgEl.naturalWidth  * scale * psc;
    const sh  = imgEl.naturalHeight * scale * psc;
    const ix  = w / 2 - sw / 2 + offset.x * psc;
    const iy  = h / 2 - sh / 2 + offset.y * psc;
    imgStyle  = { position: 'absolute', left: ix, top: iy, width: sw, height: sh, objectFit: 'fill', pointerEvents: 'none', userSelect: 'none' };
  }
  return (
    <div>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative', background: '#252525', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10 }}>
        {imgStyle && <img src={imgUrl} alt="" style={imgStyle} draggable={false} />}
        {!imgStyle && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>}
      </div>
    </div>
  );
}

/* ─── Main cropper ───────────────────────────────────────── */
export default function ImageCropper({ file, onApply, onCancel }) {
  const canvasRef = useRef(null);
  const imgElRef  = useRef(null);
  const layoutRef = useRef(null);
  const dragRef   = useRef(null);
  const pinchRef  = useRef(null);

  // Synced refs so event handlers never see stale values
  const scaleRef  = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const minScRef  = useRef(1);

  const [imgUrl,   setImgUrl]   = useState(null);
  const [ready,    setReady]    = useState(false);
  const [scale,    setScale]    = useState(1);
  const [minSc,    setMinSc]    = useState(1);
  const [offset,   setOffset]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => { scaleRef.current  = scale;  }, [scale]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);
  useEffect(() => { minScRef.current  = minSc;  }, [minSc]);

  // ── Load image ──────────────────────────────────────────
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgElRef.current = img;
      setImgUrl(url);
      setReady(true);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ── Compute canvas layout ───────────────────────────────
  const computeLayout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const cW = rect.width;
    const cH = rect.height;
    if (cW < 10 || cH < 10) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = Math.round(cW * dpr);
    canvas.height = Math.round(cH * dpr);

    const padX = 52, padY = 44;
    let cropW = cW - padX * 2;
    let cropH = cropW / ASPECT;
    if (cropH > cH - padY * 2) {
      cropH = cH - padY * 2;
      cropW = cropH * ASPECT;
    }
    return {
      cW, cH, dpr,
      cropW: Math.round(cropW), cropH: Math.round(cropH),
      cropX: Math.round((cW - cropW) / 2),
      cropY: Math.round((cH - cropH) / 2),
    };
  }, []);

  const initCropper = useCallback(() => {
    const layout = computeLayout();
    if (!layout || !imgElRef.current) return;
    layoutRef.current = layout;
    const img = imgElRef.current;
    const ms  = Math.max(layout.cropW / img.naturalWidth, layout.cropH / img.naturalHeight);
    setMinSc(ms);
    setScale(ms);
    setOffset({ x: 0, y: 0 });
  }, [computeLayout]);

  useEffect(() => { if (ready) initCropper(); }, [ready, initCropper]);

  useEffect(() => {
    if (!ready) return;
    const ro = new ResizeObserver(() => initCropper());
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, [ready, initCropper]);

  // ── Position constraint ──────────────────────────────────
  const constrain = useCallback((ox, oy, sc) => {
    const layout = layoutRef.current;
    const img    = imgElRef.current;
    if (!layout || !img) return { x: ox, y: oy };
    const sw   = img.naturalWidth  * sc;
    const sh   = img.naturalHeight * sc;
    const maxX = Math.max(0, (sw - layout.cropW) / 2);
    const maxY = Math.max(0, (sh - layout.cropH) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    };
  }, []);

  // ── Canvas draw ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const img    = imgElRef.current;
    const layout = layoutRef.current;
    if (!canvas || !img || !layout) return;

    const { cW, cH, cropW, cropH, cropX, cropY, dpr } = layout;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // Image
    const sw   = img.naturalWidth  * scale;
    const sh   = img.naturalHeight * scale;
    const imgX = cropX + cropW / 2 - sw / 2 + offset.x;
    const imgY = cropY + cropH / 2 - sh / 2 + offset.y;
    ctx.drawImage(img, imgX, imgY, sw, sh);

    // Dark overlay — 4 rects surround crop frame
    ctx.fillStyle = 'rgba(0,0,0,0.66)';
    ctx.fillRect(0, 0, cW, cropY);
    ctx.fillRect(0, cropY + cropH, cW, cH - cropY - cropH);
    ctx.fillRect(0, cropY, cropX, cropH);
    ctx.fillRect(cropX + cropW, cropY, cW - cropX - cropW, cropH);

    // Rule-of-thirds grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.17)';
    ctx.lineWidth   = 0.8;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cropX + cropW * i / 3, cropY);
      ctx.lineTo(cropX + cropW * i / 3, cropY + cropH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cropX, cropY + cropH * i / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH * i / 3);
      ctx.stroke();
    }

    // Frame border
    ctx.strokeStyle = 'rgba(255,255,255,0.78)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(cropX + 0.75, cropY + 0.75, cropW - 1.5, cropH - 1.5);

    // Corner brackets
    const BL = 22, BW = 3;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth   = BW;
    ctx.lineCap     = 'square';
    [[cropX, cropY, 1, 1], [cropX + cropW, cropY, -1, 1],
     [cropX, cropY + cropH, 1, -1], [cropX + cropW, cropY + cropH, -1, -1]]
      .forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x + dx * BL, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x, y + dy * BL);
        ctx.stroke();
      });

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }, [scale, offset, ready]);

  // ── Mouse events ────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startOX: offsetRef.current.x, startOY: offsetRef.current.y,
    };
    setDragging(true);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { startX, startY, startOX, startOY } = dragRef.current;
    setOffset(constrain(startOX + (e.clientX - startX), startOY + (e.clientY - startY), scaleRef.current));
  }, [constrain]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
  }, []);

  // ── Wheel zoom ──────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const next = Math.max(minScRef.current, Math.min(scaleRef.current * (e.deltaY < 0 ? 1.08 : 0.93), minScRef.current * 6));
    setScale(next);
    setOffset(o => constrain(o.x, o.y, next));
  }, [constrain]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener('wheel', onWheel, { passive: false });
    return () => c.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ── Touch events ────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      dragRef.current = {
        startX: e.touches[0].clientX, startY: e.touches[0].clientY,
        startOX: offsetRef.current.x,  startOY: offsetRef.current.y,
      };
      pinchRef.current = null;
    } else if (e.touches.length === 2) {
      dragRef.current  = null;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), startSc: scaleRef.current };
    }
  }, []);

  const onTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      const { startX, startY, startOX, startOY } = dragRef.current;
      setOffset(constrain(startOX + (e.touches[0].clientX - startX), startOY + (e.touches[0].clientY - startY), scaleRef.current));
    } else if (e.touches.length === 2 && pinchRef.current) {
      const dx   = e.touches[0].clientX - e.touches[1].clientX;
      const dy   = e.touches[0].clientY - e.touches[1].clientY;
      const next = Math.max(minScRef.current, Math.min(pinchRef.current.startSc * (Math.hypot(dx, dy) / pinchRef.current.dist), minScRef.current * 6));
      setScale(next);
      setOffset(o => constrain(o.x, o.y, next));
    }
  }, [constrain]);

  const onTouchEnd = useCallback(() => {
    dragRef.current  = null;
    pinchRef.current = null;
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener('touchstart',  onTouchStart,  { passive: false });
    c.addEventListener('touchmove',   onTouchMove,   { passive: false });
    c.addEventListener('touchend',    onTouchEnd);
    c.addEventListener('touchcancel', onTouchEnd);
    return () => {
      c.removeEventListener('touchstart',  onTouchStart);
      c.removeEventListener('touchmove',   onTouchMove);
      c.removeEventListener('touchend',    onTouchEnd);
      c.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  // ── Controls ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setScale(minSc);
    setOffset({ x: 0, y: 0 });
  }, [minSc]);

  const zoomStep = useCallback((dir) => {
    const next = Math.max(minScRef.current, Math.min(scaleRef.current * (dir > 0 ? 1.1 : 0.91), minScRef.current * 6));
    setScale(next);
    setOffset(o => constrain(o.x, o.y, next));
  }, [constrain]);

  const handleZoomSlider = useCallback((e) => {
    const next = minScRef.current * (1 + Number(e.target.value) / 100 * 5);
    setScale(next);
    setOffset(o => constrain(o.x, o.y, next));
  }, [constrain]);

  const sliderVal = Math.round(((scale - minSc) / (minSc * 5)) * 100);
  const zoomPct   = Math.round((scale / (minSc || 1)) * 100);

  // ── Apply crop ───────────────────────────────────────────
  const handleApply = useCallback(async () => {
    const img    = imgElRef.current;
    const layout = layoutRef.current;
    if (!img || !layout) return;
    setApplying(true);
    try {
      const off = document.createElement('canvas');
      off.width  = OUTPUT_W;
      off.height = OUTPUT_H;
      const ctx  = off.getContext('2d');
      const osc  = OUTPUT_W / layout.cropW;
      const sc   = scaleRef.current;
      const ox   = offsetRef.current.x;
      const oy   = offsetRef.current.y;
      const sw   = img.naturalWidth  * sc;
      const sh   = img.naturalHeight * sc;
      const ix   = layout.cropW / 2 - sw / 2 + ox;
      const iy   = layout.cropH / 2 - sh / 2 + oy;
      ctx.drawImage(img, ix * osc, iy * osc, sw * osc, sh * osc);
      off.toBlob(blob => {
        onApply(new File([blob], file.name.replace(/\.[^.]+$/, '_cropped.jpg'), { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.92);
    } catch {
      setApplying(false);
    }
  }, [file, onApply]);

  // ── Render ───────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(10px)' }}
    >
      {/* CSS for spinner (scoped via inline style tag) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col overflow-hidden rounded-2xl w-full"
        style={{
          maxWidth: 960, maxHeight: '95dvh',
          background: '#181818',
          boxShadow: '0 40px 100px rgba(0,0,0,0.70), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="font-display font-bold text-[16px] text-white" style={{ letterSpacing: '-0.01em' }}>
              Crop Event Poster
            </h2>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>
              Drag to reposition · scroll or pinch to zoom · fixed 16:9 frame
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all"
              style={{ color: 'rgba(255,255,255,0.50)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.50)'; }}
            >
              <RotateCcw size={12} /> Reset
            </button>
            <button onClick={onCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

          {/* Canvas column */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <canvas
              ref={canvasRef}
              className="flex-1 w-full min-h-0 block"
              style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none', minHeight: 220 }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />

            {/* Zoom bar */}
            <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#111' }}>
              <button onClick={() => zoomStep(-1)}
                style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0, lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              ><ZoomOut size={15} /></button>

              <input
                type="range" min="0" max="100"
                value={Math.max(0, Math.min(100, sliderVal))}
                onChange={handleZoomSlider}
                className="flex-1 cursor-pointer"
                style={{ height: 3, accentColor: '#6366F1' }}
              />

              <button onClick={() => zoomStep(1)}
                style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0, lineHeight: 1 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
              ><ZoomIn size={15} /></button>

              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums', width: 38, textAlign: 'right', flexShrink: 0 }}>
                {zoomPct}%
              </span>
            </div>
          </div>

          {/* Preview panel */}
          <div className="md:w-[256px] overflow-y-auto flex-shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#111' }}
            // On md+ it's border-left instead; handled inline:
          >
            <div className="hidden md:block" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', height: '100%', position: 'absolute', right: 256, top: 0 }} />
            <div className="p-4 space-y-5">
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>
                Live Preview
              </p>

              <PreviewTile label="Event Card" imgEl={imgElRef.current} imgUrl={imgUrl} layout={layoutRef.current} scale={scale} offset={offset} w={220} />
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#111' }}>
          <button onClick={onCancel}
            className="px-5 py-2 rounded-xl text-[13px] font-semibold transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            Cancel
          </button>

          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>
            Output: {OUTPUT_W} × {OUTPUT_H} · JPEG 92%
          </span>

          <button
            onClick={handleApply}
            disabled={!ready || applying}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-colors"
            style={{ background: '#4F46E5', color: '#fff', opacity: (!ready || applying) ? 0.45 : 1 }}
            onMouseEnter={e => { if (ready && !applying) e.currentTarget.style.background = '#4338CA'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#4F46E5'; }}
          >
            {applying ? (
              <>
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Processing…
              </>
            ) : (
              <>
                <Check size={13} strokeWidth={2.5} />
                Apply Crop
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
