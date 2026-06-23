import type { ObjectDetection } from '@tensorflow-models/coco-ssd'

type Status = 'loading' | 'ready' | 'error'

let _model: ObjectDetection | null = null
let _status: Status = 'loading'
const _listeners: Array<(s: Status) => void> = []

// Called once from main.tsx — starts loading immediately at app launch
export function preloadVehicleDetector(): void {
  import('@tensorflow/tfjs')
    .then(() => import('@tensorflow-models/coco-ssd'))
    .then(mod => mod.load({ base: 'mobilenet_v2' }))
    .then(model => {
      _model = model
      _status = 'ready'
      _listeners.splice(0).forEach(fn => fn('ready'))
    })
    .catch(() => {
      _status = 'error'
      _listeners.splice(0).forEach(fn => fn('error'))
    })
}

export const getDetectorModel  = (): ObjectDetection | null => _model
export const getDetectorStatus = (): Status => _status

export function onDetectorReady(fn: (s: Status) => void): void {
  if (_status !== 'loading') { fn(_status); return }
  _listeners.push(fn)
}
