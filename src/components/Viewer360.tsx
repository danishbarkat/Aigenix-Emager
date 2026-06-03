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
  const imgRef    = useRef<HTMLImageElement>(null)
  const imgsRef   = useRef<HTMLImageElement[]>([])

  const posRef    = useRef(0)
  const velRef    = useRef(0)
  const autoRef   = useRef(false)
  const dragging  = useRef(false)
  const lastX     = useRef(0)
  const lastDragT = useRef(0)
  const rafId     = useRef(0)
  const lastTime  = useRef(0)
  const shownIdx  = useRef(-1)   // avoid redundant src swaps

  const [displayIdx, setDisplayIdx] = useState(0)
  const [isAuto, setIsAuto]         = useState(false)
  const [isFS,   setIsFS]           = useState(false)
  const [loaded, setLoaded]         = useState(false)

  const N = frames.length
  useEffect(() => { autoRef.current = isAuto }, [isAuto])

  /* ── Preload all images ──────────────────────────────────── */
  useEffect(() => {
    const arr: HTMLImageElement[] = new Array(N)
    let done = 0
    frames.forEach((f, i) => {
      const img = new Image()
      img.onload = () => {
        arr[i] = img
        if (++done === N) { imgsRef.current = arr; setLoaded(true) }
      }
      img.src = f.dataUrl
    })
  }, [frames, N])

  /* ── Swap image src directly — zero React overhead ───────── */
  const paint = useCallback(() => {
    const el = imgRef.current
    if (!el || !imgsRef.current.length) return

    const pos = ((posRef.current % N) + N) % N
    const idx = Math.floor(pos) % N

    if (idx !== shownIdx.current) {
      shownIdx.current = idx
      el.src = imgsRef.current[idx]?.src ?? ''
      setDisplayIdx(idx)
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
        {/* Single image — src swapped directly, no React re-render */}
        <img
          ref={imgRef}
          src=""
          alt="360"
          draggable={false}
          className="pointer-events-none"
          style={{
            maxWidth: '70%',
            maxHeight: '70%',
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            willChange: 'contents',
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
