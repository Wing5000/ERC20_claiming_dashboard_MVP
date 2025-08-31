import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ToastProvider from './components/ToastProvider.jsx'

// Store referral code from URL in localStorage with 30-day expiry
const params = new URLSearchParams(window.location.search)
const ref = params.get('ref')
if (ref) {
  const data = { value: ref, expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 }
  localStorage.setItem('referral', JSON.stringify(data))
}

const root = createRoot(document.getElementById('root'))
root.render(
  <ToastProvider>
    <App />
  </ToastProvider>
)
