import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { endpoints } from './endpoints'
import router from '../router'

const http = axios.create({
  baseURL: 'http://localhost:5224',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpcat = axios.create({
  baseURL: 'http://localhost:5041',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpsol = axios.create({
  baseURL: 'http://localhost:5041',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const refreshClient = axios.create({
  baseURL: 'http://localhost:5224',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let refreshPromise = null

const tokenExpirado = (token) => {
  if (!token) return true

  try {
    const payloadBase64 = token.split('.')[1]
    const payload = JSON.parse(atob(payloadBase64))
    const exp = payload.exp * 1000

    return Date.now() >= exp
  } catch (error) {
    return true
  }
}

const cerrarSesion = async () => {
  const authStore = useAuthStore()
  await authStore.logout()
  router.push('/login')
}

const renovarToken = async () => {
  const authStore = useAuthStore()

  if (!authStore.refreshToken) {
    await cerrarSesion()
    throw new Error('No existe refresh token')
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await refreshClient.post(endpoints.auth.refresh, {
          refreshToken: authStore.refreshToken
        })

        const newToken = res?.data?.data?.accessToken

        if (!newToken) {
          console.error('Refresh falló: no se recibió accessToken')
          await cerrarSesion()
          throw new Error('Sesión expirada')
        }

        authStore.updateAccessToken(newToken)
        return newToken
      } finally {
        refreshPromise = null
      }
    })()
  }

  return await refreshPromise
}

const asegurarSesion = async () => {
  const authStore = useAuthStore()
  const token = authStore.token

  if (!token) {
    await cerrarSesion()
    throw new Error('No existe access token')
  }

  if (!tokenExpirado(token)) {
    return token
  }

  return await renovarToken()
}

const agregarTokenARequest = async (config) => {
  const token = await asegurarSesion()

  config.headers = config.headers || {}
  config.headers.Authorization = `Bearer ${token}`

  console.log('URL:', `${config.baseURL || ''}${config.url || ''}`)
  console.log('TOKEN ENVIADO:', token)
  console.log('HEADERS:', config.headers)

  return config
}

const manejarErrorAutenticacion = async (error, clienteAxios) => {
  const originalRequest = error.config

  if (!error.response) {
    return Promise.reject(error)
  }

  const status = error.response.status
  const isRefreshRequest = originalRequest?.url?.includes('/seguridad/api/auth/refresh')

  if (status === 401 && isRefreshRequest) {
    await cerrarSesion()
    return Promise.reject(error)
  }

  if (status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    try {
      const newToken = await renovarToken()

      originalRequest.headers = originalRequest.headers || {}
      originalRequest.headers.Authorization = `Bearer ${newToken}`

      return clienteAxios(originalRequest)
    } catch (err) {
      await cerrarSesion()
      return Promise.reject(err)
    }
  }

  return Promise.reject(error)
}

/* =========================
   INTERCEPTOR REQUEST HTTP
   ========================= */
http.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore()
    let token = authStore.token

    const rutasPublicas = [
      '/seguridad/api/auth/login',
      '/seguridad/api/auth/refresh',
      '/seguridad/api/auth/logout'
    ]

    const esPublica = rutasPublicas.some((ruta) =>
      config.url?.includes(ruta)
    )

    if (!esPublica) {
      if (!token) {
        await cerrarSesion()
        return Promise.reject(new Error('No existe access token'))
      }

      if (tokenExpirado(token)) {
        token = await renovarToken()
      }

      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* ==========================
   INTERCEPTOR RESPONSE HTTP
   ========================== */
http.interceptors.response.use(
  (response) => response,
  (error) => manejarErrorAutenticacion(error, http)
)

/* =============================
   INTERCEPTOR REQUEST HTTPCAT
   ============================= */
httpcat.interceptors.request.use(
  agregarTokenARequest,
  (error) => Promise.reject(error)
)

/* ==============================
   INTERCEPTOR RESPONSE HTTPCAT
   ============================== */
httpcat.interceptors.response.use(
  (response) => response,
  (error) => manejarErrorAutenticacion(error, httpcat)
)

/* =============================
   INTERCEPTOR REQUEST HTTPSOL
   ============================= */
httpsol.interceptors.request.use(
  agregarTokenARequest,
  (error) => Promise.reject(error)
)

/* ==============================
   INTERCEPTOR RESPONSE HTTPSOL
   ============================== */
httpsol.interceptors.response.use(
  (response) => response,
  (error) => manejarErrorAutenticacion(error, httpsol)
)

export { http, httpcat, httpsol }
export default http