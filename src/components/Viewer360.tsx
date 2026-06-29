import { useRef, useEffect, useState, useCallback } from 'react'
import type { CapturedFrame } from '../types'
import { POSITION_LABELS, ANGLE_STEP, TOTAL_FRAMES } from '../types'

const PX_PER_FRAME = 28
const AUTO_SPIN_MS = 5000
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
  const pinchRef  = useRef({ dist: 0, scale: 1 })
  const scaleRef  = useRef(1)

  const [displayIdx, setDisplayIdx] = useState(0)
  const [isAuto, setIsAuto]         = useState(false)
  const [isFS,   setIsFS]           = useState(false)
  const [loaded, setLoaded]         = useState(false)
  const [scale,  setScale]          = useState(1)
  const [showActions, setShowActions] = useState(false)
  const [toast, setToast]           = useState('')
  const [exporting, setExporting]   = useState(false)

  const N = frames.length
  useEffect(() => { autoRef.current = isAuto }, [isAuto])

  /* ── Preload images + size canvas ───────────────────────── */
  useEffect(() => {
    const arr: HTMLImageElement[] = new Array(N)
    let done = 0
    frames.forEach((f, i) => {
      const img = new Image()
      img.onload = () => {
        arr[i] = img
        if (++done === N) {
          imgsRef.current = arr
          const first  = arr[0]
          const maxDim = Math.max(first.naturalWidth, first.naturalHeight)
          const s      = Math.min(1, 1280 / maxDim)
          const cvs    = canvasRef.current
          if (cvs) { cvs.width = Math.round(first.naturalWidth * s); cvs.height = Math.round(first.naturalHeight * s) }
          setLoaded(true)
        }
      }
      img.src = f.dataUrl
    })
  }, [frames, N])

  // Auto-spin once images are ready
  useEffect(() => { if (loaded) setIsAuto(true) }, [loaded])

  /* ── Canvas cross-fade paint ─────────────────────────────── */
  const paint = useCallback(() => {
    const cvs = canvasRef.current
    if (!cvs || !imgsRef.current.length) return
    const ctx = cvs.getContext('2d')!
    const pos   = ((posRef.current % N) + N) % N
    const idxA  = Math.floor(pos) % N
    const idxB  = (idxA + 1) % N
    const alpha = pos - Math.floor(pos)
    const imgA  = imgsRef.current[idxA]
    const imgB  = imgsRef.current[idxB]
    if (!imgA || !imgB) return
    const W = cvs.width, H = cvs.height
    if (alpha < 0.01) {
      ctx.drawImage(imgA, 0, 0, W, H)
    } else if (alpha > 0.99) {
      ctx.drawImage(imgB, 0, 0, W, H)
    } else {
      ctx.globalAlpha = 1;     ctx.drawImage(imgA, 0, 0, W, H)
      ctx.globalAlpha = alpha; ctx.drawImage(imgB, 0, 0, W, H)
      ctx.globalAlpha = 1
    }
    if (idxA !== shownIdx.current) { shownIdx.current = idxA; setDisplayIdx(idxA) }
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

  /* ── Mouse drag ──────────────────────────────────────────── */
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true; velRef.current = 0
    lastX.current = e.clientX; lastDragT.current = performance.now()
    setIsAuto(false); e.preventDefault()
  }
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX.current
      const dt = Math.max(performance.now() - lastDragT.current, 1)
      velRef.current = -(dx / PX_PER_FRAME / dt) * 16
      posRef.current = ((posRef.current - dx / PX_PER_FRAME) % N + N) % N
      lastX.current = e.clientX; lastDragT.current = performance.now()
      paint()
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [N, paint])

  /* ── Touch drag + pinch-to-zoom ─────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    setIsAuto(false)
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy), scale: scaleRef.current }
      dragging.current = false
      return
    }
    dragging.current = true; velRef.current = 0
    lastX.current = e.touches[0].clientX; lastDragT.current = performance.now()
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const newScale = Math.max(0.5, Math.min(4, pinchRef.current.scale * Math.hypot(dx, dy) / pinchRef.current.dist))
      scaleRef.current = newScale; setScale(newScale)
      return
    }
    if (!dragging.current) return
    const dx = e.touches[0].clientX - lastX.current
    const dt = Math.max(performance.now() - lastDragT.current, 1)
    velRef.current = -(dx / PX_PER_FRAME / dt) * 16
    posRef.current = ((posRef.current - dx / PX_PER_FRAME) % N + N) % N
    lastX.current = e.touches[0].clientX; lastDragT.current = performance.now()
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

  /* ── Download ZIP ────────────────────────────────────────── */
  const downloadZip = async () => {
    setShowActions(false)
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    frames.forEach((f, i) => {
      zip.file(`frame_${String(i + 1).padStart(2, '0')}_${f.angle}deg.jpg`, f.dataUrl.split(',')[1], { base64: true })
    })
    const blob = await zip.generateAsync({ type: 'blob' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href: url, download: `${sessionId || 'orbit'}_360.zip` }).click()
    URL.revokeObjectURL(url)
    showToast('Frames downloaded!')
  }

  /* ── Export WebM video ───────────────────────────────────── */
  const exportVideo = () => {
    setShowActions(false)
    const cvs = canvasRef.current
    if (!cvs) return
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
      const stream   = (cvs as any).captureStream(30) as MediaStream
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks: Blob[] = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url  = URL.createObjectURL(blob)
        Object.assign(document.createElement('a'), { href: url, download: `${sessionId || 'orbit'}_360.webm` }).click()
        URL.revokeObjectURL(url)
        setExporting(false)
        setIsAuto(true)
        showToast('Video exported!')
      }
      setExporting(true)
      setIsAuto(false)
      recorder.start()
      const FPS = 30, SECS = 3, TOTAL = FPS * SECS
      let f = 0
      const tick = () => {
        posRef.current = (f / TOTAL) * N
        paint()
        f++
        if (f <= TOTAL) setTimeout(tick, 1000 / FPS)
        else recorder.stop()
      }
      tick()
    } catch {
      setExporting(false)
      showToast('Video export not supported in this browser')
    }
  }

  /* ── Share ───────────────────────────────────────────────── */
  const share = async () => {
    setShowActions(false)
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AiGenix OrbiT — 360° View', url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Link copied!')
      }
    } catch { /* user cancelled */ }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

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
        <canvas
          ref={canvasRef}
          className="pointer-events-none"
          style={{
            maxWidth: '90%', maxHeight: '90%',
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.05s',
          }}
        />

        {!loaded && <span className="text-violet-400 text-sm animate-pulse">Loading…</span>}

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/65 to-transparent pointer-events-none flex items-start justify-between px-4 pt-4">
          <span className="text-white font-bold tracking-widest text-sm">AiGenix OrbiT</span>
          {sessionId && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-auto"
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
                width:      i === displayIdx ? 8 : 4,
                height:     i === displayIdx ? 8 : 4,
                background: i === displayIdx ? '#7C5CF6' : 'rgba(255,255,255,0.18)',
                transition: 'all 80ms',
              }} />
          ))}
        </div>

        {/* Pinch hint when zoomed */}
        {scale > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white/60 text-xs">
              Pinch to zoom · {Math.round(scale * 100)}%
            </div>
          </div>
        )}

        {/* Drag hint */}
        {loaded && !isAuto && scale === 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
            <div className="bg-black/45 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/55 text-xs">
              ← drag to spin →
            </div>
          </div>
        )}

        {/* Export progress */}
        {exporting && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-zinc-900 rounded-2xl px-8 py-5 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"/>
              <span className="text-white text-sm font-semibold">Exporting video…</span>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="absolute top-20 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="bg-violet-600/95 backdrop-blur-sm text-white text-sm font-semibold px-5 py-2 rounded-2xl shadow-lg">
              {toast}
            </div>
          </div>
        )}

        {/* Action sheet overlay */}
        {showActions && (
          <div className="absolute inset-0 z-40 flex items-end" onClick={() => setShowActions(false)}>
            <div className="w-full bg-zinc-900 rounded-t-3xl px-5 pt-4 pb-8 flex flex-col gap-2"
              onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-2"/>
              <button onClick={downloadZip}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-zinc-800 text-white text-sm font-medium active:bg-zinc-700">
                <span className="text-xl">📥</span>
                <div className="text-left">
                  <div className="font-semibold">Download Frames</div>
                  <div className="text-xs text-slate-400">Save all {N} photos as .zip</div>
                </div>
              </button>
              <button onClick={exportVideo}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-zinc-800 text-white text-sm font-medium active:bg-zinc-700">
                <span className="text-xl">🎬</span>
                <div className="text-left">
                  <div className="font-semibold">Export 360° Video</div>
                  <div className="text-xs text-slate-400">3-second rotation as .webm</div>
                </div>
              </button>
              <button onClick={share}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-zinc-800 text-white text-sm font-medium active:bg-zinc-700">
                <span className="text-xl">🔗</span>
                <div className="text-left">
                  <div className="font-semibold">Share Link</div>
                  <div className="text-xs text-slate-400">Copy or share this page</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────── */}
      <div className="bg-zinc-950 px-4 py-3 pb-6 flex items-center justify-between gap-2">
        <button onClick={onBack}
          className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm active:bg-zinc-700">
          ← Back
        </button>

        <div className="flex gap-2">
          <button onClick={() => setIsAuto(s => !s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isAuto ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-white'}`}>
            {isAuto ? '⏸' : '▶'}
          </button>
          <button onClick={toggleFS}
            className="px-3 py-2 rounded-xl bg-zinc-800 text-white text-sm">
            {isFS ? '✕' : '⤢'}
          </button>
          <button onClick={() => setScale(1)}
            className="px-3 py-2 rounded-xl bg-zinc-800 text-white text-sm"
            title="Reset zoom">
            ⊙
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowActions(true)}
            className="px-4 py-2 rounded-xl bg-zinc-800 text-white text-sm font-bold active:bg-zinc-700">
            ⋯
          </button>
          <button onClick={onRecapture}
            className="px-3 py-2 rounded-xl text-violet-400 text-sm border border-violet-500/30 active:opacity-70">
            + More
          </button>
        </div>
      </div>
    </div>
  )
}
