import { ObjectDetector, FilesetResolver } from '@mediapipe/tasks-vision'

type Status = 'loading' | 'ready' | 'error'

const VEHICLE_LABELS = new Set(['car', 'truck', 'bus', 'motorcycle', 'bicycle', 'van'])
const WASM_CDN  = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/1/efficientdet_lite0.tflite'

let _detector: ObjectDetector | null = null
let _status: Status = 'loading'
const _listeners: Array<(s: Status) => void> = []

export function preloadVehicleDetector(): void {
  FilesetResolver.forVisionTasks(WASM_CDN)
    .then(vision =>
      ObjectDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        scoreThreshold: 0.35,
        runningMode: 'IMAGE',
      })
    )
    .then(detector => {
      _detector = detector
      _status = 'ready'
      _listeners.splice(0).forEach(fn => fn('ready'))
    })
    .catch(() => {
      _status = 'error'
      _listeners.splice(0).forEach(fn => fn('error'))
    })
}

// Synchronous — returns true if a vehicle is visible, true if model not ready yet (allow through)
export function hasVehicleInFrame(src: HTMLVideoElement | HTMLCanvasElement): boolean {
  if (!_detector) return true
  try {
    const result = _detector.detect(src as unknown as HTMLImageElement)
    return result.detections.some(d =>
      d.categories.some(c => VEHICLE_LABELS.has(c.categoryName) && c.score > 0.35)
    )
  } catch {
    return true // never block on detection errors
  }
}

export const getDetectorStatus = (): Status => _status

export function onDetectorReady(fn: (s: Status) => void): void {
  if (_status !== 'loading') { fn(_status); return }
  _listeners.push(fn)
}
