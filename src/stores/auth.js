import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  const stored = localStorage.getItem('datosUsuario')

  const datos = ref(stored ? JSON.parse(stored) : null)
  const token = ref(datos.value?.accessToken || null)
  const user = ref(datos.value?.nickname || null)
  const rol = ref(datos.value?.rol || null)


  const isAuthenticated = computed(() => !!token.value)

  const setAuthData = (data) => {
    datos.value = data
    token.value = data?.accessToken || null
    user.value = data?.nickname || null
    rol.value = data?.rol || null

    localStorage.setItem('datosUsuario', JSON.stringify(data))
  }

  const logout = () => {
    
    datos.value = null
    token.value = null
    user.value = null
    localStorage.removeItem('datosUsuario')
    router.push('/login')
    
  }

  return {
    datos,
    token,
    user,
    rol,
    isAuthenticated,
    setAuthData,
    logout
  }
})