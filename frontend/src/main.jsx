import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import { installAuthenticatedFetch } from './services/http.js'

installAuthenticatedFetch()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#161622',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.14)',
            fontSize: '13px',
          },
          error: {
            style: {
              border: '1px solid rgba(248,113,113,0.35)',
            },
          },
          success: {
            style: {
              border: '1px solid rgba(34,197,94,0.35)',
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>,
)
