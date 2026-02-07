import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Tell Telegram the app is ready - REQUIRED for Mini Apps
window.Telegram?.WebApp?.ready()
window.Telegram?.WebApp?.expand()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
