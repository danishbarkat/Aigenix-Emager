interface Props {
  size?: number
  rounded?: boolean
}

export default function OrbitLogo({ size = 36, rounded = true }: Props) {
  const id = `og${size}` // unique gradient id per size
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id={`${id}bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4C35D4"/>
          <stop offset="100%" stopColor="#7C5CF6"/>
        </linearGradient>
        <radialGradient id={`${id}planet`} cx="38%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#C4B5FD"/>
        </radialGradient>
        <radialGradient id={`${id}dot`} cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#A78BFA"/>
        </radialGradient>
        <filter id={`${id}glow`}>
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="40" height="40" rx={rounded ? 10 : 0} fill={`url(#${id}bg)`}/>

      {/* Orbit ring — back half (faded, behind planet) */}
      <path
        d="M 7.5 20 A 12.5 5.2 0 0 1 32.5 20"
        fill="none" stroke="white" strokeWidth="1.6"
        opacity="0.22"
        transform="rotate(-22 20 20)"
      />

      {/* Planet */}
      <circle cx="20" cy="20" r="6.2" fill={`url(#${id}planet)`} filter={`url(#${id}glow)`}/>
      {/* Shine */}
      <ellipse cx="18" cy="17.5" rx="2.2" ry="1.4" fill="white" opacity="0.35" transform="rotate(-20 18 17.5)"/>

      {/* Orbit ring — front half (over planet) */}
      <path
        d="M 7.5 20 A 12.5 5.2 0 0 0 32.5 20"
        fill="none" stroke="white" strokeWidth="1.6"
        opacity="0.85"
        transform="rotate(-22 20 20)"
      />

      {/* Orbiting moon/dot */}
      <circle cx="24.8" cy="12.8" r="3.2" fill={`url(#${id}dot)`} filter={`url(#${id}glow)`}/>
      {/* Moon shine */}
      <circle cx="23.8" cy="11.9" r="1.1" fill="white" opacity="0.55"/>
    </svg>
  )
}
