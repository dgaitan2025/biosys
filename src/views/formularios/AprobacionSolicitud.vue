<template>
  <v-container fluid class="pa-6">
    <v-card elevation="4" rounded="xl">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold">Aprobación de solicitudes</h2>
          <p class="text-body-2 text-grey-darken-1 mb-0">
            Revisión, validación, aprobación o rechazo de solicitudes de afiliación.
          </p>
        </div>

        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" @click="consultarSolicitudes"
          :loading="loading">
          Actualizar
        </v-btn>

        <v-btn color="primary" prepend-icon="mdi-home" to="/usuarios">
          
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-text-field v-model="buscar" label="Buscar por nombre, DPI o correo" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="comfortable" clearable />
          </v-col>

          <v-col cols="12" md="3">
            <v-select v-model="filtroEstado" :items="estadosFiltro" label="Filtrar por estado" variant="outlined"
              density="comfortable" clearable />
          </v-col>
        </v-row>

        <v-data-table :headers="headers" :items="solicitudesFiltradas" :loading="loading" item-value="id_solicitud"
          class="rounded-lg">
          <template #item.nombre_completo="{ item }">
            <div class="font-weight-medium">
              {{ obtenerNombreCompleto(item) }}
            </div>
            <div class="text-caption text-grey">
              DPI: {{ item.numero_documento }}
            </div>
          </template>

          <template #item.fecha_ing="{ item }">
            {{ formatearFecha(item.fecha_ing) }}
          </template>

          <template #item.nombre_estado_solicitud="{ item }">
            <v-chip size="small" :color="colorEstado(item.id_estado)" variant="tonal">
              {{ limpiarEstado(item.nombre_estado_solicitud) }}
            </v-chip>
          </template>

          <template #item.validacion="{ item }">
            <v-chip size="small" :color="solicitudCompleta(item).ok ? 'success' : 'error'" variant="tonal">
              {{ solicitudCompleta(item).ok ? 'Completa' : 'Incompleta' }}
            </v-chip>
          </template>

          <template #item.acciones="{ item }">
            <v-btn icon="mdi-eye" size="small" color="info" variant="tonal" class="me-2" @click="abrirDetalle(item)" />


          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Modal de detalle -->
    <v-dialog v-model="dialogDetalle" max-width="950">
      <v-card rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Detalle de solicitud #{{ solicitudSeleccionada?.id_solicitud }}</span>
          <v-btn icon="mdi-close" variant="text" @click="dialogDetalle = false" />
        </v-card-title>

        <v-divider />

        <v-card-text v-if="solicitudSeleccionada">
          <v-alert v-if="!validacionActual.ok" type="warning" variant="tonal" class="mb-4">
            Esta solicitud tiene campos pendientes. No se recomienda aprobar hasta completar la información.
          </v-alert>

          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Datos personales
                </v-card-title>

                <v-card-text>
                  <p><strong>Nombre:</strong> {{ obtenerNombreCompleto(solicitudSeleccionada) }}</p>
                  <p><strong>DPI:</strong> {{ solicitudSeleccionada.numero_documento || 'Pendiente' }}</p>
                  <p><strong>Sexo:</strong> {{ solicitudSeleccionada.sexo || 'Pendiente' }}</p>
                  <p><strong>Fecha nacimiento:</strong> {{ formatearFecha(solicitudSeleccionada.fecha_nacimiento) }}</p>
                  <p><strong>Estado civil:</strong> {{ solicitudSeleccionada.estado_civ_nom || 'Pendiente' }}</p>
                  <p><strong>Ocupación:</strong> {{ solicitudSeleccionada.ocupacion_nom || 'Pendiente' }}</p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Contacto y residencia
                </v-card-title>

                <v-card-text>
                  <p><strong>Correo:</strong> {{ solicitudSeleccionada.correo || 'Pendiente' }}</p>
                  <p><strong>Teléfono:</strong> {{ solicitudSeleccionada.telefono || 'Pendiente' }}</p>
                  <p><strong>Departamento residencia:</strong> {{ solicitudSeleccionada.dep_res_nom || 'Pendiente' }}
                  </p>
                  <p><strong>Municipio residencia:</strong> {{ solicitudSeleccionada.mun_res_nom || 'Pendiente' }}</p>
                  <p><strong>Dirección residencia:</strong> {{ solicitudSeleccionada.direccion_residencia || 'Pendiente'
                  }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Documento
                </v-card-title>

                <v-card-text>
                  <p><strong>Tipo documento:</strong> {{ solicitudSeleccionada.tipo_doc_nom || 'Pendiente' }}</p>
                  <p><strong>No. documento:</strong> {{ solicitudSeleccionada.numero_documento || 'Pendiente' }}</p>
                  <p><strong>Fecha emisión:</strong> {{ formatearFecha(solicitudSeleccionada.fecha_emision) }}</p>
                  <p><strong>Fecha vencimiento:</strong> {{ formatearFecha(solicitudSeleccionada.fecha_vencimiento) }}
                  </p>
                  <p><strong>Entidad emisora:</strong> {{ solicitudSeleccionada.entidad_emi_nom || 'Pendiente' }}</p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Estado de gestión
                </v-card-title>

                <v-card-text>
                  <p><strong>Tipo solicitud:</strong> {{ solicitudSeleccionada.tipo_sol_nom || 'Pendiente' }}</p>
                  <p><strong>Origen:</strong> {{ solicitudSeleccionada.origen_sol_nom || 'Pendiente' }}</p>
                  <p><strong>Estado:</strong> {{ limpiarEstado(solicitudSeleccionada.nombre_estado_solicitud) }}</p>
                  <p><strong>Consultado RENAP:</strong> {{ solicitudSeleccionada.consultado_renap || 'N' }}</p>
                  <p><strong>Observaciones:</strong> {{ solicitudSeleccionada.observaciones || 'Sin observaciones' }}
                  </p>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" v-if="!validacionActual.ok">
              <v-card variant="outlined" rounded="lg" color="error">
                <v-card-title class="text-subtitle-1 font-weight-bold">
                  Campos pendientes
                </v-card-title>

                <v-card-text>
                  <v-chip v-for="campo in validacionActual.faltantes" :key="campo" color="error" variant="tonal"
                    class="ma-1">
                    {{ campo }}
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogDetalle = false">
            Cerrar
          </v-btn>

          <v-btn color="success" variant="flat"
            :disabled="!validacionActual.ok || !puedeGestionarse(solicitudSeleccionada)"
            @click="confirmarAprobacion(solicitudSeleccionada)">
            Aprobar
          </v-btn>

          <v-btn color="error" variant="flat" :disabled="!puedeGestionarse(solicitudSeleccionada)"
            @click="abrirRechazo(solicitudSeleccionada)">
            Rechazar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal rechazo -->
    <v-dialog v-model="dialogRechazo" max-width="600">
      <v-card rounded="xl">
        <v-card-title>Rechazar solicitud</v-card-title>

        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            Debe ingresar el motivo del rechazo.
          </v-alert>

          <v-textarea v-model="motivoRechazo" label="Motivo del rechazo" variant="outlined" rows="4" auto-grow />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="dialogRechazo = false">
            Cancelar
          </v-btn>

          <v-btn color="error" variant="flat" :loading="procesando" @click="rechazarSolicitud">
            Rechazar solicitud
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { httpcat, httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import axios from 'axios'
import Swal from 'sweetalert2'

const API_BASE = 'http://localhost:5041/biosys/api/gestion_afiliados/Solicitud'

const solicitudes = ref([])
const loading = ref(false)
const procesando = ref(false)

const buscar = ref('')
const filtroEstado = ref(null)

const dialogDetalle = ref(false)
const dialogRechazo = ref(false)

const solicitudSeleccionada = ref(null)
const motivoRechazo = ref('')

const headers = [
  { title: 'Solicitud', key: 'id_solicitud', width: '100px' },
  { title: 'Solicitante', key: 'nombre_completo' },
  { title: 'Correo', key: 'correo' },
  { title: 'Teléfono', key: 'telefono' },
  { title: 'Estado', key: 'nombre_estado_solicitud' },
  { title: 'Fecha ingreso', key: 'fecha_ing' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center' }
]

const estadosFiltro = [
  'INICIO',
  'CREADO',
  'APROBADA',
  'RECHAZADA'
]

const solicitudesFiltradas = computed(() => {
  let data = solicitudes.value

  if (buscar.value) {
    const texto = buscar.value.toLowerCase()

    data = data.filter(x => {
      const nombre = obtenerNombreCompleto(x).toLowerCase()
      const dpi = String(x.numero_documento || '').toLowerCase()
      const correo = String(x.correo || '').toLowerCase()

      return nombre.includes(texto) ||
        dpi.includes(texto) ||
        correo.includes(texto)
    })
  }

  if (filtroEstado.value) {
    data = data.filter(x =>
      limpiarEstado(x.nombre_estado_solicitud) === filtroEstado.value
    )
  }

  return data
})

const validacionActual = computed(() => {
  if (!solicitudSeleccionada.value) {
    return {
      ok: false,
      faltantes: []
    }
  }

  return solicitudCompleta(solicitudSeleccionada.value)
})

onMounted(() => {
  consultarSolicitudes()
})

async function consultarSolicitudes() {
  try {
    loading.value = true

    const response = await httpsol.get(endpoints.solicitudes.consultar)

    if (response.data.resultado === 200) {
      solicitudes.value = response.data.data || []
    } else {
      Swal.fire('Aviso', response.data.mensaje || 'No se pudieron consultar las solicitudes.', 'warning')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error')
  } finally {
    loading.value = false
  }
}

function abrirDetalle(item) {
  solicitudSeleccionada.value = item
  dialogDetalle.value = true
}

function abrirRechazo(item) {
  solicitudSeleccionada.value = item
  motivoRechazo.value = ''
  dialogRechazo.value = true
}

function obtenerNombreCompleto(item) {
  if (!item) return ''

  return [
    item.nombre1,
    item.nombre2,
    item.nombre3,
    item.apellido1,
    item.apellido2,
    item.apellido3
  ]
    .filter(Boolean)
    .join(' ')
}

function limpiarEstado(estado) {
  return String(estado || '')
    .replaceAll('{', '')
    .replaceAll('}', '')
    .trim()
}

function colorEstado(idEstado) {
  switch (idEstado) {
    case 1:
      return 'blue'
    case 2:
      return 'indigo'
    case 6:
      return 'success'
    case 7:
      return 'error'
    default:
      return 'grey'
  }
}

function puedeGestionarse(item) {
  if (!item) return false

  // Ajusta estos estados según tu flujo.
  // En tu respuesta se observa:
  // 1 = INICIO
  // 2 = CREADO
  // 6 = APROBADA
  // 7 = RECHAZADA
  return item.id_estado === 1 || item.id_estado === 2
}

function formatearFecha(fecha) {
  if (!fecha) return 'Pendiente'

  const date = new Date(fecha)

  if (isNaN(date.getTime())) {
    return fecha
  }

  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function valorVacio(valor) {
  return valor === null ||
    valor === undefined ||
    String(valor).trim() === ''
}

function solicitudCompleta(item) {
  const campos = [
    { key: 'id_ejercicio_fiscal', label: 'Ejercicio fiscal' },
    { key: 'id_tipo_solicitud', label: 'Tipo de solicitud' },
    { key: 'id_origen_solicitud', label: 'Origen de solicitud' },
    { key: 'fecha', label: 'Fecha de solicitud' },

    { key: 'id_tipo_documento', label: 'Tipo de documento' },
    { key: 'numero_documento', label: 'Número de documento' },
    { key: 'fecha_emision', label: 'Fecha de emisión' },
    { key: 'fecha_vencimiento', label: 'Fecha de vencimiento' },
    { key: 'id_entidad_emisora', label: 'Entidad emisora' },

    { key: 'nombre1', label: 'Primer nombre' },
    { key: 'apellido1', label: 'Primer apellido' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'id_estado_civil', label: 'Estado civil' },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento' },

    { key: 'correo', label: 'Correo electrónico' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'id_ocupacion', label: 'Ocupación' },

    { key: 'id_departamento_nacimiento', label: 'Departamento de nacimiento' },
    { key: 'id_municipio_nacimiento', label: 'Municipio de nacimiento' },

    { key: 'id_departamento_residencia', label: 'Departamento de residencia' },
    { key: 'id_municipio_residencia', label: 'Municipio de residencia' },
    { key: 'direccion_residencia', label: 'Dirección de residencia' },

    { key: 'id_tipo_entrega', label: 'Tipo de entrega' },
    { key: 'id_departamento_entrega', label: 'Departamento de entrega' },
    { key: 'id_municipio_entrega', label: 'Municipio de entrega' },
    { key: 'id_centro_entrega', label: 'Centro de entrega' },

    { key: 'id_departamento_votacion', label: 'Departamento de votación' },
    { key: 'id_municipio_votacion', label: 'Municipio de votación' },
    { key: 'id_centro_votacion', label: 'Centro de votación' }
  ]

  const faltantes = campos
    .filter(campo => valorVacio(item[campo.key]))
    .map(campo => campo.label)

  // Validación especial: si está empadronado, debe tener empadronamiento.
  if (item.empadronado === 1 && valorVacio(item.empadronamiento)) {
    faltantes.push('Número de empadronamiento')
  }

  // Validación de correo básica.
  if (!valorVacio(item.correo)) {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.correo)

    if (!correoValido) {
      faltantes.push('Correo electrónico válido')
    }
  }

  // Validación de teléfono básica.
  if (!valorVacio(item.telefono)) {
    const telefono = String(item.telefono)

    if (telefono.length < 8 || telefono === '0') {
      faltantes.push('Teléfono válido')
    }
  }

  return {
    ok: faltantes.length === 0,
    faltantes
  }
}

async function confirmarAprobacion(item) {
  if (!item) return

  const validacion = solicitudCompleta(item)

  if (!validacion.ok) {
    Swal.fire({
      icon: 'warning',
      title: 'Solicitud incompleta',
      html: `
        <p>No se puede aprobar porque faltan campos:</p>
        <ul style="text-align:left">
          ${validacion.faltantes.map(x => `<li>${x}</li>`).join('')}
        </ul>
      `
    })

    return
  }

  const result = await Swal.fire({
    title: '¿Aprobar solicitud?',
    text: `Se aprobará la solicitud #${item.id_solicitud}.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, aprobar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2e7d32'
  })

  if (result.isConfirmed) {
    aprobarSolicitud(item)
  }
}

async function aprobarSolicitud(item) {
  try {
    procesando.value = true

    const payload = {
      id: item.id_solicitud,
    }

    // Ajusta este endpoint al que tengas en tu API.

    console.log('Payload para aprobar solicitud:', payload)
    const response = await httpsol.post(endpoints.solicitudes.aprobar, payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.resultado === 200) {
      Swal.fire('Aprobada', response.data.mensaje || 'La solicitud fue aprobada correctamente.', 'success')
      dialogDetalle.value = false
      await consultarSolicitudes()
    } else {
      Swal.fire('Aviso', response.data.mensaje || 'No se pudo aprobar la solicitud.', 'warning')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Ocurrió un error al aprobar la solicitud.', 'error')
  } finally {
    procesando.value = false
  }
}

async function rechazarSolicitud() {
  if (!solicitudSeleccionada.value) return

  if (valorVacio(motivoRechazo.value)) {
    Swal.fire('Campo requerido', 'Debe ingresar el motivo del rechazo.', 'warning')
    return
  }

  try {
    procesando.value = true

    const payload = {
      id: solicitudSeleccionada.value.id_solicitud,
      observaciones: motivoRechazo.value,

    }

    // Ajusta este endpoint al que tengas en tu API.
    const response = await httpsol.post(endpoints.solicitudes.rechazar, payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    if (response.data.resultado === 200) {
      Swal.fire('Rechazada', response.data.mensaje || 'La solicitud fue rechazada correctamente.', 'success')
      dialogRechazo.value = false
      dialogDetalle.value = false
      await consultarSolicitudes()
    } else {
      Swal.fire('Aviso', response.data.mensaje || 'No se pudo rechazar la solicitud.', 'warning')
    }
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Ocurrió un error al rechazar la solicitud.', 'error')
  } finally {
    procesando.value = false
  }
}
</script>