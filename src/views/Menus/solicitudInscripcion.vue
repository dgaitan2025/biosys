<template>
    <v-container fluid class="pa-4">
        <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">
                Nueva Solicitud
            </span>

            <v-col cols="6" md="2" class="text-md-right">
                <v-btn color="primary" prepend-icon="mdi-home" @click="volverInicio">
                    Inicio
                </v-btn>
            </v-col>
        </v-card-title>

        <v-divider />

        <v-container
            v-if="cargandoCatalogos"
            class="d-flex flex-column align-center justify-center py-12"
        >
            <v-progress-circular
                indeterminate
                color="primary"
                size="64"
                width="6"
            />

            <div class="text-subtitle-1 mt-4 font-weight-medium">
                Cargando catálogos...
            </div>
        </v-container>

        <v-alert
            v-else-if="errorCatalogos"
            type="error"
            variant="tonal"
            class="ma-4"
        >
            {{ errorCatalogos }}

            <template #append>
                <v-btn color="error" variant="text" @click="obtenerCatalogos">
                    Reintentar
                </v-btn>
            </template>
        </v-alert>

        <v-container v-else fluid>
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Seleccione el tipo de solicitud
                    </div>
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="tipoSolicitudSeleccionado"
                        :items="catalogos.tiposSolicitud"
                        item-title="nombre"
                        item-value="id"
                        label="Tipo de solicitud"
                        variant="outlined"
                        clearable
                    />
                </v-col>
            </v-row>

            <v-row v-if="!tipoSolicitudSeleccionado">
                <v-col cols="12">
                    <v-alert type="info" variant="tonal">
                        Seleccione un tipo de solicitud para continuar.
                    </v-alert>
                </v-col>
            </v-row>

            <AfiliacionForm
                v-if="esAfiliacion"
                :catalogos="catalogos"
                :id-tipo-solicitud="tipoSolicitudSeleccionado"
            />

            <ActualizacionForm
                v-if="esActualizacion"
                :catalogos="catalogos"
                :id-tipo-solicitud="tipoSolicitudSeleccionado"
            />
        </v-container>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { httpcat } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'

import AfiliacionForm from '../formularios/AfiliacionForm.vue'
import ActualizacionForm from '../formularios/ActualizacionForm.vue'

const router = useRouter()

const cargandoCatalogos = ref(true)
const errorCatalogos = ref('')
const tipoSolicitudSeleccionado = ref(null)

const catalogos = ref({
    ejerciciosFiscales: [],
    tiposSolicitud: [],
    origenesSolicitud: [],
    tiposDocumento: [],
    entidadesEmisoras: [],
    estadosCiviles: [],
    ocupaciones: [],
    departamentos: [],
    municipios: [],
    localizaciones: [],
    tiposEntrega: [],
    centrosEntrega: [],
    centrosVotacion: []
})

const obtenerCatalogos = async () => {
    cargandoCatalogos.value = true
    errorCatalogos.value = ''

    try {
        const response = await httpcat.get(endpoints.catalogos.catalogosSolicitud)

        catalogos.value = response.data?.data || {
            ejerciciosFiscales: [],
            tiposSolicitud: [],
            origenesSolicitud: [],
            tiposDocumento: [],
            entidadesEmisoras: [],
            estadosCiviles: [],
            ocupaciones: [],
            departamentos: [],
            municipios: [],
            localizaciones: [],
            tiposEntrega: [],
            centrosEntrega: [],
            centrosVotacion: []
        }

        console.log('Catálogos obtenidos:', response.data)

        tipoSolicitudSeleccionado.value = null
    } catch (err) {
        console.error('Error al obtener catálogos:', err)
        errorCatalogos.value = 'No se pudieron cargar los catálogos.'
    } finally {
        cargandoCatalogos.value = false
    }
}

const tipoAfiliacion = computed(() => {
    return catalogos.value.tiposSolicitud.find(x =>
        String(x.nombre).toLowerCase().includes('afiliacion') ||
        String(x.nombre).toLowerCase().includes('afiliación')
    )
})

const tipoActualizacion = computed(() => {
    return catalogos.value.tiposSolicitud.find(x =>
        String(x.nombre).toLowerCase().includes('actualizacion') ||
        String(x.nombre).toLowerCase().includes('actualización')
    )
})

const esAfiliacion = computed(() => {
    return tipoSolicitudSeleccionado.value === tipoAfiliacion.value?.id
})

const esActualizacion = computed(() => {
    return tipoSolicitudSeleccionado.value === tipoActualizacion.value?.id
})

const volverInicio = () => {
    router.push('/usuarios')
}

onMounted(() => {
    obtenerCatalogos()
})
</script>