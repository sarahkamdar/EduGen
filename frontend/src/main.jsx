import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

if (apiBaseUrl) {
  const nativeFetch = window.fetch.bind(window)
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/')) {
      const isBackendRoute =
        input.startsWith('/auth') ||
        input.startsWith('/content') ||
        input.startsWith('/health')

      if (isBackendRoute) {
        return nativeFetch(`${apiBaseUrl}${input}`, init)
      }
    }

    return nativeFetch(input, init)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
