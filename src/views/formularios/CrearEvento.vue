<template>
    <v-card rounded="xl" elevation="3">
        <v-card-title class="d-flex align-center justify-space-between">
            <div>
                <div class="text-h6 font-weight-bold">
                    Crear evento
                </div>
                <div class="text-caption text-medium-emphasis">
                    Registro de evento para jornadas de afiliación.
                </div>
            </div>

            <v-chip
                :color="form.activo === 1 ? 'success' : 'error'"
                variant="tonal"
                size="small"
            >
                {{ form.activo === 1 ? 'Activo' : 'Inactivo' }}
            </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
            <v-alert
                v-if="errorCatalogos"
                type="error"
                variant="tonal"
                class="mb-4"
                rounded="lg"
            >
                {{ errorCatalogos }}
            </v-alert>

            <v-form ref="formRef">
                <v-container fluid>
                    <v-row>
                        <v-col cols="12" md="3">
                            <v-text-field
                                v-model="form.codigo"
                                label="Código"
                                variant="outlined"
                                placeholder="EVT-001"
                                :rules="[campoObligatorio]"
                                maxlength="25"
                            />
                        </v-col>

                        <v-col cols="12" md="5">
                            <v-text-field
                                v-model="form.nombre"
                                label="Nombre del evento"
                                variant="outlined"
                                placeholder="Jornada de Afiliación Zona 1"
                                :rules="[campoObligatorio]"
                                maxlength="150"
                            />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-menu
                                v-model="menuFecha"
                                :close-on-content-click="false"
                                location="bottom"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
                                        v-model="form.fecha"
                                        label="Fecha"
                                        variant="outlined"
                                        placeholder="dd/mm/yyyy"
                                        prepend-inner-icon="mdi-calendar"
                                        v-bind="props"
                                        :rules="[campoObligatorio, validarFechaEvento]"
                                        readonly
                                    />
                                </template>

                                <v-date-picker
                                    v-model="fechaSeleccionada"
                                    @update:model-value="seleccionarFecha"
                                />
                            </v-menu>
                        </v-col>

                        <!-- DEPARTAMENTO -->
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.id_departamento"
                                :items="catalogos.departamentos"
                                item-title="nombre"
                                item-value="id"
                                label="Departamento"
                                variant="outlined"
                                :rules="[campoObligatorio]"
                                :loading="cargandoCatalogos"
                                :disabled="cargandoCatalogos"
                                @update:model-value="cambiarDepartamento"
                            />
                        </v-col>

                        <!-- MUNICIPIO FILTRADO -->
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.id_municipio"
                                :items="municipiosFiltrados"
                                item-title="nombre"
                                item-value="id"
                                label="Municipio"
                                variant="outlined"
                                :rules="[campoObligatorio]"
                                :loading="cargandoCatalogos"
                                :disabled="cargandoCatalogos || !form.id_departamento"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="form.id_estado"
                                :items="catalogos.estadosEvento"
                                item-title="nombre"
                                item-value="id"
                                label="Estado"
                                variant="outlined"
                                :rules="[campoObligatorio]"
                                :loading="cargandoCatalogos"
                                :disabled="cargandoCatalogos"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-switch
                                v-model="form.activo"
                                :true-value="1"
                                :false-value="0"
                                label="Activo"
                                color="primary"
                                inset
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="form.descripcion"
                                label="Descripción"
                                variant="outlined"
                                rows="3"
                                placeholder="Evento de afiliación y validación biométrica."
                                :rules="[campoObligatorio]"
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="form.observaciones"
                                label="Observaciones"
                                variant="outlined"
                                rows="2"
                                placeholder="Primer evento piloto."
                            />
                        </v-col>
                    </v-row>
                </v-container>
            </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
            <v-btn
                variant="text"
                color="error"
                prepend-icon="mdi-close"
                @click="limpiarFormulario"
                :disabled="guardando"
            >
                Cancelar
            </v-btn>

            <v-btn
                color="primary"
                prepend-icon="mdi-content-save"
                :loading="guardando"
                :disabled="cargandoCatalogos"
                @click="guardarEvento"
            >
                Guardar evento
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'

const emit = defineEmits(['eventoCreado', 'cancelar'])

const { success, error } = useAlert()

const formRef = ref(null)
const guardando = ref(false)

const cargandoCatalogos = ref(false)
const errorCatalogos = ref('')

const menuFecha = ref(false)
const fechaSeleccionada = ref(null)

const catalogos = ref({
    departamentos: [],
    municipios: [],
    estadosEvento: []
})

const getInitialForm = () => ({
    id: 0,
    codigo: '',
    nombre: '',
    fecha: '',
    id_departamento: null,
    id_municipio: null,
    descripcion: '',
    observaciones: '',
    id_estado: 1,
    activo: 1
})

const form = ref(getInitialForm())

const campoObligatorio = (valor) => {
    return !!valor || 'Campo obligatorio'
}

const municipiosFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const cambiarDepartamento = () => {
    form.value.id_municipio = null
}

const endpointCatalogosEvento = computed(() => {
    return endpoints.solicitudes.catalogos
        
})

const endpointCrearEvento = computed(() => {
    return endpoints?.eventos?.crear
        || '/biosys/api/gestion_eventos/Evento/crear'
})

const normalizarCatalogos = (data) => {
    return {
        departamentos:
            data?.departamentos
            || data?.Departamento
            || data?.DEPARTAMENTOS
            || [],

        municipios:
            data?.municipios
            || data?.Municipio
            || data?.MUNICIPIOS
            || [],

        estadosEvento:
            data?.estadosEvento
            || data?.estados_evento
            || data?.estados
            || data?.Estados
            || [
                { id: 1, nombre: 'Activo' },
                { id: 2, nombre: 'Finalizado' },
                { id: 3, nombre: 'Cancelado' }
            ]
    }
}

const cargarCatalogos = async () => {
    try {
        cargandoCatalogos.value = true
        errorCatalogos.value = ''

        const response = await httpsol.get(endpoints.catalogos.catalogosSolicitud)
        console.log('Respuesta catálogos:', response)

        const data = response.data?.data || response.data || {}

        catalogos.value = normalizarCatalogos(data)

        if (!catalogos.value.departamentos.length) {
            errorCatalogos.value = 'No se encontraron departamentos en el catálogo.'
        }

        if (!catalogos.value.municipios.length) {
            errorCatalogos.value = 'No se encontraron municipios en el catálogo.'
        }
    } catch (err) {
        console.error('Error al cargar catálogos:', err)
        errorCatalogos.value = 'No se pudieron cargar los catálogos del evento.'
    } finally {
        cargandoCatalogos.value = false
    }
}

const formatearFechaInput = (fecha) => {
    if (!fecha) return ''

    const date = new Date(fecha)

    if (Number.isNaN(date.getTime())) {
        return ''
    }

    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()

    return `${dia}/${mes}/${anio}`
}

const validarFechaEvento = (valor) => {
    if (!valor) return 'Campo obligatorio'

    const regex = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/

    if (!regex.test(valor)) {
        return 'La fecha debe tener formato dd/mm/yyyy'
    }

    return true
}

const seleccionarFecha = (fecha) => {
    form.value.fecha = formatearFechaInput(fecha)
    menuFecha.value = false
}

const limpiarFormulario = () => {
    form.value = getInitialForm()
    fechaSeleccionada.value = null
    formRef.value?.resetValidation()
    emit('cancelar')
}

const obtenerPayload = () => {
    return {
        id: Number(form.value.id || 0),
        codigo: String(form.value.codigo || '').trim(),
        nombre: String(form.value.nombre || '').trim(),
        fecha: form.value.fecha,
        id_municipio: Number(form.value.id_municipio),
        descripcion: String(form.value.descripcion || '').trim(),
        observaciones: form.value.observaciones
            ? String(form.value.observaciones).trim()
            : null,
        id_estado: Number(form.value.id_estado),
        activo: Number(form.value.activo)
    }
}

const guardarEvento = async () => {
    try {
        const validacion = await formRef.value?.validate()

        if (validacion && !validacion.valid) {
            error('Revise los campos obligatorios antes de guardar')
            return
        }

        guardando.value = true
        alertLoading('Guardando evento', 'Registrando información del evento...')

        const payload = obtenerPayload()

        const response = await httpsol.post(
            endpoints.solicitudes.crearEvento,
            payload
        )

        closeAlert()

        if (
            response.data?.resultado === 200 ||
            response.data?.success === true ||
            response.status === 200
        ) {
            success(response.data?.mensaje || 'Evento creado correctamente')
            emit('eventoCreado', response.data?.data || payload)
            limpiarFormulario()
            return
        }

        error(response.data?.mensaje || 'No se pudo crear el evento')
    } catch (err) {
        closeAlert()
        console.error('Error al crear evento:', err)
        error('Ocurrió un error al crear el evento')
    } finally {
        guardando.value = false
    }
}

onMounted(() => {
    cargarCatalogos()
})
</script>

<style scoped>
.v-card {
    width: 100%;
}
</style>
