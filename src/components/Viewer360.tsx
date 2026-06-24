import { useRef, useEffect, useState, useCallback } from 'react'
import type { CapturedFrame } from '../types'
import { POSITION_LABELS, ANGLE_STEP, TOTAL_FRAMES } from '../types'

const PX_PER_FRAME  = 28     // pixels of drag per 1 frame (lower = more responsive)
const AUTO_SPIN_MS  = 5000   // full rotation time
const FRICTION      = 0.86
const MIN_VEL       = 0.003

interface Props {
  frames: CapturedFrame[]
  sessionId?: string
  onBack: () => void
  onRecapture: () => void
}

export default function Viewer360({ frames, sessionId, onBack, onRecapture }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgsRef   = useRef<HTMLImageElement[]>([])

  const posRef    = useRef(0)
  const velRef    = useRef(0)
  const autoRef   = useRef(false)
  const dragging  = useRef(false)
  const lastX     = useRef(0)
  const lastDragT = useRef(0)
  const rafId     = useRef(0)
  const lastTime  = useRef(0)
  const shownIdx  = useRef(-1)

  const [displayIdx, setDisplayIdx] = useState(0)
  const [isAuto, setIsAuto]         = useState(false)
  const [isFS,   setIsFS]           = useState(false)
  const [loaded, setLoaded]         = useState(false)

  const N = frames.length
  useEffect(() => { autoRef.current = isAuto }, [isAuto])

  /* ── Preload all images, then size the canvas to first frame ── */
  useEffect(() => {
    const arr: HTMLImageElement[] = new Array(N)
    let done = 0
    frames.forEach((f, i) => {
      const img = new Image()
      img.onload = () => {
        arr[i] = img
        if (++done === N) {
          imgsRef.current = arr
          // size canvas to image aspect ratio (capped for perf)
          const first = arr[0]
          const maxDim = Math.max(first.naturalWidth, first.naturalHeight)
          const scale  = Math.min(1, 1280 / maxDim)
          const cvs = canvasRef.current
          if (cvs) {
            cvs.width  = Math.round(first.naturalWidth  * scale)
            cvs.height = Math.round(first.naturalHeight * scale)
          }
          setLoaded(true)
        }
      }
      img.src = f.dataUrl
    })
  }, [frames, N])

  /* ── Canvas blend: draw two adjacent frames with fractional alpha ── */
  const paint = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || !imgsRef.current.length) return
    const ctx = cvs.getContext('2d')!

    const pos   = ((posRef.current % N) + N) % N
    const idxA  = Math.floor(pos) % N
    const idxB  = (idxA + 1) % N
    const alpha = pos - Math.floor(pos)   // 0 → 1 between frame A and B

    const imgA = imgsRef.current[idxA]
    const imgB = imgsRef.current[idxB]
    if (!imgA || !imgB) return

    const W = cvs.width, H = cvs.height

    if (alpha < 0.01) {
      ctx.drawImage(imgA, 0, 0, W, H)
    } else if (alpha > 0.99) {
      ctx.drawImage(imgB, 0, 0, W, H)
    } else {
      // Blend A → B as position moves between the two frames
      ctx.globalAlpha = 1
      ctx.drawImage(imgA, 0, 0, W, H)
      ctx.globalAlpha = alpha
      ctx.drawImage(imgB, 0, 0, W, H)
      ctx.globalAlpha = 1
    }

    if (idxA !== shownIdx.current) {
      shownIdx.current = idxA
      setDisplayIdx(idxA)
    }
  }, [N])

  /* ── RAF loop ────────────────────────────────────────────── */
  const loop = useCallback((now: number) => {
    const dt = Math.min(now - (lastTime.current || now), 50)
    lastTime.current = now

    if (autoRef.current) {
      posRef.current = (posRef.current + (dt / AUTO_SPIN_MS) * N + N) % N
      velRef.current = (N / AUTO_SPIN_MS) * 16
    } else if (Math.abs(velRef.current) > MIN_VEL) {
      posRef.current  = ((posRef.current + velRef.current) % N + N) % N
      velRef.current *= FRICTION
    }

    paint()
    rafId.current = requestAnimationFrame(loop)
  }, [paint, N])

  useEffect(() => {
    rafId.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId.current)
  }, [loop])

  /* ── Mouse ───────────────────────────────────────────────── */
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    velRef.current   = 0
    lastX.current    = e.clientX
    lastDragT.current = performance.now()
    setIsAuto(false)
    e.preventDefault()
  }
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx  = e.clientX - lastX.current
      const dt  = Math.max(performance.now() - lastDragT.current, 1)
      velRef.current    = -(dx / PX_PER_FRAME / dt) * 16
      posRef.current    = ((posRef.current - dx / PX_PER_FRAME) % N + N) % N
      lastX.current     = e.clientX
      lastDragT.current = performance.now()
      paint()
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [N, paint])

  /* ── Touch ───────────────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    setIsAuto(false)
    dragging.current  = true
    velRef.current    = 0
    lastX.current     = e.touches[0].clientX
    lastDragT.current = performance.now()
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return
    const dx  = e.touches[0].clientX - lastX.current
    const dt  = Math.max(performance.now() - lastDragT.current, 1)
    velRef.current    = -(dx / PX_PER_FRAME / dt) * 16
    posRef.current    = ((posRef.current - dx / PX_PER_FRAME) % N + N) % N
    lastX.current     = e.touches[0].clientX
    lastDragT.current = performance.now()
    paint()
  }
  const onTouchEnd = () => { dragging.current = false }

  /* ── Fullscreen ──────────────────────────────────────────── */
  const toggleFS = async () => {
    if (!document.fullscreenElement) await wrapRef.current?.requestFullscreen()
    else await document.exitFullscreen()
  }
  useEffect(() => {
    const h = () => setIsFS(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const angle    = frames[displayIdx]?.angle ?? 0
  const labelIdx = Math.round(angle / ANGLE_STEP) % TOTAL_FRAMES
  const posLabel = POSITION_LABELS[labelIdx] ?? `${angle}°`

  return (
    <div className="flex flex-col h-dvh bg-black select-none overflow-hidden">

      {/* ── Viewer ───────────────────────────────────────── */}
      <div
        ref={wrapRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden bg-black"
        style={{ touchAction: 'none', cursor: dragging.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Canvas — two frames blended for smooth 3D feel */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none"
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
          }}
        />

        {!loaded && (
          <span className="text-violet-400 text-sm animate-pulse">Loading…</span>
        )}

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/65 to-transparent pointer-events-none flex items-start justify-between px-4 pt-4">
          <span className="text-white font-bold tracking-widest text-sm">aigenix Orbit</span>
          {sessionId && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(91,63,232,0.8)', color: '#EDE9FE' }}>
              {sessionId}
            </span>
          )}
        </div>

        {/* Position badge */}
        <div className="absolute top-14 inset-x-0 flex justify-center pointer-events-none">
          <div className="bg-black/55 backdrop-blur-sm rounded-full px-4 py-1 flex items-center gap-2">
            <span className="text-violet-400 font-semibold text-sm">{posLabel}</span>
            <span className="text-slate-500 text-xs">{angle}°</span>
          </div>
        </div>

        {/* Frame dots */}
        <div className="absolute top-24 inset-x-0 flex justify-center gap-1 pointer-events-none">
          {frames.map((_, i) => (
            <div key={i} className="rounded-full"
              style={{
                width:  i === displayIdx ? 8 : 4,
                height: i === displayIdx ? 8 : 4,
                background: i === displayIdx ? '#7C5CF6' : 'rgba(255,255,255,0.18)',
                transition: 'all 80ms',
              }}
            />
          ))}
        </div>

        {/* Drag hint */}
        {loaded && !isAuto && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <div className="bg-black/45 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/55 text-xs">
              ← drag to spin →
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="bg-zinc-950 px-4 py-3 pb-6 flex items-center justify-between gap-3">
        <button onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm active:bg-zinc-700">
          ← Back
        </button>

        <div className="flex gap-2">
          <button onClick={() => setIsAuto(s => !s)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors
              ${isAuto ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-white'}`}>
            {isAuto ? '⏸ Stop' : '▶ Spin'}
          </button>
          <button onClick={toggleFS}
            className="px-3 py-2 rounded-xl bg-zinc-800 text-white text-sm">
            {isFS ? '✕' : '⤢'}
          </button>
        </div>

        <button onClick={onRecapture}
          className="px-4 py-2 rounded-xl bg-violet-600/15 text-violet-400 text-sm border border-violet-500/30">
          + More
        </button>
      </div>
    </div>
  )
}
