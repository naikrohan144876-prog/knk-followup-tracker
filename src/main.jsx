import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'  // ✅ This line makes the styling appear

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
