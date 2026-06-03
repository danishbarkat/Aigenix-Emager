import { useState } from 'react'
import type { AppPage, CapturedFrame, Session } from './types'
import { saveSession } from './utils/sessions'
import HomePage from './components/HomePage'
import CaptureMode from './components/CaptureMode'
import Viewer360 from './components/Viewer360'
import SessionsPage from './components/SessionsPage'

export default function App() {
  const [page, setPage]       = useState<AppPage>('home')
  const [frames, setFrames]   = useState<CapturedFrame[]>([])
  const [sessionId, setSessionId] = useState<string>('')

  const handleCaptureComplete = (captured: CapturedFrame[]) => {
    const session = saveSession(captured)
    setFrames(captured)
    setSessionId(session.id)
    setPage('view360')
  }

  const handleOpenSession = (s: Session) => {
    setFrames(s.frames)
    setSessionId(s.id)
    setPage('view360')
  }

  return (
    <>
      {page === 'home' && (
        <HomePage
          onStart={() => setPage('capture')}
          onView={() => setPage('view360')}
          onSessions={() => setPage('sessions')}
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
          sessionId={sessionId}
          onBack={() => setPage('home')}
          onRecapture={() => setPage('capture')}
        />
      )}
      {page === 'sessions' && (
        <SessionsPage
          onOpen={handleOpenSession}
          onBack={() => setPage('home')}
        />
      )}
    </>
  )
}
