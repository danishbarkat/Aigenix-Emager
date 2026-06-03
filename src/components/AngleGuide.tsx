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

        {/* Car top-down — narrow body, wheels poking out sides */}
        <g transform={`translate(${cx},${cy})`}>

          {/* Body — narrow so wheels stick out */}
          <rect x="-8" y="-19" width="16" height="38" rx="5" fill="#3730a3"/>

          {/* Hood area */}
          <rect x="-7" y="-19" width="14" height="7" rx="4" fill="#4338ca"/>

          {/* Windshield */}
          <rect x="-6" y="-12" width="12" height="6" rx="1.5" fill="#a5b4fc" opacity="0.8"/>

          {/* Cabin dark roof */}
          <rect x="-7" y="-6" width="14" height="14" rx="2" fill="#1e1b4b"/>

          {/* Rear window */}
          <rect x="-6" y="8" width="12" height="6" rx="1.5" fill="#a5b4fc" opacity="0.5"/>

          {/* Trunk */}
          <rect x="-7" y="14" width="14" height="5" rx="3" fill="#4338ca"/>

          {/* Headlights */}
          <rect x="-7" y="-19" width="4" height="2" rx="1" fill="#c4b5fd"/>
          <rect x=" 3" y="-19" width="4" height="2" rx="1" fill="#c4b5fd"/>

          {/* Tail lights */}
          <rect x="-7" y="17" width="4" height="2" rx="1" fill="#7c3aed"/>
          <rect x=" 3" y="17" width="4" height="2" rx="1" fill="#7c3aed"/>

          {/* Wheels — drawn LAST so they appear on top / outside body */}
          <rect x="-13" y="-16" width="6" height="9" rx="3" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <rect x="  7" y="-16" width="6" height="9" rx="3" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <rect x="-13" y="  7" width="6" height="9" rx="3" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          <rect x="  7" y="  7" width="6" height="9" rx="3" fill="#0f172a" stroke="#6366f1" strokeWidth="1"/>
          {/* Rims */}
          <circle cx="-10" cy="-11.5" r="1.8" fill="#4338ca"/>
          <circle cx=" 10" cy="-11.5" r="1.8" fill="#4338ca"/>
          <circle cx="-10" cy=" 11.5" r="1.8" fill="#4338ca"/>
          <circle cx=" 10" cy=" 11.5" r="1.8" fill="#4338ca"/>

          {/* Mirrors */}
          <rect x="-12" y="-5" width="4" height="3" rx="1" fill="#312e81"/>
          <rect x="  8" y="-5" width="4" height="3" rx="1" fill="#312e81"/>

          {/* Front indicator */}
          <circle cx="0" cy="-21" r="1.8" fill="#7c5cf6"/>
          <circle cx="0" cy="-21" r="0.9" fill="white"/>
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
