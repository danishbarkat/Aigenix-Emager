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

        {/* Clean SUV top-down */}
        <g transform={`translate(${cx},${cy})`}>

          {/* Shadow */}
          <rect x="-13" y="-21" width="27" height="43" rx="5"
            fill="#000" opacity="0.25" transform="translate(1,2)"/>

          {/* Wheels — drawn first so body covers arches */}
          <rect x="-18" y="-17" width="7" height="10" rx="3" fill="#111827" stroke="#4338ca" strokeWidth="0.8"/>
          <rect x="11"  y="-17" width="7" height="10" rx="3" fill="#111827" stroke="#4338ca" strokeWidth="0.8"/>
          <rect x="-18" y="7"   width="7" height="10" rx="3" fill="#111827" stroke="#4338ca" strokeWidth="0.8"/>
          <rect x="11"  y="7"   width="7" height="10" rx="3" fill="#111827" stroke="#4338ca" strokeWidth="0.8"/>
          {/* Rim centre */}
          <circle cx="-14.5" cy="-12" r="2" fill="#4338ca"/>
          <circle cx="14.5"  cy="-12" r="2" fill="#4338ca"/>
          <circle cx="-14.5" cy="12"  r="2" fill="#4338ca"/>
          <circle cx="14.5"  cy="12"  r="2" fill="#4338ca"/>

          {/* ── BODY ── */}
          <rect x="-13" y="-21" width="26" height="42" rx="5" fill="#3730a3"/>

          {/* Hood */}
          <rect x="-11" y="-21" width="22" height="10" rx="4" fill="#4338ca"/>

          {/* Windshield */}
          <path d="M-9,-11 L9,-11 L8,-4 L-8,-4 Z" fill="#818cf8" opacity="0.7"/>
          <path d="M-6,-10 L-2,-10 L-3,-5 L-6,-5 Z" fill="white" opacity="0.2"/>

          {/* Cabin */}
          <rect x="-9" y="-4" width="18" height="18" rx="2" fill="#1e1b4b"/>

          {/* Sunroof */}
          <rect x="-5" y="-2" width="10" height="9" rx="2"
            fill="#13122e" stroke="#4338ca" strokeWidth="0.6"/>

          {/* Door line */}
          <line x1="-9" y1="5" x2="9" y2="5" stroke="#312e81" strokeWidth="1"/>

          {/* Rear window */}
          <path d="M-9,14 L9,14 L8,21 L-8,21 Z" fill="#818cf8" opacity="0.4"/>

          {/* Headlights */}
          <rect x="-11" y="-21" width="5" height="3" rx="1" fill="#7c5cf6"/>
          <rect x="6"   y="-21" width="5" height="3" rx="1" fill="#7c5cf6"/>

          {/* Taillights */}
          <rect x="-11" y="18" width="5" height="3" rx="1" fill="#6d28d9"/>
          <rect x="6"   y="18" width="5" height="3" rx="1" fill="#6d28d9"/>

          {/* Mirrors */}
          <rect x="-17" y="-8" width="5" height="4" rx="1.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.5"/>
          <rect x="12"  y="-8" width="5" height="4" rx="1.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.5"/>

          {/* Front dot */}
          <circle cx="0" cy="-23" r="2" fill="#7c5cf6"/>
          <circle cx="0" cy="-23" r="1" fill="white" opacity="0.9"/>
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
