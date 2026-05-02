import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/landing/LandingPage.vue'
import LoginView from '../views/auth/LoginView.vue'
import UsuariosView from '../views/usuarios/UsuariosView.vue'
import { useAuthStore } from '../stores/auth'
import UsuariosHome from '../views/usuarios/UsuariosHome.vue'
import crud from '../views/usuarios/crud.vue'
import solicitudInscripcion from '../views/formularios/solicitudInscripcion.vue'
import AprobacionSolicitud from '../views/formularios/AprobacionSolicitud.vue'
import ResumenSolicitudes from '../views/dashboard/solicitudes.vue'

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
    children: [
      {
        path: '',
        name: 'menu',
        component: UsuariosHome
      },{
        path: '/catalogos/ubicaciones/departamentos',
        name: 'crud',
        component: crud
      },{
        path: '/afiliados/inscripcion',
        name: 'Inscripcion',
        component: solicitudInscripcion
      },{
        path: '/afiliados/aprobacion_solicitud',
        name: 'AprobacionSolicitud',
        component: AprobacionSolicitud
      },
      {
        path: '/afiliados/estadisticas_solicitudes',
        name: 'ResumenSolicitudes',
        component: ResumenSolicitudes
      },

    ],
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


  if (requiresAuth) {
    if (!token) {
      return { name: 'login' }
    }

  }

  if (to.name === 'login' && token) {

    return { name: 'menu' }

  }

  return true
})

export default router