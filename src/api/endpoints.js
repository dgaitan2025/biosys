export const endpoints = {
  auth: {
    login: '/seguridad/api/auth/login',
    refresh: '/seguridad/api/auth/refresh',
    logout: '/seguridad/api/auth/logout',
    perfil: '/seguridad/api/acceso/permiso'
  },
  catalogos: {
    departametos: '/api/departamento/ObtenerDepartamentos',
    creardepartamento: '/api/departamento/CrearDepartamento',
    eliminarDepartamento: '/api/departamento/EliminarDepartamento',
    actualizarDepartamento: '/api/departamento/ActualizarDepartamento'
    
  },
  usuarios: '/seguridad/api/acceso/permiso'
}