export type AppPage = 'home' | 'capture' | 'review' | 'view360' | 'sessions'

export interface CapturedFrame {
  angle: number
  dataUrl: string
}

export interface Session {
  id: string          // e.g. "DM-A3F2"
  createdAt: string   // ISO date string
  frameCount: number
  thumbnail: string   // first frame dataUrl (compressed)
  frames: CapturedFrame[]
}

export const TOTAL_FRAMES = 18
export const ANGLE_STEP = 360 / TOTAL_FRAMES

export const POSITION_LABELS: Record<number, string> = {
  0:  'Front',       1:  'Front',
  2:  'Front-Right', 3:  'Front-Right',
  4:  'Right',       5:  'Right',
  6:  'Back-Right',  7:  'Back-Right',
  8:  'Back',        9:  'Back',
  10: 'Back-Left',   11: 'Back-Left',
  12: 'Left',        13: 'Left',
  14: 'Front-Left',  15: 'Front-Left',
  16: 'Near Front',  17: 'Near Front',
}
