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

        {/* Car top-down */}
        <g transform={`translate(${cx},${cy})`}>
          {/* 4 wheels */}
          <circle cx="-13" cy="-13" r="4.5" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <circle cx=" 13" cy="-13" r="4.5" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <circle cx="-13" cy=" 13" r="4.5" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <circle cx=" 13" cy=" 13" r="4.5" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <circle cx="-13" cy="-13" r="1.8" fill="#4338ca"/>
          <circle cx=" 13" cy="-13" r="1.8" fill="#4338ca"/>
          <circle cx="-13" cy=" 13" r="1.8" fill="#4338ca"/>
          <circle cx=" 13" cy=" 13" r="1.8" fill="#4338ca"/>

          {/* Body */}
          <rect x="-10" y="-20" width="20" height="40" rx="5" fill="#3730a3"/>

          {/* Hood */}
          <rect x="-8" y="-20" width="16" height="8" rx="4" fill="#4338ca"/>

          {/* Windshield */}
          <rect x="-7" y="-12" width="14" height="7" rx="1" fill="#818cf8" opacity="0.75"/>

          {/* Cabin roof */}
          <rect x="-8" y="-5" width="16" height="16" rx="2" fill="#1e1b4b"/>

          {/* Rear window */}
          <rect x="-7" y="11" width="14" height="7" rx="1" fill="#818cf8" opacity="0.45"/>

          {/* Headlights */}
          <rect x="-9" y="-20" width="4" height="2.5" rx="1" fill="#a78bfa"/>
          <rect x=" 5" y="-20" width="4" height="2.5" rx="1" fill="#a78bfa"/>

          {/* Tail lights */}
          <rect x="-9" y="17.5" width="4" height="2.5" rx="1" fill="#7c3aed"/>
          <rect x=" 5" y="17.5" width="4" height="2.5" rx="1" fill="#7c3aed"/>

          {/* Mirrors */}
          <rect x="-14" y="-6" width="4" height="3" rx="1" fill="#312e81" stroke="#6366f1" strokeWidth="0.5"/>
          <rect x=" 10" y="-6" width="4" height="3" rx="1" fill="#312e81" stroke="#6366f1" strokeWidth="0.5"/>

          {/* Front dot */}
          <circle cx="0" cy="-22" r="2" fill="#7c5cf6"/>
          <circle cx="0" cy="-22" r="1" fill="white" opacity="0.9"/>
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
