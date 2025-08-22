import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import './i18n/i18n'
import App from './App'

// Suppress React DevTools suggestion in development
if (process.env.NODE_ENV === 'development') {
  // This prevents React from showing the DevTools download message
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: false,
    supportsFiber: true,
    inject: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)