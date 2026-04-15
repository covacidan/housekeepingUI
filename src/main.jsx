import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import keycloak from './keycloak'
import 'bootstrap/dist/css/bootstrap.min.css'

keycloak
  .init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false })
  .then((authenticated) => {
    if (!authenticated) return

    const role = keycloak.realmAccess?.roles?.find((r) => r === 'ADMIN' || r === 'RECORDER') ?? ''
    const email =
      keycloak.tokenParsed?.email ??
      keycloak.tokenParsed?.preferred_username ??
      ''

    localStorage.setItem('token', keycloak.token)
    localStorage.setItem('role', role)
    localStorage.setItem('email', email)

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(30)
        .then(() => localStorage.setItem('token', keycloak.token))
        .catch(() => keycloak.logout())
    }

    keycloak.onAuthRefreshSuccess = () => {
      localStorage.setItem('token', keycloak.token)
    }

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
  .catch((err) => console.error('Keycloak init error', err))
