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
          opacity="0.6"
        />
        <line x1={px} y1={py} x2={lx} y2={ly} stroke="#7C5CF6" strokeWidth="0.7" opacity="0.35" />
        <line x1={px} y1={py} x2={rx} y2={ry} stroke="#7C5CF6" strokeWidth="0.7" opacity="0.35" />

        {/* Car top-down — icon style like reference */}
        <g transform={`translate(${cx},${cy})`}>

          {/* Outer body silhouette — wider mid, tapered ends */}
          <path d="
            M 0,-22
            Q 9,-22 10,-17
            L 11,-9
            Q 12,-5 11,-1
            Q 12,3  11,9
            L 10,17
            Q 9,22 0,22
            Q -9,22 -10,17
            L -11,9
            Q -12,3 -11,-1
            Q -12,-5 -11,-9
            L -10,-17
            Q -9,-22 0,-22 Z"
            fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.2"/>

          {/* A-pillar blacks (front corners — filled dark) */}
          <path d="M-10,-17 L-10,-11 Q-7,-10 -4,-11 L-6,-17 Z" fill="#0d0c24"/>
          <path d="M 10,-17 L 10,-11 Q  7,-10  4,-11 L  6,-17 Z" fill="#0d0c24"/>

          {/* Windshield glass (between A-pillars) */}
          <path d="M-4,-11 L4,-11 L6,-17 L-6,-17 Z" fill="#818cf8" opacity="0.55"/>
          {/* Windshield glare */}
          <path d="M-3,-16 L0,-16 L0,-12 L-2,-12 Z" fill="white" opacity="0.2"/>

          {/* Cabin roof */}
          <rect x="-9" y="-5" width="18" height="15" rx="2" fill="#13122e" stroke="#312e81" strokeWidth="0.6"/>

          {/* Side mirrors — curved blades */}
          <path d="M-11,-4 Q-16,-4 -16,0 Q-16,3 -11,2 Z" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>
          <path d="M 11,-4 Q 16,-4  16,0 Q 16,3  11,2 Z" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>

          {/* Rear window */}
          <path d="M-5,10 L5,10 L4,16 L-4,16 Z" fill="#818cf8" opacity="0.45"/>

          {/* Trunk vent lines (3 lines like reference) */}
          <line x1="-5" y1="17" x2="5" y2="17" stroke="#6366f1" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
          <line x1="-4" y1="19" x2="4" y2="19" stroke="#6366f1" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>
          <line x1="-3" y1="21" x2="3" y2="21" stroke="#6366f1" strokeWidth="0.9" strokeLinecap="round" opacity="0.7"/>

          {/* Lightning bolt in cabin (like reference) */}
          <path d="M1,-3 L-2,1 L0,1 L-1,5 L2,1 L0,1 Z" fill="#7c5cf6" opacity="0.9"/>

          {/* Headlights */}
          <rect x="-8" y="-22" width="4" height="2" rx="1" fill="#c4b5fd"/>
          <rect x=" 4" y="-22" width="4" height="2" rx="1" fill="#c4b5fd"/>

          {/* Tail lights */}
          <rect x="-8" y="20" width="4" height="2" rx="1" fill="#7c3aed"/>
          <rect x=" 4" y="20" width="4" height="2" rx="1" fill="#7c3aed"/>

          {/* 4 WHEELS */}
          <rect x="-16" y="-16" width="7" height="11" rx="3.5" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2"/>
          <rect x="  9" y="-16" width="7" height="11" rx="3.5" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2"/>
          <rect x="-16" y="  5" width="7" height="11" rx="3.5" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2"/>
          <rect x="  9" y="  5" width="7" height="11" rx="3.5" fill="#0f172a" stroke="#818cf8" strokeWidth="1.2"/>
          <circle cx="-12.5" cy="-10.5" r="2.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>
          <circle cx=" 12.5" cy="-10.5" r="2.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>
          <circle cx="-12.5" cy=" 10.5" r="2.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>
          <circle cx=" 12.5" cy=" 10.5" r="2.5" fill="#312e81" stroke="#6366f1" strokeWidth="0.8"/>
          <circle cx="-12.5" cy="-10.5" r="1" fill="#818cf8"/>
          <circle cx=" 12.5" cy="-10.5" r="1" fill="#818cf8"/>
          <circle cx="-12.5" cy=" 10.5" r="1" fill="#818cf8"/>
          <circle cx=" 12.5" cy=" 10.5" r="1" fill="#818cf8"/>

          {/* Front indicator */}
          <circle cx="0" cy="-23" r="1.5" fill="#7c5cf6"/>
          <circle cx="0" cy="-23" r="0.8" fill="white"/>
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
