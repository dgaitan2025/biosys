<template>
    <v-form ref="formRef">
        <v-container fluid>
            <!-- DATOS GENERALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos generales
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_ejercicio_fiscal" :items="catalogos.ejerciciosFiscales"
                        item-title="codigo" item-value="id" label="Ejercicio fiscal" variant="outlined" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_origen_solicitud" :items="catalogos.origenesSolicitud"
                        item-title="nombre" item-value="id" label="Origen solicitud" variant="outlined" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFecha" :close-on-content-click="false" location="bottom" :disabled=true>
                        <template #activator="{ props }">
                            <v-text-field v-model="form.fecha" label="Fecha" variant="outlined" placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar" v-bind="props" @click:prepend-inner="menuFecha = true"
                                :rules="[campoObligatorio]" :readonly="true" />
                        </template>

                        <v-date-picker v-model="fechaSeleccionada" @update:model-value="seleccionarFecha" />
                    </v-menu>
                </v-col>

                <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                    <v-text-field v-model="form.correlativo" label="Correlativo" type="number" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                    <v-text-field v-model="form.numero" label="Número" type="number" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>
            </v-row>

            <!-- DOCUMENTO -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Documento
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_tipo_documento" :items="catalogos.tiposDocumento" item-title="nombre"
                        item-value="id" label="Tipo documento" variant="outlined" />
                </v-col>

                <v-col cols="12" md="5">
                    <div class="d-flex ga-2 align-start">
                        <v-text-field v-model="form.numero_documento" label="Número documento / DPI" type="text"
                            variant="outlined" placeholder="0000 00000 0000" :rules="[validarNumeroDocumento]"
                            @blur="validarDocumentoBlur" :success="documentoValido"
                            :success-messages="documentoValido ? mensajeDocumento : ''"
                            :error="mensajeDocumento !== '' && !documentoValido"
                            :error-messages="mensajeDocumento !== '' && !documentoValido ? mensajeDocumento : ''"
                            class="flex-grow-1" :readonly="bloquearDatosRenap" />

                        <v-btn color="primary" prepend-icon="mdi-account-search" height="56" :loading="consultandoRenap"
                            :disabled="validarNumeroDocumento(form.numero_documento) !== true || consultandoRenap"
                            @click="consultarRenap">
                            RENAP
                        </v-btn>
                    </div>
                </v-col>
                <!-- DOCUMENTO FECHA DE EMISION
                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaEmision" :close-on-content-click="false" location="bottom">
                        <template #activator="{ props }">
                            <v-text-field v-model="form.fecha_emision" label="Fecha emisión" variant="outlined"
                                placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar" v-bind="props"
                                :rules="[validarFechaEmision]" @click:prepend-inner="menuFechaEmision = true"
                                @update:model-value="revalidarFechaVencimiento" />
                        </template>

                        <v-date-picker v-model="fechaEmisionSeleccionada"
                            @update:model-value="seleccionarFechaEmision" />
                    </v-menu>
                </v-col>

                -->

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaVencimiento" :close-on-content-click="false" location="bottom"
                        :disabled="bloquearDatosRenap">
                        <template #activator="{ props }">
                            <v-text-field ref="fechaVencimientoRef" v-model="form.fecha_vencimiento"
                                label="Fecha vencimiento" variant="outlined" placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar" v-bind="props" :rules="[validarFechaVencimiento]"
                                @click:prepend-inner="menuFechaVencimiento = true" :readonly="bloquearDatosRenap" />
                        </template>

                        <v-date-picker v-model="fechaVencimientoSeleccionada"
                            @update:model-value="seleccionarFechaVencimiento" />
                    </v-menu>
                </v-col>

                <v-col cols="12" md="3">
                    <v-text-field v-model="form.fecha_defuncion" label="Fecha defunción" variant="outlined"
                        placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar" readonly
                        :error="!!form.fecha_defuncion"
                        :error-messages="form.fecha_defuncion ? 'Persona fallecida, no puede ser afiliada' : ''"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.correlativo_documento" label="Correlativo documento" type="number"
                        variant="outlined" :rules="[campoObligatorio]" :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_entidad_emisora" :items="catalogos.entidadesEmisoras" item-title="nombre"
                        item-value="id" label="Entidad emisora" variant="outlined" />
                </v-col>
            </v-row>

            <!-- DATOS PERSONALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos personales
                    </div>
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.nombre1" label="Primer nombre" variant="outlined"
                        :rules="[campoObligatorio]" :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.nombre2" label="Segundo nombre" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.nombre3" label="Tercer nombre" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.apellido1" label="Primer apellido" variant="outlined"
                        :rules="[campoObligatorio]" :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.apellido2" label="Segundo apellido" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field v-model="form.apellido3" label="Tercer apellido" variant="outlined"
                        :readonly="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.sexo" :items="['M', 'F']" label="Sexo" variant="outlined"
                        :rules="[campoObligatorio]" :disabled="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_estado_civil" :items="catalogos.estadosCiviles" item-title="nombre"
                        item-value="id" label="Estado civil" variant="outlined" :disabled="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaNacimiento" :close-on-content-click="false" location="bottom"
                        :disabled="bloquearDatosRenap">
                        <template #activator="{ props }">
                            <v-text-field v-model="form.fecha_nacimiento" label="Fecha nacimiento" variant="outlined"
                                placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar" v-bind="props"
                                :rules="[validarFechaNacimiento]" @click:prepend-inner="menuFechaNacimiento = true"
                                :readonly="bloquearDatosRenap" />
                        </template>

                        <v-date-picker v-model="fechaNacimientoSeleccionada"
                            @update:model-value="seleccionarFechaNacimiento" />
                    </v-menu>
                </v-col>

                <v-col cols="12" md="3">
                    <v-text-field v-model="form.correo" label="Correo" type="email" variant="outlined"
                        :rules="[validarCorreo, campoObligatorio]" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-text-field v-model="form.telefono" label="Teléfono" type="text" variant="outlined"
                        placeholder="0000-0000" maxlength="9" :rules="[validarTelefono, campoObligatorio]"
                        @input="form.telefono = formatearTelefono(form.telefono)" />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_ocupacion" :items="catalogos.ocupaciones" item-title="nombre"
                        item-value="id" label="Ocupación" variant="outlined" :rules="[campoObligatorio]" />
                </v-col>
            </v-row>

            <!-- NACIMIENTO -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Lugar de nacimiento
                    </div>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select v-model="form.id_departamento_nacimiento" :items="catalogos.departamentos"
                        item-title="nombre" item-value="id" label="Departamento nacimiento" variant="outlined"
                        @update:model-value="cambiarDepartamentoNacimiento" :disabled="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="6">
                    <v-select v-model="form.id_municipio_nacimiento" :items="municipiosNacimientoFiltrados"
                        item-title="nombre" item-value="id" label="Municipio nacimiento" variant="outlined"
                        :rules="[campoObligatorio]" :disabled="bloquearDatosRenap" />
                </v-col>
            </v-row>

            <!-- VECINDAD -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Vecindad
                    </div>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select v-model="form.id_departamento_vecindad" :items="catalogos.departamentos"
                        item-title="nombre" item-value="id" label="Departamento vecindad" variant="outlined"
                        @update:model-value="cambiarDepartamentoVecindad" :disabled="bloquearDatosRenap" />
                </v-col>

                <v-col cols="12" md="6">
                    <v-select v-model="form.id_municipio_vecindad" :items="municipiosVecindadFiltrados"
                        item-title="nombre" item-value="id" label="Municipio vecindad" variant="outlined"
                        :rules="[campoObligatorio]" :disabled="bloquearDatosRenap" />
                </v-col>
            </v-row>

            <!-- RESIDENCIA -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Residencia
                    </div>
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_departamento_residencia" :items="catalogos.departamentos"
                        item-title="nombre" item-value="id" label="Departamento residencia" variant="outlined"
                        @update:model-value="cambiarDepartamentoResidencia" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_municipio_residencia" :items="municipiosResidenciaFiltrados"
                        item-title="nombre" item-value="id" label="Municipio residencia" variant="outlined" />
                </v-col>

                <v-col cols="12">
                    <v-textarea v-model="form.direccion_residencia" label="Dirección residencia" variant="outlined"
                        rows="2" :rules="[campoObligatorio]" />
                </v-col>
            </v-row>

            <!-- ENTREGA -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Entrega
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.id_tipo_entrega" :items="catalogos.tiposEntrega" item-title="nombre"
                        item-value="id" label="Tipo entrega" variant="outlined" />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12" md="3">
                    <v-select v-model="form.id_departamento_entrega" :items="catalogos.departamentos"
                        item-title="nombre" item-value="id" label="Departamento entrega" variant="outlined"
                        @update:model-value="cambiarDepartamentoEntrega" />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12" md="3">
                    <v-select v-model="form.id_municipio_entrega" :items="municipiosEntregaFiltrados"
                        item-title="nombre" item-value="id" label="Municipio entrega" variant="outlined"
                        :rules="[campoObligatorio]" />
                </v-col>

                <v-col v-if="esEntregaCentro" cols="12" md="3">
                    <v-select v-model="form.id_centro_entrega" :items="catalogos.centrosEntrega" item-title="nombre"
                        item-value="id" label="Centro entrega" variant="outlined" />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12">
                    <v-textarea v-model="form.direccion_entrega" label="Dirección entrega" variant="outlined" rows="2"
                        :rules="[campoObligatorio]" />
                </v-col>
            </v-row>

            <!-- DATOS ELECTORALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos electorales
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-switch v-model="form.empadronado" :true-value="1" :false-value="0" label="Empadronado"
                        color="primary" inset />
                </v-col>

                <v-col cols="12" md="3" v-if="form.empadronado === 1">
                    <v-text-field v-model="form.empadronamiento" label="Número de empadronamiento" variant="outlined"
                        clearable />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select v-model="form.consultado_renap" :items="['S', 'N']" label="Consultado RENAP"
                        variant="outlined" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_departamento_votacion" :items="catalogos.departamentos"
                        item-title="nombre" item-value="id" label="Departamento votación" variant="outlined"
                        @update:model-value="cambiarDepartamentoCentroVotacion" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_municipio_votacion" :items="municipiosCentroVotacionFiltrados"
                        item-title="nombre" item-value="id" label="Municipio votación" variant="outlined"
                        :rules="[campoObligatorio]" />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select v-model="form.id_centro_votacion" :items="catalogos.centrosVotacion" item-title="nombre"
                        item-value="id" label="Centro votación" variant="outlined" />
                </v-col>
            </v-row>

            <!-- OTROS -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Otros datos
                    </div>
                </v-col>

                <v-col cols="12">
                    <v-textarea v-model="form.observaciones" label="Observaciones" variant="outlined" rows="3" />
                </v-col>
            </v-row>

            <!-- DATOS BIOMÉTRICOS -->
            <v-row align="stretch">
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos biométricos
                    </div>
                </v-col>

                <!-- HUELLA -->
                <v-col cols="12" md="6" class="d-flex">
                    <v-card class="pa-4 biometria-card d-flex flex-column" rounded="xl" elevation="2">
                        <div class="text-subtitle-2 font-weight-bold mb-2">
                            Huella digital
                        </div>

                        <div class="biometria-body d-flex flex-column align-center justify-center">
                            <v-icon size="90" color="primary">
                                mdi-fingerprint
                            </v-icon>

                            <v-btn color="primary" prepend-icon="mdi-fingerprint" class="mt-4"
                                @click="dialogHuella = true">
                                Capturar huella
                            </v-btn>

                            <div class="mt-3 text-caption">
                                {{
                                    form.huella
                                        ? 'Huella capturada correctamente'
                                        : 'Sin huella capturada'
                                }}
                            </div>
                        </div>
                    </v-card>
                </v-col>

                <!-- FOTOGRAFÍA -->
                <v-col cols="12" md="6" class="d-flex">
                    <v-card class="pa-4 biometria-card d-flex flex-column" rounded="xl" elevation="2">
                        <div class="text-subtitle-2 font-weight-bold mb-2">
                            Fotografía
                        </div>

                        <div class="biometria-body d-flex flex-column align-center justify-center">
                            <v-img v-if="form.fotografia" :src="form.fotografia" width="180" height="180"
                                class="rounded foto-preview" cover />

                            <v-icon v-else size="90" color="primary">
                                mdi-camera
                            </v-icon>

                            <v-btn color="primary" prepend-icon="mdi-camera" class="mt-4" @click="abrirCamara">
                                Capturar fotografía
                            </v-btn>

                            <v-btn v-if="form.fotografia" color="error" variant="text" class="mt-2"
                                @click="eliminarFotografia">
                                Eliminar fotografía
                            </v-btn>

                            <div class="mt-2 text-caption">
                                {{
                                    form.fotografia
                                        ? 'Fotografía capturada correctamente'
                                        : 'Sin fotografía capturada'
                                }}
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
            <v-btn variant="text" @click="resetForm">
                Cancelar
            </v-btn>

            <v-btn color="primary" @click="guardar">
                Guardar
            </v-btn>
        </v-card-actions>
    </v-form>

    <!-- DIALOG HUELLA -->
    <v-dialog v-model="dialogHuella" max-width="650" persistent>
        <v-card rounded="xl" elevation="8">
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-h6 font-weight-bold">
                    Captura de huella
                </span>

                <v-btn icon="mdi-close" variant="text" @click="dialogHuella = false" />
            </v-card-title>

            <v-divider />

            <v-card-text>
                <CapturaHuella :dedo="dedoSeleccionado" @huellaCapturada="guardarHuella" />
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="error" @click="dialogHuella = false">
                    Cancelar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- DIALOG CÁMARA -->
    <v-dialog v-model="dialogCamara" max-width="600" persistent>
        <v-card rounded="xl">
            <v-card-title class="text-h6 font-weight-bold">
                Capturar fotografía
            </v-card-title>

            <v-card-text>
                <v-select v-model="camaraSeleccionada" :items="camarasDisponibles" item-title="nombre" item-value="id"
                    label="Seleccionar cámara" variant="outlined" prepend-inner-icon="mdi-video" class="mb-4"
                    @update:model-value="cambiarCamara" />

                <div class="camera-container">
                    <video ref="videoRef" autoplay playsinline class="camera-video"></video>

                    <canvas ref="canvasRef" class="d-none"></canvas>
                </div>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="error" @click="cerrarCamara">
                    Cancelar
                </v-btn>

                <v-btn color="primary" prepend-icon="mdi-camera" @click="tomarFoto">
                    Tomar foto
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, toRaw, toRefs, nextTick } from 'vue'
import { httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useAuthStore } from '../../stores/auth'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import CapturaHuella from '../biometria/Huella.vue'

import {
    obtenerFechaHoy,
    validarNumeroDocumento,
    validarDocumento,
    validarFecha,
    validarFechaVencimiento as validarFechaVencimientoUtil,
    campoObligatorio,
    validarFechaNacimiento,
    validarCorreo,
    formatearTelefono,
    validarTelefono,
    convertirFechaDDMMYYYY
} from '../../utils/validacionesformulario'

import {
    abrirCamara as abrirCamaraUtil,
    cambiarCamara as cambiarCamaraUtil,
    tomarFoto as tomarFotoUtil,
    cerrarCamara as cerrarCamaraUtil,
    eliminarFotografia as eliminarFotografiaUtil
} from '../../utils/camaraFormulario'

const props = defineProps({
    catalogos: {
        type: Object,
        required: true
    },
    idTipoSolicitud: {
        type: [Number, String],
        required: true
    }
})

const { catalogos } = toRefs(props)

const authStore = useAuthStore()
const { success, error } = useAlert()

const formRef = ref(null)
const fechaVencimientoRef = ref(null)

const menuFechaDefuncion = ref(false)
const fechaDefuncionSeleccionada = ref(null)

const dialogHuella = ref(false)
const dedoSeleccionado = ref(1)

const dialogCamara = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const streamCamara = ref(null)
const camarasDisponibles = ref([])
const camaraSeleccionada = ref(null)

const mostrarCorrelativoNumero = ref(false)

const mensajeDocumento = ref('')
const documentoValido = ref(false)

const menuFecha = ref(false)
const fechaSeleccionada = ref(null)

const menuFechaEmision = ref(false)
const menuFechaVencimiento = ref(false)
const fechaEmisionSeleccionada = ref(null)
const fechaVencimientoSeleccionada = ref(null)

const menuFechaNacimiento = ref(false)
const fechaNacimientoSeleccionada = ref(null)

const bloquearDatosRenap = computed(() => form.value.consultado_renap === 'S')
const consultandoRenap = ref(false)

//Para filtrar municipios según departamento seleccionado en residencia, nacimiento, vecindad y entrega

const municipiosResidenciaFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_residencia)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const revalidarFechaVencimiento = async () => {
    await nextTick()

    if (!fechaVencimientoRef.value) return

    await fechaVencimientoRef.value.validate()
}


const seleccionarFechaDefuncion = (fecha) => {
    form.value.fecha_defuncion = formatearFechaInput(fecha)
    menuFechaDefuncion.value = false
}

const municipiosNacimientoFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_nacimiento)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosVecindadFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_vecindad)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosEntregaFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_entrega)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosCentroVotacionFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_votacion)

    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

// Función para limpiar el municipio de residencia cuando se cambia el departamento de residencia
const cambiarDepartamentoResidencia = () => {
    form.value.id_municipio_residencia = null
}

const cambiarDepartamentoNacimiento = () => {
    form.value.id_municipio_nacimiento = null
}

const cambiarDepartamentoVecindad = () => {
    form.value.id_municipio_vecindad = null
}

const cambiarDepartamentoEntrega = () => {
    form.value.id_municipio_entrega = null
}

const cambiarDepartamentoCentroVotacion = () => {
    form.value.id_municipio_votacion = null
}


const validarDocumentoEnTiempoReal = () => {
    const dpi = String(form.value.numero_documento || '')
        .replace(/\s/g, '')
        .replace(/-/g, '')

    if (dpi.length < 13) {
        documentoValido.value = false
        mensajeDocumento.value = ''
        return
    }

    const resultado = validarDocumento(form.value.numero_documento)

    documentoValido.value = resultado.valido
    mensajeDocumento.value = resultado.mensaje
}

const dedosHuella = [
    { id: 1, nombre: 'Índice derecho' },
    { id: 2, nombre: 'Índice izquierdo' },
    { id: 3, nombre: 'Medio derecho' },
    { id: 4, nombre: 'Medio izquierdo' },
    { id: 5, nombre: 'Anular derecho' },
    { id: 6, nombre: 'Anular izquierdo' },
    { id: 7, nombre: 'Meñique derecho' },
    { id: 8, nombre: 'Meñique izquierdo' },
    { id: 9, nombre: 'Pulgar derecho' },
    { id: 10, nombre: 'Pulgar izquierdo' }
]

const getInitialForm = () => ({
    id: 0,
    id_ejercicio_fiscal: 1,
    id_tipo_solicitud: props.idTipoSolicitud,
    id_origen_solicitud: 1,
    fecha: obtenerFechaHoy(),

    correlativo: 1,
    numero: 1,

    id_tipo_documento: 1,
    numero_documento: '',
    fecha_emision: obtenerFechaHoy(),
    fecha_vencimiento: '',
    correlativo_documento: null,
    id_entidad_emisora: 1,

    nombre1: '',
    nombre2: '',
    nombre3: null,
    apellido1: '',
    apellido2: '',
    apellido3: null,
    sexo: 'M',
    id_estado_civil: 1,
    fecha_nacimiento: '',
    correo: '',
    telefono: '',

    probatorio: null,
    id_ocupacion: 1,

    id_departamento_nacimiento: 1,
    id_municipio_nacimiento: 1,

    id_departamento_vecindad: 1,
    id_municipio_vecindad: 1,

    id_departamento_residencia: 1,
    id_municipio_residencia: 1,
    direccion_residencia: '',
    id_localizacion: 1,

    id_tipo_entrega: 1,
    id_departamento_entrega: 1,
    id_municipio_entrega: 1,
    direccion_entrega: '',
    id_centro_entrega: 1,

    empadronado: 0,
    empadronamiento: 0,
    anverso: null,
    reverso: null,

    id_departamento_votacion: 1,
    id_municipio_votacion: 1,
    id_centro_votacion: 1,

    fecha_defuncion: null,
    enrolado: 0,
    id_padre: 0,
    consultado_renap: 'N',
    observaciones: '',

    huella: null,
    fotografia: null,

    enrolamientos: [
        {
            id: 0,
            id_caracteristica: 11,
            probatorio: '',
            imagen: '',
            plantilla: '',
            thumnail: '',
            observaciones: 'Rostro frontal'
        }
    ]
})

const form = ref(getInitialForm())

const esEntregaDomicilio = computed(() => Number(form.value.id_tipo_entrega) === 1)
const esEntregaCentro = computed(() => Number(form.value.id_tipo_entrega) === 2)

watch(
    () => props.idTipoSolicitud,
    (nuevoValor) => {
        form.value.id_tipo_solicitud = nuevoValor
    }

)

watch(
    () => form.value.fecha_emision,
    () => {
        formRef.value?.validate()
    }
)

const mapEstadoCivilRenap = {
    S: 'SOLTERO',
    C: 'CASADO',
    D: 'DIVORCIADO',
    V: 'VIUDO',
    U: 'UNION LIBRE',
    P: 'SEPARADO'
}

const obtenerIdEstadoCivilRenap = (codigoRenap) => {
    const nombreEstado = mapEstadoCivilRenap[String(codigoRenap || '').trim().toUpperCase()]

    if (!nombreEstado) return null

    return obtenerIdPorNombre(catalogos.value.estadosCiviles, nombreEstado)
}

//pruebas de json de renap
const respuestaRenap = {
    result: true,
    fecha: "11/05/2026",
    responseCode: 200,
    hora: "22:08:49",
    mensaje: "Se muestran los resultados encontrados.",
    respuesta_renap: {
        data: [
            {
                CUI: "2727872562202",
                PRIMER_NOMBRE: "DARWIN",
                SEGUNDO_NOMBRE: "NOÉ",
                TERCER_NOMBRE: null,
                PRIMER_APELLIDO: "GAITÁN",
                SEGUNDO_APELLIDO: "CARRILLO",
                APELLIDO_CASADA: null,
                FECHA_NACIMIENTO: "09/03/1995",
                FECHA_DEFUNCION: null,
                GENERO: "F",
                ESTADO_CIVIL: "C",
                NACIONALIDAD: "GUATEMALA",
                PAIS_NACIMIENTO: "GUATEMALA",
                DEPTO_NACIMIENTO: "JUTIAPA",
                MUNI_NACIMIENTO: "JUTIAPA",
                VECINDAD: "GUATEMALA,MIXCO",
                ORDEN_CEDULA: null,
                REGISTRO_CEDULA: null,
                FOTO: "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",
                OCUPACION: "BACH. INDUSTRIAL Y PERITO EN ELECTRÓNICA",
                FECHA_VENCIMIENTO: "17/05/2027",
                CORRELATIVO_DPI: "002"
            }
        ]
    }
}

const normalizarTexto = (texto) => {
    return String(texto || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

const obtenerIdPorNombre = (lista, nombre) => {
    const nombreNormalizado = normalizarTexto(nombre)

    const encontrado = lista.find(item =>
        normalizarTexto(item.nombre) === nombreNormalizado
    )

    return encontrado?.id || null
}

const separarDepartamentoMunicipio = (valor) => {
    const partes = String(valor || '')
        .split(',')
        .map(x => x.trim())

    return {
        departamento: partes[0] || '',
        municipio: partes[1] || ''
    }
}

const consultarRenap = async () => {
    try {
        const resultado = validarDocumento(form.value.numero_documento)

        mensajeDocumento.value = resultado.mensaje
        documentoValido.value = resultado.valido

        if (!resultado.valido) {
            error(resultado.mensaje || 'Ingrese un DPI válido antes de consultar RENAP')
            return
        }

        consultandoRenap.value = true
        alertLoading('Consultando RENAP', 'Extrayendo datos del ciudadano...')

        const dpiLimpio = String(form.value.numero_documento)
            .replace(/\s/g, '')
            .replace(/-/g, '')

        // const response = await httpsol.get(
        //     `${endpoints.renap.consultar}/${dpiLimpio}`
        //)

        const payloadRenap = {
            id_usuario_renap: 3,
            busquedaCui: {
                cui: dpiLimpio
            }
        }

        const renap = await httpsol.post(
            endpoints.renap.consultar,
            payloadRenap
        )

        //console.log('Respuesta de RENAP:', renap.data)  

        const respuestaRenap = renap.data
        //localStorage.setItem('renap_response', JSON.stringify(respuestaRenap))
        //const dataGuardada = JSON.parse(localStorage.getItem('renap_response'))
        // console.log('Datos guardados en localStorage:', dataGuardada)

        //const datos = dataGuardada
        const datos = respuestaRenap.data
        console.log('Datos obtenidos de RENAP:', datos)
        if (!datos) {
            closeAlert()
            error('No se encontraron datos en RENAP para el DPI ingresado')
            return
        }

        const vecindad = separarDepartamentoMunicipio(datos.respuesta_renap.data[0].VECINDAD)

        console.log('Datos obtenidos de RENAP:', datos)

        console.log('Datos obtenidos de RENAP:', datos.respuesta_renap.data[0].PRIMER_NOMBRE)

        form.value.nombre1 = datos.respuesta_renap.data[0].PRIMER_NOMBRE || ''
        form.value.nombre2 = datos.respuesta_renap.data[0].SEGUNDO_NOMBRE || ''
        form.value.nombre3 = datos.respuesta_renap.data[0].TERCER_NOMBRE || null

        form.value.apellido1 = datos.respuesta_renap.data[0].PRIMER_APELLIDO || ''
        form.value.apellido2 = datos.respuesta_renap.data[0].SEGUNDO_APELLIDO || ''
        form.value.apellido3 = datos.respuesta_renap.data[0].APELLIDO_CASADA || null

        form.value.sexo = datos.respuesta_renap.data[0].GENERO || form.value.sexo
        form.value.fecha_nacimiento = datos.respuesta_renap.data[0].FECHA_NACIMIENTO || form.value.fecha_nacimiento

        form.value.id_estado_civil =
            obtenerIdEstadoCivilRenap(datos.respuesta_renap.data[0].ESTADO_CIVIL)
            || form.value.id_estado_civil

        form.value.fecha_defuncion = datos.respuesta_renap.data[0].FECHA_DEFUNCION || form.value.fecha_defuncion

        form.value.id_departamento_nacimiento =
            obtenerIdPorNombre(catalogos.value.departamentos, datos.respuesta_renap.data[0].DEPTO_NACIMIENTO) || form.value.id_departamento_nacimiento

        form.value.id_municipio_nacimiento =
            obtenerIdPorNombre(catalogos.value.municipios, datos.respuesta_renap.data[0].MUNI_NACIMIENTO)
            || form.value.id_municipio_nacimiento

        form.value.id_departamento_vecindad =
            obtenerIdPorNombre(catalogos.value.departamentos, vecindad.departamento) || form.value.id_departamento_vecindad

        form.value.id_municipio_vecindad =
            obtenerIdPorNombre(catalogos.value.municipios, vecindad.municipio) || form.value.id_municipio_vecindad

        form.value.id_departamento_residencia =
            obtenerIdPorNombre(catalogos.value.departamentos, vecindad.departamento) || form.value.id_departamento_residencia

        form.value.id_municipio_residencia =
            obtenerIdPorNombre(catalogos.value.municipios, vecindad.municipio) || form.value.id_municipio_residencia

        form.value.id_departamento_votacion =
            obtenerIdPorNombre(catalogos.value.departamentos, vecindad.departamento) || form.value.id_departamento_votacion

        form.value.id_municipio_votacion =
            obtenerIdPorNombre(catalogos.value.municipios, vecindad.municipio) || form.value.id_municipio_votacion


        form.value.fecha_vencimiento =
            datos.respuesta_renap.data[0].FECHA_VENCIMIENTO || form.value.fecha_vencimiento

        form.value.correlativo_documento =
            datos.respuesta_renap.data[0].CORRELATIVO_DPI || form.value.correlativo_documento

        form.value.consultado_renap = 'S'

        form.value.fotografia = `data:image/jpeg;base64,${datos.respuesta_renap.data[0].FOTO}` || ''
        form.value.enrolamientos[0].imagen = datos.respuesta_renap.data[0].FOTO
        closeAlert()
        success('Datos extraídos de RENAP correctamente')
    } catch (err) {
        closeAlert()
        console.error('Error al consultar RENAP:', err)
        error('No se pudo consultar RENAP')
    } finally {
        consultandoRenap.value = false
    }
}

const validarDocumentoBlur = () => {
    const resultado = validarDocumento(form.value.numero_documento)

    mensajeDocumento.value = resultado.mensaje
    documentoValido.value = resultado.valido
}

const formatearFechaInput = (fecha) => {
    if (!fecha) return ''

    const date = new Date(fecha)

    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()

    return `${dia}/${mes}/${anio}`
}

const seleccionarFecha = (fecha) => {
    form.value.fecha = formatearFechaInput(fecha)
    menuFecha.value = false
}

const seleccionarFechaEmision = async (fecha) => {
    form.value.fecha_emision = formatearFechaInput(fecha)
    menuFechaEmision.value = false

    await revalidarFechaVencimiento()
}

const seleccionarFechaVencimiento = (fecha) => {
    form.value.fecha_vencimiento = formatearFechaInput(fecha)
    menuFechaVencimiento.value = false
}

const seleccionarFechaNacimiento = (fecha) => {
    form.value.fecha_nacimiento = formatearFechaInput(fecha)
    menuFechaNacimiento.value = false
}

const validarFechaEmision = (valor) => {
    return validarFecha(valor)
}

const validarFechaVencimiento = (valor) => {
    return validarFechaVencimientoUtil(
        valor,
        form.value.fecha_emision
    )
}

const limpiarSoloHuellas = () => {
    const idsDedos = dedosHuella.map(x => x.id)

    form.value.enrolamientos = form.value.enrolamientos.filter(
        x => !idsDedos.includes(x.id_caracteristica)
    )

    form.value.huella = null
    form.value.enrolado = 0
}

const guardarHuella = (fingerprints) => {
    try {
        console.log('Huellas recibidas desde componente:', fingerprints)

        if (!Array.isArray(fingerprints) || fingerprints.length === 0) {
            error('No se recibió información de la huella')
            return
        }

        limpiarSoloHuellas()

        if (!form.value.enrolamientos) {
            form.value.enrolamientos = []
        }

        fingerprints.forEach((item) => {
            const huellaBase64 = item.templateBase64

            if (!huellaBase64) return

            const nuevoEnrolamiento = {
                id: 0,
                id_caracteristica: item.finger,
                probatorio: huellaBase64,
                imagen: huellaBase64,
                plantilla: huellaBase64,
                thumnail: huellaBase64,
                observaciones: `Huella dedo ${item.finger}`
            }

            const index = form.value.enrolamientos.findIndex(
                x => x.id_caracteristica === item.finger
            )

            if (index >= 0) {
                form.value.enrolamientos[index] = nuevoEnrolamiento
            } else {
                form.value.enrolamientos.push(nuevoEnrolamiento)
            }
        })

        form.value.huella = fingerprints[0].templateBase64
        form.value.enrolado = 1

        dialogHuella.value = false

        success(`Se guardaron ${fingerprints.length} huellas correctamente`)
    } catch (err) {
        console.error('Error al guardar huellas:', err)
        error('Error al guardar las huellas capturadas')
    }
}

const abrirCamara = async () => {
    try {
        await abrirCamaraUtil({
            dialogCamara,
            camarasDisponibles,
            camaraSeleccionada,
            streamCamara,
            videoRef
        })
    } catch (err) {
        console.error('Error al abrir la cámara:', err)
        error('No se pudo acceder a la cámara')
        dialogCamara.value = false
    }
}

const cambiarCamara = async () => {
    try {
        await cambiarCamaraUtil({
            dialogCamara,
            camaraSeleccionada,
            streamCamara,
            videoRef
        })
    } catch (err) {
        console.error('Error al cambiar cámara:', err)
        error('No se pudo cambiar la cámara')
    }
}

const tomarFoto = () => {
    try {
        tomarFotoUtil({
            videoRef,
            canvasRef,
            form
        })

        cerrarCamara()
    } catch (err) {
        console.error('Error al tomar fotografía:', err)
        error('No se pudo capturar la fotografía')
    }
}

const cerrarCamara = () => {
    cerrarCamaraUtil({
        streamCamara,
        dialogCamara
    })
}

const eliminarFotografia = () => {
    eliminarFotografiaUtil({
        form
    })
}

const resetForm = () => {
    form.value = getInitialForm()

    mensajeDocumento.value = ''
    documentoValido.value = false
}

const guardar = async () => {
    try {

        const fechaSolicitud = convertirFechaDDMMYYYY(form.value.fecha)
        const fechaVencimiento = convertirFechaDDMMYYYY(form.value.fecha_vencimiento)


        if (form.value.fecha_defuncion !== null && form.value.fecha_defuncion !== '') {
            error('Persona fallecida. No se puede registrar una solicitud de afiliación para este ciudadano.')
            return
        }

        if (fechaVencimiento <= fechaSolicitud) {
            error('Documento vencido. La fecha de vencimiento debe ser mayor que la fecha de la solicitud.')
            return
        }
        const validacion = await formRef.value?.validate()

        if (validacion && !validacion.valid) {

            error('Revise los campos obligatorios antes de guardar')
            return
        }

        if (form.value.fotografia === null || form.value.huella === null || form.value.enrolamientos[0].imagen === "") {
            error('Datos biometricos incompletos. Se requiere una fotografía y una huella.')
            return

        }

        alertLoading('Registrando', 'Creando nueva solicitud...')

        const payload = {
            ...form.value,
            id_tipo_solicitud: props.idTipoSolicitud
        }

        console.log('Datos a enviar para crear solicitud:', payload)

        const respuestaSave = await httpsol.post(
            endpoints.solicitudes.crear,
            payload
        )

        console.log('Respuesta al crear solicitud:', respuestaSave.data)

        closeAlert()

        if (respuestaSave.data?.resultado === 200) {
            success(`Inserción exitosa de la solicitud #${respuestaSave.data?.data || 'desconocida'}`)
            return
        } else {
            error(respuestaSave.data?.mensaje || 'Error desconocido al crear la solicitud')
            return
        }


    } catch (err) {
        closeAlert()
        console.error('Error al guardar afiliación:', err)
        error('No se pudo guardar la solicitud de afiliación')
    }
}
</script>

<style scoped>
.border {
    border-width: 2px !important;
    border-style: solid !important;
}

.border-primary {
    border-color: rgb(var(--v-theme-primary)) !important;
}

.camera-container {
    width: 100%;
    max-width: 100%;
    height: 320px;
    overflow: hidden;
    border-radius: 16px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.camera-video {
    width: 100%;
    height: 100%;
    max-width: 100%;
    object-fit: cover;
    display: block;
}

.biometria-card {
    width: 100%;
}

.biometria-body {
    min-height: 230px;
}

.foto-preview {
    border: 2px solid rgba(var(--v-theme-primary), 0.35);
}
</style>