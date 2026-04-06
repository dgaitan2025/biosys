import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/landing/LandingPage.vue'
import LoginView from '../views/auth/LoginView.vue'
import UsuariosView from '../views/usuarios/UsuariosView.vue'
import http from '../api/nodohttp'
import { endpoints } from '../api/endpoints'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/usuarios',
    name: 'usuarios',
    component: UsuariosView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = authStore.token

  const validarToken = async () => {
    try {
      await http.get(endpoints.auth.perfil, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return true
    } catch (error) {
      return false
    }
  }

  if (requiresAuth) {
    if (!token) {
      return { name: 'login' }
    }

    const esValido = await validarToken()

    if (!esValido) {
      authStore.logout()
      return { name: 'login' }
    }
  }

  if (to.name === 'login' && token) {
    const esValido = await validarToken()

    if (esValido) {
      return { name: 'usuarios' }
    } else {
      authStore.logout()
    }
  }

  return true
})

export default router