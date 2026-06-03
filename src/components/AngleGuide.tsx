import { TOTAL_FRAMES, ANGLE_STEP, POSITION_LABELS } from '../types'

interface Props {
  currentIndex: number
  capturedIndices: Set<number>
}

const FOV_DEG = 50 // camera field-of-view cone angle

export default function AngleGuide({ currentIndex, capturedIndices }: Props) {
  const cx = 80
  const cy = 80
  const r  = 52   // orbit radius

  // torch cone: from camera outward toward the car
  const camAngleDeg = currentIndex * ANGLE_STEP - 90
  const camRad      = (camAngleDeg * Math.PI) / 180
  const personR     = r + 18
  const px = cx + personR * Math.cos(camRad)
  const py = cy + personR * Math.sin(camRad)

  // cone tip = camera position; cone opens toward car center
  const coneLen = personR - 14  // how far the cone reaches toward car
  const halfFov = (FOV_DEG / 2) * (Math.PI / 180)
  const leftRad  = camRad + Math.PI + halfFov
  const rightRad = camRad + Math.PI - halfFov
  const lx = px + coneLen * Math.cos(leftRad)
  const ly = py + coneLen * Math.sin(leftRad)
  const rx = px + coneLen * Math.cos(rightRad)
  const ry = py + coneLen * Math.sin(rightRad)

  const dots = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
    const angleDeg = i * ANGLE_STEP - 90
    const rad = (angleDeg * Math.PI) / 180
    const x = cx + r * Math.cos(rad)
    const y = cy + r * Math.sin(rad)
    return { x, y, isCurrent: i === currentIndex, isDone: capturedIndices.has(i), i }
  })

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <radialGradient id="torchGrad" cx="0%" cy="50%" r="100%">
            <stop offset="0%"   stopColor="#7C5CF6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C5CF6" stopOpacity="0.0"  />
          </radialGradient>
          <mask id="torchMask">
            <polygon points={`${px},${py} ${lx},${ly} ${rx},${ry}`} fill="white" />
          </mask>
        </defs>

        {/* Orbit ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth="1" />

        {/* Done arc segments */}
        {dots.map(({ isDone, i }) => {
          if (!isDone) return null
          const a0 = ((i * ANGLE_STEP - 90) * Math.PI) / 180
          const a1 = (((i + 1) * ANGLE_STEP - 90) * Math.PI) / 180
          const x0 = cx + r * Math.cos(a0)
          const y0 = cy + r * Math.sin(a0)
          const x1 = cx + r * Math.cos(a1)
          const y1 = cy + r * Math.sin(a1)
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`}
              fill="#22c55e"
              opacity="0.12"
            />
          )
        })}

        {/* Torch beam cone */}
        <polygon
          points={`${px},${py} ${lx},${ly} ${rx},${ry}`}
          fill="url(#torchGrad)"
        />
        {/* Cone outline */}
        <line x1={px} y1={py} x2={lx} y2={ly} stroke="#7C5CF6" strokeWidth="0.8" opacity="0.5" />
        <line x1={px} y1={py} x2={rx} y2={ry} stroke="#7C5CF6" strokeWidth="0.8" opacity="0.5" />

        {/* Car top-down — detailed */}
        <g transform={`translate(${cx},${cy})`}>
          <defs>
            <linearGradient id="carBodyG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#3730a3"/>
              <stop offset="50%"  stopColor="#4338ca"/>
              <stop offset="100%" stopColor="#3730a3"/>
            </linearGradient>
            <linearGradient id="carRoofG" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#1e1b4b"/>
              <stop offset="50%"  stopColor="#312e81"/>
              <stop offset="100%" stopColor="#1e1b4b"/>
            </linearGradient>
          </defs>

          {/* Body shadow */}
          <ellipse cx="1" cy="1" rx="13" ry="23" fill="#0f0d2a" opacity="0.4"/>

          {/* Main body */}
          <path d="M-10,-22 Q-12,-22 -12,-18 L-12,18 Q-12,22 -10,22 L10,22 Q12,22 12,18 L12,-18 Q12,-22 10,-22 Z"
            fill="url(#carBodyG)"/>

          {/* Body highlight */}
          <path d="M-4,-22 Q0,-23 4,-22 L4,22 Q0,23 -4,22 Z" fill="white" opacity="0.06"/>

          {/* Windshield (front) */}
          <path d="M-7,-10 Q-6,-18 0,-19 Q6,-18 7,-10 Z" fill="#6366f1" opacity="0.6"/>
          <path d="M-4,-10 Q-3,-17 0,-18 Q3,-17 4,-10 Z" fill="#a5b4fc" opacity="0.3"/>

          {/* Rear window */}
          <path d="M-7,10 Q-6,18 0,19 Q6,18 7,10 Z" fill="#4338ca" opacity="0.5"/>

          {/* Cabin roof */}
          <rect x="-7" y="-10" width="14" height="20" rx="2" fill="url(#carRoofG)"/>

          {/* Door line */}
          <line x1="-7" y1="1" x2="7" y2="1" stroke="#1e1b4b" strokeWidth="0.8" opacity="0.6"/>

          {/* Side mirrors */}
          <path d="M-12,-12 L-15,-10 L-15,-7 L-12,-8 Z" fill="#4338ca"/>
          <path d="M12,-12 L15,-10 L15,-7 L12,-8 Z" fill="#4338ca"/>

          {/* Front headlights */}
          <rect x="-10" y="-22" width="5" height="3" rx="1" fill="#7C5CF6" opacity="0.9"/>
          <rect x="5"  y="-22" width="5" height="3" rx="1" fill="#7C5CF6" opacity="0.9"/>

          {/* Rear lights */}
          <rect x="-10" y="19" width="5" height="3" rx="1" fill="#6d28d9" opacity="0.9"/>
          <rect x="5"  y="19" width="5" height="3" rx="1" fill="#6d28d9" opacity="0.9"/>

          {/* Front indicator (direction marker) */}
          <circle cy="-24" cx="0" r="1.8" fill="#7C5CF6" opacity="0.95"/>

          {/* Wheels — front */}
          <rect x="-16" y="-18" width="5" height="9" rx="2.5" fill="#0f0d2a" stroke="#6366f1" strokeWidth="0.8"/>
          <rect x="11"  y="-18" width="5" height="9" rx="2.5" fill="#0f0d2a" stroke="#6366f1" strokeWidth="0.8"/>
          {/* Wheel rims front */}
          <rect x="-14.5" y="-16.5" width="2" height="6" rx="1" fill="#4338ca"/>
          <rect x="12.5"  y="-16.5" width="2" height="6" rx="1" fill="#4338ca"/>

          {/* Wheels — rear */}
          <rect x="-16" y="9" width="5" height="9" rx="2.5" fill="#0f0d2a" stroke="#6366f1" strokeWidth="0.8"/>
          <rect x="11"  y="9" width="5" height="9" rx="2.5" fill="#0f0d2a" stroke="#6366f1" strokeWidth="0.8"/>
          {/* Wheel rims rear */}
          <rect x="-14.5" y="10.5" width="2" height="6" rx="1" fill="#4338ca"/>
          <rect x="12.5"  y="10.5" width="2" height="6" rx="1" fill="#4338ca"/>
        </g>

        {/* Position dots */}
        {dots.map(({ x, y, isDone, isCurrent, i }) => (
          <circle
            key={i}
            cx={x} cy={y}
            r={isCurrent ? 5 : isDone ? 3.5 : 2.5}
            fill={isCurrent ? '#7C5CF6' : isDone ? '#22c55e' : '#334155'}
            stroke={isCurrent ? '#DDD6FE' : 'none'}
            strokeWidth="2"
          />
        ))}

        {/* Camera icon at current position */}
        <g transform={`translate(${px},${py})`}>
          <circle r="7" fill="#7C5CF6" opacity="0.2" />
          <text textAnchor="middle" dominantBaseline="middle" fontSize="9">📷</text>
        </g>
      </svg>

      <span className="text-xs font-semibold text-violet-400 tracking-wide">
        {POSITION_LABELS[currentIndex]}
      </span>
      <span className="text-[10px] text-slate-500">
        {capturedIndices.size}/{TOTAL_FRAMES} done
      </span>
    </div>
  )
}
