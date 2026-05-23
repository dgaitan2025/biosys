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
    catalogosSolicitud: '/biosys/api/gestion_afiliados/Solicitud/catalogos',
    eventos: '/biosys/api/asistencia_biometrica/evento/consultar'


  },
  asistencia: {
    asistenciaRostro: '/biosys/api/asistencia_biometrica/EventoAfiliado/guardar',
    asistenciaHuella: '/biosys/api/asistencia_biometrica/EventoAfiliado/guardar_por_huella'
  },
  solicitudes: {
    consultar: '/biosys/api/gestion_afiliados/Solicitud/consultar',
    crear: '/biosys/api/gestion_afiliados/Solicitud/guardar',
    actualizar: '/biosys/api/gestion_afiliados/Solicitud/actualizar',
    eliminar: '/biosys/api/gestion_afiliados/Solicitud/eliminar',
    aprobar: '/biosys/api/gestion_afiliados/Solicitud/aprobar',
    rechazar: '/biosys/api/gestion_afiliados/Solicitud/rechazar',
    resumen: '/biosys/api/gestion_afiliados/Solicitud/consultar_estadistico',
    huella: '/api/BiometriaAfiliado/consultar-huella',
    segmentarRostro: '/api/BiometriaAfiliado/segmentar-biometria',
    validarRostro: '/api/BiometriaAfiliado/verificar-biometria',
    obtenerAfiliado: '/biosys/api/gestion_afiliados/Afiliado/consultar_actualizacion_by_id',
    crearEvento: '/biosys/api/asistencia_biometrica/evento/guardar',
    solicitudActualizar: '/biosys/api/gestion_afiliados/Solicitud/guardar',

  }, biometriahuella: {
    enrolar: '/api/huella/capturar',
    verificar: '/api/huella/verificar'

  },
  renap: {
    consultar: '/biosys/api/Renap/consultar-busqueda-generica'
  },
  asistenciaBiometrica: {
    eventos: '/biosys/api/asistencia_biometrica/evento/consultar_activos'
  },

  reportes: '/api/Reportes',


  usuarios: '/seguridad/api/acceso/permiso'
}