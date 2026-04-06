import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'


const http = axios.create({
  baseURL: 'http://www.server.daossystem.pro:5027', 
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token

    // rutas donde NO se debe enviar token
    const rutasPublicas = ['/seguridad/api/auth/login']

    const esPublica = rutasPublicas.some(ruta =>
      config.url.includes(ruta)
    )

    if (token && !esPublica) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

http.interceptors.response.use(
  
  (response) => response,
  (error) => {
    const router = useRouter()
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

export default http