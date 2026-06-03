import { useState } from 'react'
import type { AppPage, CapturedFrame } from './types'
import HomePage from './components/HomePage'
import CaptureMode from './components/CaptureMode'
import Viewer360 from './components/Viewer360'

export default function App() {
  const [page, setPage] = useState<AppPage>('home')
  const [frames, setFrames] = useState<CapturedFrame[]>([])

  const handleCaptureComplete = (captured: CapturedFrame[]) => {
    setFrames(captured)
    setPage('view360')
  }

  return (
    <>
      {page === 'home' && (
        <HomePage
          onStart={() => setPage('capture')}
          onView={() => setPage('view360')}
          frames={frames}
        />
      )}
      {page === 'capture' && (
        <CaptureMode
          onComplete={handleCaptureComplete}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'view360' && frames.length > 0 && (
        <Viewer360
          frames={frames}
          onBack={() => setPage('home')}
          onRecapture={() => setPage('capture')}
        />
      )}
    </>
  )
}
