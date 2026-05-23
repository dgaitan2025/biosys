<template>
    <v-container fluid class="pa-6">
        <v-card elevation="4" rounded="xl" class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap ga-4">
                <div>
                    <h2 class="text-h5 font-weight-bold">
                        {{ reporteActual?.titulo || 'Reporte' }}
                    </h2>

                    <p class="text-grey-darken-1 mt-1">
                        Descarga el reporte en formato PDF o Excel.
                    </p>
                </div>

                <v-btn color="grey-darken-1" variant="tonal" prepend-icon="mdi-arrow-left" @click="router.back()">
                    Regresar
                </v-btn>
            </div>

            <v-divider class="my-6" />

            <v-row v-if="requiereEvento" class="mb-4">
                <v-col cols="12" md="6">
                    <v-select v-model="idEventoSeleccionado" :items="eventosSelect" item-title="titulo" item-value="id"
                        label="Seleccione un evento" variant="outlined" density="comfortable" :loading="loadingEventos"
                        :disabled="loadingEventos" prepend-inner-icon="mdi-calendar-check" clearable />
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" md="6">
                    <v-card rounded="xl" elevation="2" class="pa-5 text-center">
                        <v-icon size="64" color="red-darken-2">
                            mdi-file-pdf-box
                        </v-icon>

                        <h3 class="mt-3 mb-4">
                            Descargar PDF
                        </h3>

                        <v-btn color="red-darken-2" size="large" block :loading="loadingPdf" prepend-icon="mdi-download"
                            @click="descargarReporte('pdf')">
                            Descargar PDF
                        </v-btn>
                    </v-card>
                </v-col>

                <v-col cols="12" md="6">
                    <v-card rounded="xl" elevation="2" class="pa-5 text-center">
                        <v-icon size="64" color="green-darken-2">
                            mdi-file-excel-box
                        </v-icon>

                        <h3 class="mt-3 mb-4">
                            Descargar Excel
                        </h3>

                        <v-btn color="green-darken-2" size="large" block :loading="loadingExcel"
                            prepend-icon="mdi-download" @click="descargarReporte('excel')">
                            Descargar Excel
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'

const route = useRoute()
const router = useRouter()
const { success, error: alertError } = useAlert()

const loadingPdf = ref(false)
const loadingExcel = ref(false)
const loadingEventos = ref(false)

const eventos = ref([])
const idEventoSeleccionado = ref(null)

const eventosSelect = computed(() => {
    return eventos.value.map(evento => ({
        id: evento.id,
        titulo: `${evento.nombre || 'Sin nombre'} - ${evento.codigo || 'Sin código'} - ${evento.fecha || 'Sin fecha'}`
    }))
})

const reportes = {
    'afiliados-sexo': {
        titulo: 'Afiliados por Género',
        archivo: 'afiliados-por-genero'
    },
    'evento-asistencia': {
        titulo: 'Asistencia a Eventos',
        archivo: 'asistencia-a-eventos'
    },
    'afiliados-departamento-municipio': {
        titulo: 'Afiliados por Municipio',
        archivo: 'afiliados-por-municipio'
    },
    'afiliados-ejercicio-fiscal': {
        titulo: 'Afiliados por Año de Afiliación',
        archivo: 'afiliados-por-anio'
    },
    'solicitudes-renap': {
        titulo: 'Solicitudes de Renap',
        archivo: 'solicitudes-renap'
    },
    'afiliados-activos': {
        titulo: 'Afiliados Activos',
        archivo: 'afiliados-activos'
    },
    'evento-asistencia-detalle': {
        titulo: 'Detalle de Asistencia a Eventos',
        archivo: 'detalle-asistencia-a-eventos',
        requiereEvento: true
    }
}

const tipoRuta = computed(() =>
    String(route.params.tipo || '').trim().replaceAll('_', '-')
)

const reporteActual = computed(() => {
    return reportes[tipoRuta.value]
})

const requiereEvento = computed(() => {
    return reporteActual.value?.requiereEvento === true
})

const cargarEventos = async () => {
    if (!requiereEvento.value) return

    loadingEventos.value = true

    try {
        const response = await httpsol.get(endpoints.asistenciaBiometrica.eventos)

        console.log('Eventos respuesta:', response.data)

        eventos.value = response.data?.data || []

        if (eventos.value.length > 0) {
            idEventoSeleccionado.value = eventos.value[0].id
        }
    } catch (error) {
        console.error('Error al cargar eventos:', error)
        eventos.value = []
    } finally {
        loadingEventos.value = false
    }
}

const descargarReporte = async (formato) => {
    if (!reporteActual.value) {
        console.error('Reporte no encontrado:', tipoRuta.value)
        return
    }

    if (requiereEvento.value && !idEventoSeleccionado.value) {
        console.error('Debe seleccionar un evento')
        return
    }

    const esPdf = formato === 'pdf'

    if (esPdf) {
        loadingPdf.value = true
    } else {
        loadingExcel.value = true
    }

    try {
        let response

        if (requiereEvento.value) {
            const url = `${endpoints.reportes}/${tipoRuta.value}/${formato}`

            const body = {
                id_Evento: idEventoSeleccionado.value,
                base64: false
            }

            response = await httpsol.post(url, body, {
                responseType: 'blob'
            })
        } else {
            const url = `${endpoints.reportes}/${tipoRuta.value}/${formato}?base64=false`

            response = await httpsol.get(url, {
                responseType: 'blob'
            })
        }

        const extension = esPdf ? 'pdf' : 'xlsx'

        const mimeType = esPdf
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

        const blob = new Blob([response.data], { type: mimeType })
        const objectUrl = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = objectUrl
        link.download = `${reporteActual.value.archivo}.${extension}`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        window.URL.revokeObjectURL(objectUrl)
    } catch (error) {
        alertError('Error al descargar el reporte o no tiene datos para mostrar.')
        console.error('Error al descargar reporte:', error)
    } finally {
        loadingPdf.value = false
        loadingExcel.value = false
    }
}

onMounted(() => {
    cargarEventos()
})

watch(
    () => tipoRuta.value,
    () => {
        idEventoSeleccionado.value = null
        eventos.value = []
        cargarEventos()
    }
)
</script>