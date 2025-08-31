import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ToastProvider from './components/ToastProvider.jsx'

const root = createRoot(document.getElementById('root'))
root.render(
  <ToastProvider>
    <App />
  </ToastProvider>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}
