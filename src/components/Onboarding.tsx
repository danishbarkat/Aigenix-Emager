import { useState } from 'react'

const STEPS = [
  {
    icon: '🚗',
    title: 'Stand at the Front',
    body: 'Position yourself at the front of your vehicle. The very first shot must be from the front — the app will guide you.',
  },
  {
    icon: '🔄',
    title: 'Walk Clockwise',
    body: 'Slowly walk clockwise around the car. Capture one photo at each of the 18 guided positions shown on the minimap.',
  },
  {
    icon: '📸',
    title: 'Keep the Car in Frame',
    body: 'Hold your phone upright and keep the full vehicle visible. AI detects the car and blocks empty shots automatically.',
  },
  {
    icon: '✨',
    title: 'Spin in 360°',
    body: 'Once all 18 shots are done, drag left/right to spin your car as a smooth interactive 360° view.',
  },
]

interface Props { onDone: () => void }

export default function Onboarding({ onDone }: Props) {
  const [step, setStep] = useState(0)

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else onDone()
  }

  const s = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(14,11,31,0.85)', backdropFilter: 'blur(8px)' }}>

      <div className="w-full max-w-md rounded-t-3xl px-7 pt-8 pb-10 flex flex-col items-center gap-6"
        style={{ background: 'linear-gradient(160deg,#1E1B4B,#0E0B1F)' }}>

        {/* Step icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'linear-gradient(135deg,#5B3FE8,#7C5CF6)', boxShadow: '0 8px 32px rgba(91,63,232,0.4)' }}>
          {s.icon}
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-white font-black text-xl mb-2">{s.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{s.body}</p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                width:  i === step ? 20 : 8,
                height: 8,
                background: i === step ? '#7C5CF6' : 'rgba(255,255,255,0.2)',
              }} />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          {step < STEPS.length - 1 && (
            <button onClick={onDone}
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-slate-400 border border-slate-700 active:opacity-70">
              Skip
            </button>
          )}
          <button onClick={next}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white active:opacity-90"
            style={{ background: 'linear-gradient(135deg,#5B3FE8,#7C5CF6)', boxShadow: '0 4px 20px rgba(91,63,232,0.4)' }}>
            {step < STEPS.length - 1 ? 'Next →' : '✓ Got it'}
          </button>
        </div>
      </div>
    </div>
  )
}
