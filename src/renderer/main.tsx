import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import './i18n/i18n'
import App from './App'
import { NotificationProvider } from './components/NotificationSystem'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
)