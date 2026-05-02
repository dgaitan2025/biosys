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
    actualizarDepartamento: '/api/departamento/ActualizarDepartamento',
    catalogosSolicitud: '/biosys/api/gestion_afiliados/Solicitud/catalogos'

    
  },
  solicitudes: {
    consultar: '/biosys/api/gestion_afiliados/Solicitud/consultar',
    crear: '/biosys/api/gestion_afiliados/Solicitud/guardar',
    actualizar: '/biosys/api/gestion_afiliados/Solicitud/actualizar',
    eliminar: '/biosys/api/gestion_afiliados/Solicitud/eliminar',
    aprobar: '/biosys/api/gestion_afiliados/Solicitud/aprobar',
    rechazar: '/biosys/api/gestion_afiliados/Solicitud/rechazar',
    resumen: '/biosys/api/gestion_afiliados/Solicitud/consultar_estadistico'

  },

  usuarios: '/seguridad/api/acceso/permiso'
}