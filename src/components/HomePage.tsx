import { useEffect, useRef, useState } from 'react'
import type { CapturedFrame } from '../types'
import { TOTAL_FRAMES } from '../types'
import OrbitLogo from './OrbitLogo'

interface Props {
  onStart:    () => void
  onView:     () => void
  onSessions: () => void
  frames:     CapturedFrame[]
}

export default function HomePage({ onStart, onView, onSessions, frames }: Props) {
  const hasFrames = frames.length > 0
  const [spinIdx, setSpinIdx] = useState(0)
  const spinRef = useRef<number | null>(null)

  useEffect(() => {
    if (!hasFrames) return
    spinRef.current = window.setInterval(() =>
      setSpinIdx(i => (i + 1) % frames.length), 180)
    return () => { if (spinRef.current) clearInterval(spinRef.current) }
  }, [hasFrames, frames.length])

  return (
    <div className="flex flex-col min-h-dvh overflow-hidden relative bg-white">

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-2">
          <OrbitLogo size={34} />
          <div className="leading-none">
            <span className="font-bold text-sm" style={{ color: '#5B3FE8' }}>aigenix</span>
            <span className="font-semibold text-sm" style={{ color: '#1E1B4B' }}> Orbit</span>
          </div>
        </div>
        <button onClick={onSessions}
          className="text-xs px-3 py-1 rounded-full font-medium border active:opacity-70"
          style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
          🗂 Sessions
        </button>
      </nav>

      <div className="relative z-10 flex flex-col flex-1 px-6 pb-10">

        {/* Hero text */}
        <div className="mt-8 mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#7C5CF6' }}>
            Vehicle Imaging Platform
          </p>
          <h1 className="text-4xl font-black leading-tight mb-4"
            style={{ color: '#1E1B4B' }}>
            Smarter 360°<br />
            <span style={{ background: 'linear-gradient(90deg, #5B3FE8, #7C5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Vehicle Views
            </span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            Walk around your vehicle and capture 18 angles. The app automatically stitches them into a smooth, interactive 360° spin view.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['18 Angles', 'Auto Stitch', 'Drag Spin', 'Fullscreen'].map(f => (
            <span key={f}
              className="px-3 py-1 rounded-full text-xs font-medium border"
              style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
              {f}
            </span>
          ))}
        </div>

        {/* Preview card */}
        <div className="mb-8">
          <div className="rounded-3xl overflow-hidden border shadow-xl"
            style={{
              background: hasFrames ? '#000' : 'linear-gradient(145deg,#1E1B4B,#0E0B1F)',
              borderColor: '#DDD6FE',
              boxShadow: '0 20px 60px rgba(91,63,232,0.15)',
              height: 200,
            }}>
            {hasFrames ? (
              <div className="relative w-full h-full">
                <img src={frames[spinIdx]?.dataUrl} alt=""
                  className="w-full h-full object-cover" />
                {/* Spin badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(91,63,232,0.85)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-[10px] font-semibold">
                    {frames.length}/{TOTAL_FRAMES}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 inset-x-0 h-1"
                  style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <div className="h-full transition-all duration-300"
                    style={{
                      width: `${(frames.length / TOTAL_FRAMES) * 100}%`,
                      background: 'linear-gradient(90deg,#5B3FE8,#7C5CF6)'
                    }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <svg viewBox="0 0 200 80" width="200" height="80">
                  <path d="M18 55 Q18 42 30 38 L62 27 Q75 20 105 20 Q135 20 148 30 L162 40 Q172 46 172 54 L172 58 Q172 64 166 64 L20 64 Q14 64 14 58 Z" fill="#3730A3"/>
                  <path d="M64 37 L72 24 Q80 16 105 16 Q128 16 138 24 L148 37 Z" fill="#4338CA"/>
                  <path d="M70 35 L76 25 Q83 19 105 18 Q126 18 134 26 L140 35 Z" fill="#6366F1" opacity="0.55"/>
                  <circle cx="48"  cy="64" r="12" fill="#0E0B1F" stroke="#6366F1" strokeWidth="2"/>
                  <circle cx="48"  cy="64" r="6"  fill="#1E1B4B"/>
                  <circle cx="138" cy="64" r="12" fill="#0E0B1F" stroke="#6366F1" strokeWidth="2"/>
                  <circle cx="138" cy="64" r="6"  fill="#1E1B4B"/>
                  <ellipse cx="164" cy="45" rx="5" ry="3" fill="#7C5CF6" opacity="0.9"/>
                  <ellipse cx="22"  cy="48" rx="4" ry="2.5" fill="#A78BFA" opacity="0.6"/>
                </svg>
                <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>
                  Capture photos to generate your 360° view
                </span>
              </div>
            )}
          </div>

          {/* Bottom label */}
          <div className="flex justify-center mt-3">
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: '#EDE9FE', color: '#5B3FE8' }}>
              {hasFrames
                ? `${frames.length}/${TOTAL_FRAMES} captured · tap View 360°`
                : '← drag to spin →'}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 mt-auto">
          <button onClick={onStart}
            className="w-full py-4 rounded-2xl font-bold text-base text-white active:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#5B3FE8,#7C5CF6)', boxShadow: '0 8px 30px rgba(91,63,232,0.35)' }}>
            📷 {hasFrames ? 'Continue Capture' : 'Start Capture'}
          </button>

          {hasFrames && (
            <button onClick={onView}
              className="w-full py-4 rounded-2xl font-semibold text-base border active:opacity-80 transition-opacity"
              style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
              🔄 View 360° ({frames.length} photos)
            </button>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
          Camera access required · Chrome / Safari
        </p>
      </div>
    </div>
  )
}
