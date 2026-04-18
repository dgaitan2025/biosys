import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { endpoints } from './endpoints'
import router from '../router'

const http = axios.create({
  baseURL: 'https://enrolamiento-production.up.railway.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpcat = axios.create({
  baseURL: 'https://catalogosbiosys-production.up.railway.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const refreshClient = axios.create({
  baseURL: 'https://enrolamiento-production.up.railway.app',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// evita múltiples refresh simultáneos
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
    refreshPromise = refreshClient
      .post(endpoints.auth.refresh, {
        refreshToken: authStore.refreshToken
      })
      .then((res) => {
        const newToken = res?.data?.data?.accessToken

        if (!newToken) {
          throw new Error('No se recibió un nuevo accessToken')
        }

        authStore.updateAccessToken(newToken)
        return newToken
      })
      .finally(() => {
        refreshPromise = null
      })
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

/* =========================
   INTERCEPTOR REQUEST HTTP
   ========================= */
http.interceptors.request.use(
  async (config) => {
    const authStore = useAuthStore()
    let token = authStore.token

    const rutasPublicas = [
      '/seguridad/api/auth/login',
      '/seguridad/api/auth/refresh'
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
  async (error) => {
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

        return http(originalRequest)
      } catch (err) {
        await cerrarSesion()
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

/* =============================
   INTERCEPTOR REQUEST HTTPCAT
   ============================= */
httpcat.interceptors.request.use(
  async (config) => {
    await asegurarSesion()
    return config
  },
  (error) => Promise.reject(error)
)

export { http, httpcat }
export default http