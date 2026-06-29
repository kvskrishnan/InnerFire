import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './app/App'

// Auto-unregister service worker in development to avoid caching/HMR conflict reloads
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('[Dev] Unregistered active service worker to prevent caching conflicts.')
          window.location.reload()
        }
      })
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
