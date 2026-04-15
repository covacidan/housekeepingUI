import axios from 'axios'
import keycloak from '../keycloak'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(async (config) => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30)
      localStorage.setItem('token', keycloak.token)
    } catch {
      keycloak.logout()
    }
  }
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      keycloak.logout()
    }
    return Promise.reject(err)
  },
)

export default api
