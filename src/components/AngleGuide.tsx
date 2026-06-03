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

        {/* SUV top-down — boxy wide style */}
        <g transform={`translate(${cx},${cy})`}>
          <defs>
            <linearGradient id="suvPaint" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#2d2a78"/>
              <stop offset="35%"  stopColor="#3d3a9a"/>
              <stop offset="65%"  stopColor="#3d3a9a"/>
              <stop offset="100%" stopColor="#2d2a78"/>
            </linearGradient>
            <linearGradient id="suvRoofG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#13122e"/>
              <stop offset="100%" stopColor="#1e1b4b"/>
            </linearGradient>
          </defs>

          {/* Shadow */}
          <rect x="-16" y="-23" width="33" height="47" rx="5"
            fill="#000" opacity="0.28" transform="translate(1.5,1.5)"/>

          {/* ── WHEELS (behind body) ── */}
          {/* Front-left */}
          <rect x="-21" y="-19" width="8" height="12" rx="3.5"
            fill="#111" stroke="#4338ca" strokeWidth="0.7"/>
          <rect x="-19" y="-17" width="4" height="8" rx="2"
            fill="#2d2a78"/>
          <circle cx="-17" cy="-13" r="1.5" fill="#6366f1" opacity="0.8"/>

          {/* Front-right */}
          <rect x="13" y="-19" width="8" height="12" rx="3.5"
            fill="#111" stroke="#4338ca" strokeWidth="0.7"/>
          <rect x="15" y="-17" width="4" height="8" rx="2"
            fill="#2d2a78"/>
          <circle cx="17" cy="-13" r="1.5" fill="#6366f1" opacity="0.8"/>

          {/* Rear-left */}
          <rect x="-21" y="8" width="8" height="12" rx="3.5"
            fill="#111" stroke="#4338ca" strokeWidth="0.7"/>
          <rect x="-19" y="10" width="4" height="8" rx="2"
            fill="#2d2a78"/>
          <circle cx="-17" cy="14" r="1.5" fill="#6366f1" opacity="0.8"/>

          {/* Rear-right */}
          <rect x="13" y="8" width="8" height="12" rx="3.5"
            fill="#111" stroke="#4338ca" strokeWidth="0.7"/>
          <rect x="15" y="10" width="4" height="8" rx="2"
            fill="#2d2a78"/>
          <circle cx="17" cy="14" r="1.5" fill="#6366f1" opacity="0.8"/>

          {/* ── MAIN BODY ── wide boxy SUV shape */}
          <path d="
            M-14,-20 Q-15,-23 -10,-24 Q0,-25 10,-24 Q15,-23 14,-20
            L15,-12 L15,18 Q15,22 11,23
            L-11,23 Q-15,22 -15,18
            L-15,-12 Z"
            fill="url(#suvPaint)"/>

          {/* Body side highlights */}
          <rect x="-15" y="-10" width="1.5" height="26" rx="0.5"
            fill="white" opacity="0.07"/>
          <rect x="13.5" y="-10" width="1.5" height="26" rx="0.5"
            fill="white" opacity="0.07"/>

          {/* ── HOOD ── */}
          <path d="M-13,-20 Q0,-26 13,-20 L14,-12 L-14,-12 Z"
            fill="#35328c"/>
          {/* Hood creases */}
          <line x1="-5" y1="-24" x2="-6" y2="-12"
            stroke="white" strokeWidth="0.4" opacity="0.1"/>
          <line x1="5" y1="-24" x2="6" y2="-12"
            stroke="white" strokeWidth="0.4" opacity="0.1"/>
          {/* Hood center ridge */}
          <line x1="0" y1="-25" x2="0" y2="-12"
            stroke="white" strokeWidth="0.6" opacity="0.08"/>

          {/* ── WINDSHIELD ── */}
          <path d="M-10,-12 L-11,-4 L11,-4 L10,-12 Z"
            fill="#6366f1" opacity="0.5"/>
          <path d="M-7,-11 L-8,-5 L-3,-5 L-2,-11 Z"
            fill="white" opacity="0.15"/>

          {/* ── CABIN ROOF ── */}
          <rect x="-11" y="-4" width="22" height="20" rx="1.5"
            fill="url(#suvRoofG)"/>

          {/* Sunroof */}
          <rect x="-6" y="-2" width="12" height="11" rx="2"
            fill="#0d0c24" stroke="#3730a3" strokeWidth="0.7"/>
          <rect x="-4.5" y="-0.5" width="9" height="8" rx="1.5"
            fill="#16144a" opacity="0.8"/>
          <path d="M-4,-0.5 L-1,-0.5 L-2,7 L-4.5,7 Z"
            fill="white" opacity="0.07"/>

          {/* Roof rack lines */}
          <line x1="-9" y1="1"  x2="9" y2="1"  stroke="#3730a3" strokeWidth="0.5" opacity="0.5"/>
          <line x1="-9" y1="16" x2="9" y2="16" stroke="#3730a3" strokeWidth="0.5" opacity="0.5"/>

          {/* Door seam */}
          <line x1="-11" y1="6" x2="11" y2="6"
            stroke="#1e1b4b" strokeWidth="1" opacity="0.8"/>

          {/* ── REAR WINDOW ── */}
          <path d="M-10,16 L10,16 L9,22 L-9,22 Z"
            fill="#4338ca" opacity="0.45"/>
          <path d="M-6,16 L6,16 L5,22 L-5,22 Z"
            fill="#818cf8" opacity="0.2"/>

          {/* ── HEADLIGHTS ── */}
          <path d="M-14,-19 L-10,-24 L-6,-24 L-10,-19 Z"
            fill="#7c5cf6"/>
          <path d="M14,-19 L10,-24 L6,-24 L10,-19 Z"
            fill="#7c5cf6"/>
          <path d="M-13,-23 L-9,-23 L-10,-20 L-13,-20 Z"
            fill="white" opacity="0.4"/>
          <path d="M13,-23 L9,-23 L10,-20 L13,-20 Z"
            fill="white" opacity="0.4"/>

          {/* ── TAIL LIGHTS ── */}
          <path d="M-15,17 L-11,23 L-7,23 L-11,17 Z"
            fill="#7c3aed"/>
          <path d="M15,17 L11,23 L7,23 L11,17 Z"
            fill="#7c3aed"/>

          {/* ── BUMPER CORNER GUARDS (like reference) ── */}
          <rect x="-16" y="-21" width="4" height="4" rx="1"
            fill="#7C5CF6" opacity="0.9"/>
          <rect x="12"  y="-21" width="4" height="4" rx="1"
            fill="#7C5CF6" opacity="0.9"/>
          <rect x="-16" y="18"  width="4" height="4" rx="1"
            fill="#5b21b6" opacity="0.9"/>
          <rect x="12"  y="18"  width="4" height="4" rx="1"
            fill="#5b21b6" opacity="0.9"/>

          {/* ── MIRRORS ── */}
          <path d="M-15,-9 Q-19,-9 -19,-6 Q-19,-3 -15,-4 Z"
            fill="#3730a3" stroke="#6366f1" strokeWidth="0.5"/>
          <path d="M15,-9 Q19,-9 19,-6 Q19,-3 15,-4 Z"
            fill="#3730a3" stroke="#6366f1" strokeWidth="0.5"/>

          {/* Front direction dot */}
          <circle cy="-26" cx="0" r="2" fill="#7C5CF6"/>
          <circle cy="-26" cx="0" r="1" fill="white" opacity="0.9"/>
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
