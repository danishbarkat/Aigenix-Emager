import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { preloadVehicleDetector } from './utils/vehicleDetector'

preloadVehicleDetector() // start loading AI model immediately in background

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
