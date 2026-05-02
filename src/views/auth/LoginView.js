import { useDisplay } from 'vuetify'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useAuthStore } from '../../stores/auth'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'





export function useLogin() {
  const { success, error, confirm } = useAlert()
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
    alertLoading('Iniciando sesión', 'Validando sus credenciales')
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
    const mensaje = response?.data?.mensaje
    

    closeAlert()

    if (!token) {
      error(mensaje || 'Error al iniciar sesión')
      return
    }
    console.log("DATA", data);
    success(`Bienvenido a BioSys ${data.nickname}`);
    // guardar token
    
    authStore.setAuthData(data)

    router.push('/usuarios')

  } catch (error) {
    error('valide conexión e intente de nuevo')
    
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