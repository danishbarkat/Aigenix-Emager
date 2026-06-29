import { useState, useEffect } from 'react'
import type { AppPage, CapturedFrame, Session } from './types'
import { saveSession } from './utils/sessions'
import HomePage from './components/HomePage'
import CaptureMode from './components/CaptureMode'
import Viewer360 from './components/Viewer360'
import SessionsPage from './components/SessionsPage'
import Onboarding from './components/Onboarding'

const ONBOARDING_KEY = 'orbit-onboarding-done'

export default function App() {
  const [page, setPage]           = useState<AppPage>('home')
  const [frames, setFrames]       = useState<CapturedFrame[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [darkMode, setDarkMode]   = useState(() => localStorage.getItem('orbit-dark') === '1')
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('orbit-dark', darkMode ? '1' : '0')
  }, [darkMode])

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

  const doneOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1')
    setShowOnboarding(false)
  }

  return (
    <>
      {page === 'home' && (
        <HomePage
          onStart={() => setPage('capture')}
          onView={() => setPage('view360')}
          onSessions={() => setPage('sessions')}
          frames={frames}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
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
      {showOnboarding && <Onboarding onDone={doneOnboarding} />}
    </>
  )
}
