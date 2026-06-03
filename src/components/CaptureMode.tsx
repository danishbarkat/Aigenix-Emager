import { useRef, useEffect, useState, useCallback } from 'react'
import type { CapturedFrame } from '../types'
import { TOTAL_FRAMES, ANGLE_STEP, POSITION_LABELS } from '../types'
import AngleGuide from './AngleGuide'

interface Props {
  onComplete: (frames: CapturedFrame[]) => void
  onBack: () => void
}

export default function CaptureMode({ onComplete, onBack }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [frames, setFrames] = useState<CapturedFrame[]>([])
  const [capturedSet, setCapturedSet] = useState<Set<number>>(new Set())
  const [flash, setFlash] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')

  const startCamera = useCallback(async (facingMode: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setCameraError('Camera access denied. Please allow camera permission and reload.')
    }
  }, [])

  useEffect(() => {
    startCamera(facing)
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()) }
  }, [facing, startCamera])

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

    const newFrame: CapturedFrame = { angle: currentIndex * ANGLE_STEP, dataUrl }
    const updatedFrames = [...frames.filter(f => f.angle !== newFrame.angle), newFrame]
      .sort((a, b) => a.angle - b.angle)

    const newCapturedSet = new Set([...capturedSet, currentIndex])
    setFrames(updatedFrames)
    setCapturedSet(newCapturedSet)
    setFlash(true)
    setTimeout(() => setFlash(false), 300)

    // Auto-complete when all 9 captured
    if (newCapturedSet.size === TOTAL_FRAMES) {
      setTimeout(() => onComplete(updatedFrames), 600)
      return
    }

    // Advance to next uncaptured position
    let next = (currentIndex + 1) % TOTAL_FRAMES
    while (newCapturedSet.has(next) && next !== currentIndex) {
      next = (next + 1) % TOTAL_FRAMES
    }
    setCurrentIndex(next)
  }, [currentIndex, frames, capturedSet, onComplete])

  const handleComplete = () => {
    if (frames.length < 3) {
      alert(`Please capture at least 3 angles (currently ${frames.length}).`)
      return
    }
    onComplete(frames)
  }

  const progressPct = Math.round((capturedSet.size / TOTAL_FRAMES) * 100)

  return (
    <div className="flex flex-col h-dvh bg-black overflow-hidden">
      {/* Camera view */}
      <div className="relative flex-1 overflow-hidden">
        {cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <p className="text-red-400">{cameraError}</p>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Capture overlay vignette */}
            <div className="absolute inset-0 capture-overlay pointer-events-none" />

            {/* Flash effect */}
            {flash && (
              <div className="absolute inset-0 bg-white opacity-70 pointer-events-none transition-opacity duration-300" />
            )}

            {/* Corner guides */}
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-violet-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-violet-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-violet-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-violet-500 rounded-br-lg" />
            </div>

            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 bg-gradient-to-b from-black/70 to-transparent">
              <button onClick={onBack} className="text-white/80 text-sm flex items-center gap-1">
                ← Back
              </button>
              <span className="text-white font-semibold text-sm tracking-wide">
                aigenix eMager
              </span>
              <button
                onClick={() => setFacing(f => f === 'environment' ? 'user' : 'environment')}
                className="text-white/80 text-sm"
              >
                🔄
              </button>
            </div>

            {/* Angle instruction */}
            {cameraReady && (
              <div className="absolute top-16 inset-x-0 flex flex-col items-center gap-1 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-5 py-1.5 text-sm font-semibold text-violet-300">
                  {capturedSet.has(currentIndex) ? '✓ ' : '📸 '}
                  {POSITION_LABELS[currentIndex]}
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-0.5 text-xs text-slate-300">
                  {capturedSet.has(currentIndex)
                    ? 'Re-capture this angle'
                    : `Position ${currentIndex + 1}/18 · ${currentIndex * ANGLE_STEP}°`}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-black/180 backdrop-blur-md px-4 pt-4 pb-safe-bottom pb-6">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-slate-400 w-8">{capturedSet.size}</span>
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-8 text-right">{TOTAL_FRAMES}</span>
        </div>

        <div className="flex items-end justify-between gap-4">
          {/* Angle guide mini map */}
          <AngleGuide currentIndex={currentIndex} capturedIndices={capturedSet} />

          {/* Shutter button */}
          <button
            onClick={captureFrame}
            disabled={!cameraReady}
            className="flex-shrink-0 w-18 h-18 rounded-full bg-white border-4 border-violet-500 shadow-lg shadow-orange-500/30 active:scale-95 transition-transform disabled:opacity-40"
            style={{ width: 72, height: 72 }}
          />

          {/* Nav + Done */}
          <div className="flex flex-col gap-2 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIndex(i => (i - 1 + TOTAL_FRAMES) % TOTAL_FRAMES)}
                className="w-9 h-9 rounded-full bg-slate-700 text-white text-sm active:bg-slate-600"
              >
                ‹
              </button>
              <button
                onClick={() => setCurrentIndex(i => (i + 1) % TOTAL_FRAMES)}
                className="w-9 h-9 rounded-full bg-slate-700 text-white text-sm active:bg-slate-600"
              >
                ›
              </button>
            </div>
            <button
              onClick={handleComplete}
              disabled={capturedSet.size < 3}
              className="text-xs px-3 py-1.5 rounded-full bg-violet-600 text-white font-semibold disabled:opacity-30 active:bg-violet-700"
            >
              {capturedSet.size >= TOTAL_FRAMES ? '✓ Auto...' : `View (${capturedSet.size}/18)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
