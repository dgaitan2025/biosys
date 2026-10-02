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

    const token = response?.data?.data?.accessToken
    const data = response?.data?.data
    const mensaje = response?.data?.mensaje

    closeAlert()

    if (!token) {
      error(mensaje || 'Error al iniciar sesión')
      return
    }

    success(`Bienvenido a BioSys ${data.nickname}`);

    authStore.setAuthData(data)

    router.push('/usuarios')

  } catch (err) {
    // antes el parámetro se llamaba "error" y tapaba la función error() de useAlert:
    // el catch lanzaba TypeError y el alert de carga quedaba abierto
    closeAlert()
    console.error('Error en login:', err?.response?.data || err?.message)
    error('Valide su conexión e intente de nuevo')
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