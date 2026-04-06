import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useAuthStore } from '../../stores/auth'

export function useLogin() {
  const { smAndDown } = useDisplay()
  const router = useRouter()
  const authStore = useAuthStore()

  const visible = ref(false)
  const email = ref('')
  const password = ref('')
  const loading = ref(false)
  const errorMessage = ref('')

  const handleLogin = async () => {
  try {
    loading.value = true

    const response = await http.post(endpoints.auth.login, {
      tipo_usuario: 0,
      usuario: email.value,
      password: password.value,
      fecha_nacimiento: null
    })

    console.log("LOGIN", response);

    const token = response?.data?.data?.accessToken
    const data = response?.data?.data



    if (!token) {
      alert('Credenciales inválidas')
      return
    }

    // guardar token
    
    authStore.setAuthData(data)

    router.push('/usuarios')

  } catch (error) {
    alert('Error al iniciar sesión')
  } finally {
    loading.value = false
  }
}

  return {
    smAndDown,
    visible,
    email,
    password,
    loading,
    errorMessage,
    handleLogin
  }
}