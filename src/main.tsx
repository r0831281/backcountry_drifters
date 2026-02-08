import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './utils/storageTest' // Make testStorage() available in console

const loadStylesDeferred = () => {
  const hydrateStyles = () => {
    void import('./index.css')
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        hydrateStyles()
      },
      { timeout: 1000 },
    )
  } else {
    setTimeout(hydrateStyles, 0)
  }
}

const mountApp = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

const bootstrap = async () => {
  if (import.meta.env.DEV) {
    await import('./index.css')
  } else {
    loadStylesDeferred()
  }

  mountApp()
}

void bootstrap()
