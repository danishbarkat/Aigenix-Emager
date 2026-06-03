import { useEffect, useRef, useState } from 'react'
import type { CapturedFrame } from '../types'
import { TOTAL_FRAMES } from '../types'
import OrbitLogo from './OrbitLogo'

function CarSVG() {
  return (
    <svg viewBox="0 0 280 120" width="280" height="108">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#4F46E5"/>
          <stop offset="45%"  stopColor="#3730A3"/>
          <stop offset="100%" stopColor="#1e1b4b"/>
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#6366F1"/>
          <stop offset="100%" stopColor="#3730A3"/>
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a5b4fc" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#312e81" stopOpacity="0.5"/>
        </linearGradient>
        <radialGradient id="wheelGrad" cx="40%" cy="35%" r="60%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#4338CA"/>
          <stop offset="100%" stopColor="#0f0d2a"/>
        </radialGradient>
        <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#7c5cf6"/>
        </linearGradient>
        <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#e0d9ff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#7c5cf6" stopOpacity="0"/>
        </radialGradient>
        <filter id="carShadow">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1e1b4b" floodOpacity="0.4"/>
        </filter>
        <filter id="carGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <ellipse cx="140" cy="105" rx="115" ry="7" fill="#1e1b4b" opacity="0.25"/>
      <path d="M28 74 Q24 74 22 70 L18 58 Q16 50 22 46 L40 40 Q50 37 58 36 L82 28 Q96 22 120 20 Q148 18 162 22 L188 30 Q204 36 216 44 L228 52 Q236 58 238 66 L240 74 Q240 78 236 80 L28 80 Q24 78 28 74 Z"
        fill="url(#bodyGrad)" filter="url(#carShadow)"/>
      <path d="M50 42 Q80 36 120 34 Q158 32 190 40 L210 48 Q185 42 155 40 Q120 38 85 40 Q65 42 48 48 Z"
        fill="white" opacity="0.08"/>
      <path d="M30 72 L236 72" stroke="#7c5cf6" strokeWidth="1.5" opacity="0.6"/>
      <path d="M18 58 L18 70 Q18 76 24 78 L44 80 L40 74 L26 72 L22 62 Z" fill="#312e81" opacity="0.8"/>
      <path d="M236 62 L238 66 L240 74 L236 80 L220 80 L222 74 L234 72 Z" fill="#312e81" opacity="0.8"/>
      <path d="M82 36 Q86 22 96 16 Q108 10 128 10 Q152 10 164 16 Q172 20 178 28 L192 36 Z"
        fill="url(#roofGrad)"/>
      <path d="M98 18 Q112 12 132 12 Q154 12 166 18 Q158 14 132 14 Q110 14 98 18 Z"
        fill="white" opacity="0.15"/>
      <path d="M82 36 L96 16 Q90 18 84 28 Z" fill="#2d2a7a" opacity="0.9"/>
      <path d="M192 36 L178 28 Q184 32 188 36 Z" fill="#2d2a7a" opacity="0.9"/>
      <path d="M88 35 Q92 22 102 16 Q112 11 124 11 L124 35 Z" fill="url(#glassGrad)"/>
      <path d="M188 35 Q184 22 172 16 Q162 11 128 11 L128 35 Z" fill="url(#glassGrad)"/>
      <rect x="124" y="11" width="4" height="24" fill="#1e1b4b" opacity="0.8"/>
      <path d="M96 30 Q98 20 106 15 L110 15 Q103 20 100 30 Z" fill="white" opacity="0.18"/>
      <path d="M160 28 Q162 18 168 14 L172 15 Q167 19 164 28 Z" fill="white" opacity="0.12"/>
      <line x1="126" y1="36" x2="122" y2="80" stroke="#2d2a7a" strokeWidth="1.2" opacity="0.6"/>
      <rect x="100" y="58" width="14" height="4" rx="2" fill="#6366F1" opacity="0.8"/>
      <rect x="148" y="58" width="14" height="4" rx="2" fill="#6366F1" opacity="0.8"/>
      <path d="M82 42 L76 42 Q72 42 72 46 L72 50 Q72 54 76 54 L82 52 Z"
        fill="#3730A3" stroke="#4338CA" strokeWidth="0.8"/>
      <ellipse cx="230" cy="62" rx="7" ry="10" fill="url(#headlightGlow)" opacity="0.5" filter="url(#carGlow)"/>
      <path d="M226 52 Q234 52 238 58 L238 66 Q236 72 228 72 L224 72 L222 60 Z" fill="#c4b5fd" opacity="0.85"/>
      <path d="M226 54 Q232 54 236 59 L236 65 Q234 70 228 70 L225 70 Z" fill="white" opacity="0.4"/>
      <path d="M224 54 L238 60" stroke="white" strokeWidth="1.5" opacity="0.9" strokeLinecap="round"/>
      <path d="M22 52 Q18 56 18 62 L18 68 Q20 74 26 74 L30 74 L32 60 Z" fill="#7c3aed" opacity="0.9"/>
      <path d="M24 56 Q20 59 20 64 L20 68 L28 68 L30 60 Z" fill="#a78bfa" opacity="0.6"/>
      <path d="M30 72 L18 64" stroke="#c4b5fd" strokeWidth="1.2" opacity="0.8" strokeLinecap="round"/>
      <path d="M40 80 Q40 56 66 56 Q92 56 92 80" fill="#0f0d2a" opacity="0.5"/>
      <path d="M170 80 Q170 56 196 56 Q222 56 222 80" fill="#0f0d2a" opacity="0.5"/>
      <circle cx="66" cy="82" r="22" fill="#0f0d2a"/>
      <circle cx="66" cy="82" r="19" fill="#1a1740" stroke="#4338CA" strokeWidth="1.5"/>
      {[0,60,120,180,240,300].map((deg, i) => {
        const a = deg * Math.PI / 180
        return <line key={i} x1={66+6*Math.cos(a)} y1={82+6*Math.sin(a)} x2={66+16*Math.cos(a)} y2={82+16*Math.sin(a)} stroke="url(#rimGrad)" strokeWidth="3" strokeLinecap="round"/>
      })}
      <circle cx="66" cy="82" r="6" fill="#6366F1"/>
      <circle cx="66" cy="82" r="3" fill="#c4b5fd"/>
      <circle cx="196" cy="82" r="22" fill="#0f0d2a"/>
      <circle cx="196" cy="82" r="19" fill="#1a1740" stroke="#4338CA" strokeWidth="1.5"/>
      {[0,60,120,180,240,300].map((deg, i) => {
        const a = deg * Math.PI / 180
        return <line key={i} x1={196+6*Math.cos(a)} y1={82+6*Math.sin(a)} x2={196+16*Math.cos(a)} y2={82+16*Math.sin(a)} stroke="url(#rimGrad)" strokeWidth="3" strokeLinecap="round"/>
      })}
      <circle cx="196" cy="82" r="6" fill="#6366F1"/>
      <circle cx="196" cy="82" r="3" fill="#c4b5fd"/>
      <ellipse cx="240" cy="98" rx="18" ry="4" fill="#7c5cf6" opacity="0.15"/>
    </svg>
  )
}

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

  const PreviewCard = (
    <div className="rounded-3xl overflow-hidden border shadow-2xl w-full"
      style={{
        background: hasFrames ? '#000' : 'linear-gradient(145deg,#1E1B4B,#0E0B1F)',
        borderColor: '#DDD6FE',
        boxShadow: '0 24px 80px rgba(91,63,232,0.18)',
        aspectRatio: '16/9',
        minHeight: 200,
        maxHeight: 340,
      }}>
      {hasFrames ? (
        <div className="relative w-full h-full">
          <img src={frames[spinIdx]?.dataUrl} alt="" className="w-full h-full object-cover"/>
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full"
            style={{ background: 'rgba(91,63,232,0.85)', backdropFilter: 'blur(8px)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
            <span className="text-white text-[10px] font-semibold">{frames.length}/{TOTAL_FRAMES}</span>
          </div>
          <div className="absolute bottom-0 inset-x-0 h-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div className="h-full transition-all duration-300"
              style={{ width: `${(frames.length/TOTAL_FRAMES)*100}%`, background: 'linear-gradient(90deg,#5B3FE8,#7C5CF6)' }}/>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4">
          <CarSVG/>
          <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>
            Capture photos to generate your 360° view
          </span>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-dvh bg-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="flex items-center justify-between px-6 md:px-12 pt-8 pb-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <OrbitLogo size={34}/>
          <div className="leading-none flex items-baseline gap-0.5">
            <span className="font-black text-base" style={{ color: '#5B3FE8' }}>AiGenix</span>
            <span className="font-black text-base" style={{ color: '#1E1B4B' }}> OrbiT</span>
          </div>
        </div>
        <button onClick={onSessions}
          className="text-xs px-3 py-1.5 rounded-full font-medium border transition-opacity active:opacity-70"
          style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
          🗂 Sessions
        </button>
      </nav>

      {/* ── DESKTOP: two-column │ MOBILE: single-column ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-12">

        {/* Desktop grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-16 md:items-center md:min-h-[80vh]">

          {/* LEFT — text + CTA */}
          <div className="pt-6 md:pt-0">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#7C5CF6' }}>
              Vehicle Imaging Platform
            </p>
            <h1 className="font-black leading-tight mb-4"
              style={{ color: '#1E1B4B', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Smarter 360°<br/>
              <span style={{ background: 'linear-gradient(90deg,#5B3FE8,#7C5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Vehicle Views
              </span>
            </h1>
            <p className="text-sm md:text-base leading-relaxed mb-8 max-w-md" style={{ color: '#6B7280' }}>
              Walk around your vehicle and capture 18 angles. The app automatically stitches them into a smooth, interactive 360° spin view.
            </p>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['18 Angles', 'Auto Stitch', 'Drag Spin', 'Session Save', 'Fullscreen'].map(f => (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
                  {f}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 md:max-w-sm">
              <button onClick={onStart}
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-opacity active:opacity-90"
                style={{ background: 'linear-gradient(135deg,#5B3FE8,#7C5CF6)', boxShadow: '0 8px 30px rgba(91,63,232,0.35)' }}>
                📷 {hasFrames ? 'Continue Capture' : 'Start Capture'}
              </button>
              {hasFrames && (
                <button onClick={onView}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm border transition-opacity active:opacity-80"
                  style={{ background: '#F5F3FF', color: '#5B3FE8', borderColor: '#DDD6FE' }}>
                  🔄 View 360°
                </button>
              )}
            </div>

            <p className="text-xs mt-4" style={{ color: '#9CA3AF' }}>
              Camera access required · Chrome / Safari
            </p>
          </div>

          {/* RIGHT — preview card */}
          <div className="mt-8 md:mt-0">
            {PreviewCard}
            <div className="flex justify-center mt-3">
              <span className="text-xs font-medium px-3 py-1 rounded-full"
                style={{ background: '#EDE9FE', color: '#5B3FE8' }}>
                {hasFrames
                  ? `${frames.length}/${TOTAL_FRAMES} captured · tap View 360°`
                  : '← drag to spin →'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
