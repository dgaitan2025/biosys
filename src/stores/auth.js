import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/nodohttp'
import { endpoints } from '../api/endpoints'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const stored = localStorage.getItem('datosUsuario')

  const datos = ref(stored ? JSON.parse(stored) : null)
  const token = ref(datos.value?.accessToken || null)
  const user = ref(datos.value?.nickname || null)
  const rol = ref(datos.value?.rol || null)
  const refreshToken = ref(datos.value?.refreshToken || null)
  const fotografia = ref(datos.value?.fotografia || null)


  const isAuthenticated = computed(() => !!token.value)

  const setAuthData = (data) => {
    datos.value = data
    token.value = data?.accessToken || null
    user.value = data?.nickname || null
    rol.value = data?.rol || null
    refreshToken.value = data?.refreshToken || null
    fotografia.value = data?.fotografia

    localStorage.setItem('datosUsuario', JSON.stringify(data))
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
    datos.value = null
    token.value = null
    user.value = null
    refreshToken.value = null

    localStorage.removeItem('datosUsuario')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')

    router.push('/login')
  }
}

  const updateAccessToken = (newToken) => {
  token.value = newToken
  if (datos.value) {
    datos.value.accessToken = newToken
    localStorage.setItem('datosUsuario', JSON.stringify(datos.value))
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
    logout,
    updateAccessToken
  }
})