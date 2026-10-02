import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { endpoints } from './endpoints'
import router from '../router'

// URLs configurables por variables de entorno de Vite (ver .env.example).
// En Docker se compilan vacías: el front y los APIs quedan en el mismo origen
// y nginx redirige /seguridad, /biosys y /api a cada contenedor.
// Otras URLs usadas: https://seguridadbiosys.somee.com, https://biosyssecure.onrender.com,
// http://biosysapi.somee.com, https://biosyssol.onrender.com
const SEGURIDAD_URL = import.meta.env.VITE_SEGURIDAD_URL ?? 'http://localhost:5224'
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5041'
const HUELLA_URL = import.meta.env.VITE_HUELLA_URL ?? 'http://localhost:5056'

const http = axios.create({
  baseURL: SEGURIDAD_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpshuella = axios.create({
  baseURL: HUELLA_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpcat = axios.create({
  baseURL: API_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const httpsol = axios.create({
  baseURL: API_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Cliente sin interceptores: así una falla del refresh no dispara otro refresh
const refreshClient = axios.create({
  baseURL: SEGURIDAD_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
})

const rutasPublicas = [
  endpoints.auth.login,
  endpoints.auth.refresh,
  endpoints.auth.logout
]

const esRutaPublica = (url) => rutasPublicas.some((ruta) => url?.includes(ruta))

// Se renueva un poco antes del vencimiento para que el token no expire
// mientras la petición va en camino.
const MARGEN_EXPIRACION_MS = 30 * 1000

let refreshPromise = null

// El payload de un JWT viene en base64url ('-' y '_', sin padding); atob solo
// entiende base64 normal y fallaba con algunos tokens, marcándolos como vencidos.
const leerPayload = (token) => {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const conPadding = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  return JSON.parse(atob(conPadding))
}

const tokenExpirado = (token) => {
  if (!token) return true

  try {
    const exp = leerPayload(token).exp * 1000
    return Date.now() >= exp - MARGEN_EXPIRACION_MS
  } catch (error) {
    return true
  }
}

const errorSesionExpirada = (mensaje) => {
  const err = new Error(mensaje)
  err.sesionExpirada = true
  return err
}

// Limpia la sesión local y manda al login (sin llamar al servidor:
// si llegamos aquí el refresh token ya no es válido).
const finalizarSesion = () => {
  const authStore = useAuthStore()
  authStore.clearSession()

  if (router.currentRoute.value.name !== 'login') {
    router.push('/login')
  }
}

const renovarToken = async () => {
  const authStore = useAuthStore()

  if (!authStore.refreshToken) {
    authStore.clearSession()
    throw errorSesionExpirada('No existe refresh token')
  }

  // Un solo refresh a la vez: las peticiones simultáneas esperan el mismo resultado
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await refreshClient.post(endpoints.auth.refresh, {
          refreshToken: authStore.refreshToken
        })

        const newToken = res?.data?.data?.accessToken

        if (!newToken) {
          // codigo 401 = refresh vencido/revocado. Cualquier otro código es un error
          // del servidor y no debe cerrar la sesión del usuario.
          if (res?.data?.codigo === 401) {
            authStore.clearSession()
            throw errorSesionExpirada('Sesión expirada')
          }
          throw new Error(res?.data?.mensaje || 'No se pudo renovar la sesión')
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
    throw errorSesionExpirada('No existe access token')
  }

  if (!tokenExpirado(token)) {
    return token
  }

  return await renovarToken()
}

// Usada por el router: true si hay sesión utilizable (renovándola si hace falta)
const sesionActiva = async () => {
  const authStore = useAuthStore()
  if (!authStore.token && !authStore.refreshToken) return false

  try {
    await asegurarSesion()
    return true
  } catch (error) {
    if (error.sesionExpirada) {
      authStore.clearSession()
      return false
    }
    // Error de red/servidor: se conserva la sesión, las peticiones lo reintentarán
    return !!authStore.token
  }
}

const agregarTokenARequest = async (config) => {
  if (esRutaPublica(config.url)) return config

  try {
    const token = await asegurarSesion()
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (error) {
    if (error.sesionExpirada) finalizarSesion()
    throw error
  }
}

const manejarErrorAutenticacion = async (error, clienteAxios) => {
  const originalRequest = error.config

  if (!error.response || !originalRequest) {
    return Promise.reject(error)
  }

  const status = error.response.status

  if (status !== 401 || esRutaPublica(originalRequest.url) || originalRequest._retry) {
    return Promise.reject(error)
  }

  // El servidor rechazó el token (p. ej. reloj desfasado o token revocado): se renueva y
  // se reintenta una sola vez
  originalRequest._retry = true

  try {
    const newToken = await renovarToken()

    originalRequest.headers = originalRequest.headers || {}
    originalRequest.headers.Authorization = `Bearer ${newToken}`

    return clienteAxios(originalRequest)
  } catch (err) {
    if (err.sesionExpirada) finalizarSesion()
    return Promise.reject(err)
  }
}

for (const cliente of [http, httpcat, httpsol]) {
  cliente.interceptors.request.use(agregarTokenARequest, (error) => Promise.reject(error))
  cliente.interceptors.response.use(
    (response) => response,
    (error) => manejarErrorAutenticacion(error, cliente)
  )
}

export { http, httpcat, httpsol, httpshuella, sesionActiva, tokenExpirado }
export default http
