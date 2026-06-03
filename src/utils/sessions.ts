import type { Session, CapturedFrame } from '../types'

const STORAGE_KEY = 'dmager_sessions'

function genId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return 'DM-' + Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

function compressThumb(dataUrl: string): string {
  // return as-is for thumbnail (already JPEG); could resize on canvas if needed
  return dataUrl
}

export function saveSession(frames: CapturedFrame[]): Session {
  const session: Session = {
    id: genId(),
    createdAt: new Date().toISOString(),
    frameCount: frames.length,
    thumbnail: compressThumb(frames[0]?.dataUrl ?? ''),
    frames,
  }

  const existing = loadAllSessions()
  // keep max 10 sessions
  const updated = [session, ...existing].slice(0, 10)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage full — drop oldest and retry
    const trimmed = [session, ...existing].slice(0, 3)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)) } catch { /* ignore */ }
  }
  return session
}

export function loadAllSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function deleteSession(id: string): void {
  const updated = loadAllSessions().filter(s => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
