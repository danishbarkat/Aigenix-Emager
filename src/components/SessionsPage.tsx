import { useState, useEffect } from 'react'
import type { Session } from '../types'
import { loadAllSessions, deleteSession, formatDate } from '../utils/sessions'

interface Props {
  onOpen:  (s: Session) => void
  onBack:  () => void
}

export default function SessionsPage({ onOpen, onBack }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    setSessions(loadAllSessions())
  }, [])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteSession(id)
    setSessions(s => s.filter(x => x.id !== id))
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={onBack} className="text-sm font-medium" style={{ color: '#5B3FE8' }}>
            ← Back
          </button>
        </div>
        <h1 className="text-2xl font-black" style={{ color: '#1E1B4B' }}>
          Saved Sessions
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: '#F5F3FF' }}>
              <span className="text-3xl">🚗</span>
            </div>
            <p className="text-sm font-medium text-center" style={{ color: '#6B7280' }}>
              No sessions yet.<br />Capture your first 360° view!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => onOpen(s)}
                className="w-full text-left rounded-2xl overflow-hidden border active:opacity-80 transition-opacity"
                style={{ borderColor: '#E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: '#1E1B4B' }}>
                    {s.thumbnail ? (
                      <img src={s.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🚗</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {/* Session ID badge */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#EDE9FE', color: '#5B3FE8' }}>
                        {s.id}
                      </span>
                      <button
                        onClick={e => handleDelete(s.id, e)}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#FEF2F2', color: '#EF4444' }}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                      {formatDate(s.createdAt)}
                    </p>
                    <p className="text-xs font-medium mt-1" style={{ color: '#1E1B4B' }}>
                      {s.frameCount} frames · 360° view
                    </p>
                  </div>
                </div>

                {/* Open bar */}
                <div className="py-2 text-center text-xs font-semibold"
                  style={{ background: '#F5F3FF', color: '#5B3FE8' }}>
                  Tap to open 360° viewer →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
