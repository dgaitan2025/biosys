import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/nodohttp'
import { endpoints } from '../api/endpoints'

const STORAGE_KEY = 'datosUsuario'

const leerStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const datos = ref(null)
  const token = ref(null)
  const user = ref(null)
  const rol = ref(null)
  const refreshToken = ref(null)
  const fotografia = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const aplicarDatos = (data) => {
    datos.value = data
    token.value = data?.accessToken || null
    user.value = data?.nickname || null
    rol.value = data?.rol || null
    refreshToken.value = data?.refreshToken || null
    fotografia.value = data?.fotografia || null
  }

  aplicarDatos(leerStorage())

  // Mantiene sincronizadas las pestañas abiertas: si otra pestaña renueva el token,
  // cierra sesión o inicia con otro usuario, esta usa los mismos datos y no un
  // refresh token que ya fue revocado.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      aplicarDatos(leerStorage())
    }
  })

  const setAuthData = (data) => {
    aplicarDatos(data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // Borra la sesión solo en el navegador (sin llamar al servidor)
  const clearSession = () => {
    aplicarDatos(null)

    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }

  const logout = async () => {
    try {
      if (refreshToken.value) {
        await http.post(endpoints.auth.logout, {
          refreshToken: refreshToken.value
        })
      }
    } catch (error) {
      console.error('Error en logout:', error?.response?.data || error.message)
    } finally {
      clearSession()
      router?.push('/login')
    }
  }

  const updateAccessToken = (newToken) => {
    token.value = newToken
    if (datos.value) {
      datos.value.accessToken = newToken
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos.value))
    }
  }

  return {
    datos,
    token,
    refreshToken,
    user,
    rol,
    fotografia,
    isAuthenticated,
    setAuthData,
    clearSession,
    logout,
    updateAccessToken
  }
})
