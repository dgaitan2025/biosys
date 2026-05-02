<template>
    <v-container fluid class="pa-4">
        <v-card-title class="d-flex align-center justify-space-between">
            <span class="text-h6 font-weight-bold">
                {{ modo === 'crear' ? 'Nueva Solicitud' : `Editar Solicitud #${form.id}` }}
            </span>
            <v-col cols="6" md="2" class="text-md-right">
            <v-btn color="primary" prepend-icon="mdi-home" @click="volverInicio">
                Inicio
            </v-btn>
        </v-col>

        </v-card-title>

        
        <v-divider />

        <v-form ref="formRef">
            <v-container fluid>
                <!-- DATOS GENERALES -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Datos generales</div>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_ejercicio_fiscal" :items="catalogos.ejerciciosFiscales"
                            item-title="codigo" item-value="id" label="Ejercicio fiscal" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_tipo_solicitud" :items="catalogos.tiposSolicitud" item-title="nombre"
                            item-value="id" label="Tipo solicitud" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_origen_solicitud" :items="catalogos.origenesSolicitud"
                            item-title="nombre" item-value="id" label="Origen solicitud" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-menu v-model="menuFecha" :close-on-content-click="false" location="bottom">
                            <template #activator="{ props }">
                                <v-text-field v-model="form.fecha" label="Fecha" variant="outlined"
                                    placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar" v-bind="props"
                                    @click:prepend-inner="menuFecha = true" />
                            </template>

                            <v-date-picker v-model="fechaSeleccionada" @update:model-value="seleccionarFecha" />
                        </v-menu>
                    </v-col>

                    <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                        <v-text-field v-model="form.correlativo" label="Correlativo" type="number" variant="outlined" />
                    </v-col>

                    <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                        <v-text-field v-model="form.numero" label="Número" type="number" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- DOCUMENTO -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Documento</div>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_tipo_documento" :items="catalogos.tiposDocumento" item-title="nombre"
                            item-value="id" label="Tipo documento" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-text-field v-model="form.numero_documento" label="Número documento" type="text"
                            variant="outlined" placeholder="0000 00000 0000" :rules="[validarNumeroDocumento]"
                            @blur="validarDocumentoBlur" :success="documentoValido"
                            :success-messages="documentoValido ? mensajeDocumento : ''"
                            :error="mensajeDocumento !== '' && !documentoValido"
                            :error-messages="mensajeDocumento !== '' && !documentoValido ? mensajeDocumento : ''" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-menu v-model="menuFechaEmision" :close-on-content-click="false" location="bottom">
                            <template #activator="{ props }">
                                <v-text-field v-model="form.fecha_emision" label="Fecha emisión" variant="outlined"
                                    placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar" v-bind="props"
                                    :rules="[validarFechaEmision]" @click:prepend-inner="menuFechaEmision = true" />
                            </template>

                            <v-date-picker v-model="fechaEmisionSeleccionada"
                                @update:model-value="seleccionarFechaEmision" />
                        </v-menu>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-menu v-model="menuFechaVencimiento" :close-on-content-click="false" location="bottom">
                            <template #activator="{ props }">
                                <v-text-field v-model="form.fecha_vencimiento" label="Fecha vencimiento"
                                    variant="outlined" placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar"
                                    v-bind="props" :rules="[validarFechaVencimiento]"
                                    @click:prepend-inner="menuFechaVencimiento = true" />
                            </template>

                            <v-date-picker v-model="fechaVencimientoSeleccionada"
                                @update:model-value="seleccionarFechaVencimiento" />
                        </v-menu>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.correlativo_documento" label="Correlativo documento" type="number"
                            variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_entidad_emisora" :items="catalogos.entidadesEmisoras"
                            item-title="nombre" item-value="id" label="Entidad emisora" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- DATOS PERSONALES -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Datos personales</div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.nombre1" label="Primer nombre" variant="outlined"
                            :rules="[campoObligatorio]" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.nombre2" label="Segundo nombre" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.nombre3" label="Tercer nombre" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.apellido1" label="Primer apellido" variant="outlined"
                            :rules="[campoObligatorio]" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.apellido2" label="Segundo apellido" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-text-field v-model="form.apellido3" label="Tercer apellido" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.sexo" :items="['M', 'F']" label="Sexo" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_estado_civil" :items="catalogos.estadosCiviles" item-title="nombre"
                            item-value="id" label="Estado civil" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-menu v-model="menuFechaNacimiento" :close-on-content-click="false" location="bottom">
                            <template #activator="{ props }">
                                <v-text-field v-model="form.fecha_nacimiento" label="Fecha nacimiento"
                                    variant="outlined" placeholder="dd/mm/yyyy" prepend-inner-icon="mdi-calendar"
                                    v-bind="props" :rules="[validarFechaNacimiento]"
                                    @click:prepend-inner="menuFechaNacimiento = true" />
                            </template>

                            <v-date-picker v-model="fechaNacimientoSeleccionada"
                                @update:model-value="seleccionarFechaNacimiento" />
                        </v-menu>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-text-field v-model="form.correo" label="Correo" type="email" variant="outlined"
                            :rules="[validarCorreo]" />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-text-field v-model="form.telefono" label="Teléfono" type="text" variant="outlined"
                            placeholder="0000-0000" maxlength="9" :rules="[validarTelefono]"
                            @input="form.telefono = formatearTelefono(form.telefono)" />
                    </v-col>



                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_ocupacion" :items="catalogos.ocupaciones" item-title="nombre"
                            item-value="id" label="Ocupación" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- NACIMIENTO -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Lugar de nacimiento</div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="form.id_departamento_nacimiento" :items="catalogos.departamentos"
                            item-title="nombre" item-value="id" label="Departamento nacimiento" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="form.id_municipio_nacimiento" :items="catalogos.municipios"
                            item-title="nombre" item-value="id" label="Municipio nacimiento" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- VECINDAD -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Vecindad</div>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="form.id_departamento_vecindad" :items="catalogos.departamentos"
                            item-title="nombre" item-value="id" label="Departamento vecindad" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-select v-model="form.id_municipio_vecindad" :items="catalogos.municipios" item-title="nombre"
                            item-value="id" label="Municipio vecindad" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- RESIDENCIA -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Residencia</div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_departamento_residencia" :items="catalogos.departamentos"
                            item-title="nombre" item-value="id" label="Departamento residencia" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_municipio_residencia" :items="catalogos.municipios"
                            item-title="nombre" item-value="id" label="Municipio residencia" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_localizacion" :items="catalogos.localizaciones" item-title="nombre"
                            item-value="id" label="Localización" variant="outlined" />
                    </v-col>

                    <v-col cols="12">
                        <v-textarea v-model="form.direccion_residencia" label="Dirección residencia" variant="outlined"
                            rows="2" />
                    </v-col>
                </v-row>

                <!-- ENTREGA -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Entrega</div>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.id_tipo_entrega" :items="catalogos.tiposEntrega" item-title="nombre"
                            item-value="id" label="Tipo entrega" variant="outlined" />
                    </v-col>

                    <v-col v-if="form.id_tipo_entrega === 1" cols="12" md="3">
                        <v-select v-model="form.id_departamento_entrega" :items="catalogos.departamentos"
                            item-title="nombre" item-value="id" label="Departamento entrega" variant="outlined" />
                    </v-col>

                    <v-col v-if="form.id_tipo_entrega === 1" cols="12" md="3">
                        <v-select v-model="form.id_municipio_entrega" :items="catalogos.municipios" item-title="nombre"
                            item-value="id" label="Municipio entrega" variant="outlined" />
                    </v-col>

                    <v-col v-if="form.id_tipo_entrega === 2" cols="12" md="3">
                        <v-select v-model="form.id_centro_entrega" :items="catalogos.centrosEntrega" item-title="nombre"
                            item-value="id" label="Centro entrega" variant="outlined" />
                    </v-col>

                    <v-col v-if="form.id_tipo_entrega === 1" cols="12">
                        <v-textarea v-model="form.direccion_entrega" label="Dirección entrega" variant="outlined"
                            rows="2" />
                    </v-col>
                </v-row>

                <!-- DATOS ELECTORALES -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Datos electorales</div>
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-switch v-model="form.empadronado" :true-value="1" :false-value="0" label="Empadronado"
                            color="primary" inset />
                    </v-col>

                    <v-col cols="12" md="3" v-if="form.empadronado === 1">
                        <v-text-field v-model="form.empadronamiento" label="Número de empadronamiento"
                            variant="outlined" clearable />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-select v-model="form.consultado_renap" :items="['S', 'N']" label="Consultado RENAP"
                            variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_departamento_votacion" :items="catalogos.departamentos"
                            item-title="nombre" item-value="id" label="Departamento votación" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_municipio_votacion" :items="catalogos.municipios" item-title="nombre"
                            item-value="id" label="Municipio votación" variant="outlined" />
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-select v-model="form.id_centro_votacion" :items="catalogos.centrosVotacion"
                            item-title="nombre" item-value="id" label="Centro votación" variant="outlined" />
                    </v-col>
                </v-row>

                <!-- OTROS -->
                <v-row>
                    <v-col cols="12">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Otros datos</div>
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
        </v-form>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
            <v-btn variant="text" @click="resetForm">
                Cancelar
            </v-btn>

            <v-btn color="primary" @click="guardar">
                {{ modo === 'crear' ? 'Guardar' : 'Actualizar' }}
            </v-btn>
        </v-card-actions>
    </v-container>

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
                <v-alert type="info" variant="tonal" class="mb-4">
                    Seleccione el dedo que se va a capturar antes de iniciar la lectura.
                </v-alert>

                <v-select v-model="dedoSeleccionado" :items="dedosHuella" item-title="nombre" item-value="id"
                    label="Dedo a capturar" variant="outlined" prepend-inner-icon="mdi-fingerprint" class="mb-4" />

                <CapturaHuella :dedo="dedoSeleccionado" @huellaCapturada="guardarHuella" />
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="error" @click="dialogHuella = false">
                    Cancelar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, toRaw, watch } from 'vue'
import { httpcat, httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useAuthStore } from '../../stores/auth'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import CapturaHuella from '../biometria/Huella.vue'
import { useRouter } from 'vue-router'
import {
    obtenerFechaHoy, validarNumeroDocumento,
    validarDocumento, validarFecha,
    validarFechaVencimiento as validarFechaVencimientoUtil,
    campoObligatorio, validarFechaNacimiento, validarCorreo,
    formatearTelefono, validarTelefono
} from '../../utils/validacionesformulario'

import {
    abrirCamara as abrirCamaraUtil,
    cambiarCamara as cambiarCamaraUtil,
    tomarFoto as tomarFotoUtil,
    cerrarCamara as cerrarCamaraUtil,
    eliminarFotografia as eliminarFotografiaUtil
} from '../../utils/camaraFormulario'
import { cuiValido } from '../../utils/validaDPI'


const router = useRouter()
const dialogCamara = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const streamCamara = ref(null)

const camarasDisponibles = ref([])
const camaraSeleccionada = ref(null)

const mostrarCorrelativoNumero = ref(false)

const authStore = useAuthStore()
const formRef = ref(null)

const vista = ref('cards')
const search = ref('')
const items = ref([])
const modo = ref('crear')
const dialogHuella = ref(false)
const { success, error, confirm } = useAlert()

const mensajeDocumento = ref('')
const documentoValido = ref(false)

const validarDocumentoBlur = () => {
    const resultado = validarDocumento(form.value.numero_documento)

    mensajeDocumento.value = resultado.mensaje
    documentoValido.value = resultado.valido
}

const menuFechaEmision = ref(false)
const menuFechaVencimiento = ref(false)

const fechaEmisionSeleccionada = ref(null)
const fechaVencimientoSeleccionada = ref(null)

const seleccionarFechaEmision = (fecha) => {
    form.value.fecha_emision = formatearFechaInput(fecha)
    menuFechaEmision.value = false
}

const seleccionarFechaVencimiento = (fecha) => {
    form.value.fecha_vencimiento = formatearFechaInput(fecha)
    menuFechaVencimiento.value = false
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

const menuFechaNacimiento = ref(false)
const fechaNacimientoSeleccionada = ref(null)

const seleccionarFechaNacimiento = (fecha) => {
    form.value.fecha_nacimiento = formatearFechaInput(fecha)
    menuFechaNacimiento.value = false
}


const fotoFile = ref(null)

const guardarHuella = (data) => {
    try {
        console.log('Huella recibida desde componente:', data)

        if (!data) {
            error('No se recibió información de la huella')
            return
        }

        if (!dedoSeleccionado.value) {
            error('Debe seleccionar el dedo antes de capturar la huella')
            return
        }

        let huellaBase64 = ''

        // Si el componente ya manda base64
        if (typeof data === 'string') {
            huellaBase64 = data
        }
        // Si el componente manda un objeto con muestras
        else {
            huellaBase64 = convertirJsonABase64(data)
        }

        if (!form.value.enrolamientos) {
            form.value.enrolamientos = []
        }

        const dedo = dedosHuella.find(x => x.id === dedoSeleccionado.value)

        const nuevoEnrolamiento = {
            id: 0,

            // Si tu API espera número, cambia esto por el id numérico correspondiente
            id_caracteristica: dedoSeleccionado.value,

            probatorio: huellaBase64,
            imagen: huellaBase64,
            plantilla: huellaBase64,
            thumnail: huellaBase64,
            observaciones: dedo ? `Huella ${dedo.nombre}` : 'Huella capturada'
        }

        const index = form.value.enrolamientos.findIndex(
            x => x.id_caracteristica === dedoSeleccionado.value
        )

        if (index >= 0) {
            form.value.enrolamientos[index] = nuevoEnrolamiento
        } else {
            form.value.enrolamientos.push(nuevoEnrolamiento)
        }

        // Para que el texto de la tarjeta diga "Huella capturada correctamente"
        form.value.huella = huellaBase64

        dialogHuella.value = false

        success('Huella capturada correctamente')

        console.log('Enrolamientos actualizados:', form.value.enrolamientos)
        console.log('Huella guardada en imagen:', form.value.enrolamientos[index >= 0 ? index : form.value.enrolamientos.length - 1].imagen)

    } catch (err) {
        console.error('Error al guardar huella:', err)
        error('Error al guardar la huella capturada')
    }
}

function volverInicio() {
  router.push('/usuarios')
}

const capturarHuella = () => {
    // Aquí luego conectas el lector biométrico/API local
    //form.value.huella = 'HUELLA_CAPTURADA_BASE64_O_TEMPLATE'

    success('Huella capturada correctamente')
}

const cargarFotografia = () => {
    const file = fotoFile.value

    if (!file) return

    const reader = new FileReader()

    reader.onload = () => {
        // form.value.fotografia = reader.result
    }

    reader.readAsDataURL(file)
}

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

const headers = [
    { title: 'ID', key: 'id' },
    { title: 'Nombre completo', key: 'nombreCompleto' },
    { title: 'Documento', key: 'numero_documento' },
    { title: 'Correo', key: 'correo' },
    { title: 'Fecha', key: 'fecha' },
    { title: 'Activo', key: 'activo' },
    { title: 'Acciones', key: 'acciones', sortable: false }
]

const getInitialForm = () => ({
    id: 0,
    id_ejercicio_fiscal: 1,
    id_tipo_solicitud: 1,
    id_origen_solicitud: 1,
    fecha: obtenerFechaHoy(),
    correlativo: 1,
    numero: 1,
    id_tipo_documento: 1,
    numero_documento: "2727872562201",
    fecha_emision: '02/02/2020',
    fecha_vencimiento: '02/02/2030',
    correlativo_documento: 4,
    id_entidad_emisora: 1,
    nombre1: 'JUAN',
    nombre2: '',
    nombre3: null,
    apellido1: 'PEREZ',
    apellido2: 'GOMEZ',
    apellido3: null,
    sexo: 'M',
    id_estado_civil: 1,
    fecha_nacimiento: '09/09/1990',
    correo: 'sasa@example.com',
    telefono: "43434343",
    probatorio: null,
    id_ocupacion: 1,
    id_departamento_nacimiento: 1,
    id_municipio_nacimiento: 1,
    id_departamento_vecindad: 1,
    id_municipio_vecindad: 1,
    id_departamento_residencia: 1,
    id_municipio_residencia: 1,
    direccion_residencia: "LA FLORIDA, ZONA 7",
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
    enrolamientos: [

        {
            id: 0,
            id_caracteristica: 3,
            probatorio: "base64_probatorio_3",
            imagen: "base64_imagen_3",
            plantilla: "base64_plantilla_3",
            thumnail: "base64_thumnail_3",
            observaciones: "Rostro frontal"
        }
    ]
})

const dedoSeleccionado = ref(1)
const dedosHuella = [
    //{ id: 'pulgar_derecho', nombre: 'Pulgar derecho' },
    { id: 1, nombre: 'Índice derecho' },
    // { id: 'medio_derecho', nombre: 'Medio derecho' },
    //{ id: 'anular_derecho', nombre: 'Anular derecho' },
    //{ id: 'menique_derecho', nombre: 'Meñique derecho' },
    //{ id: 'pulgar_izquierdo', nombre: 'Pulgar izquierdo' },
    { id: 2, nombre: 'Índice izquierdo' },
    //{ id: 'medio_izquierdo', nombre: 'Medio izquierdo' },
    //{ id: 'anular_izquierdo', nombre: 'Anular izquierdo' },
    //{ id: 'menique_izquierdo', nombre: 'Meñique izquierdo' }
]

const form = ref(getInitialForm())

const nombreCompleto = (item) => {
    return [
        item.nombre1,
        item.nombre2,
        item.nombre3,
        item.apellido1,
        item.apellido2,
        item.apellido3
    ]
        .filter(x => x && String(x).trim() !== '')
        .join(' ')
}

const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    return String(fecha).replace(' 00:00:00', '')
}

const itemsFiltrados = computed(() => {
    if (!search.value) return items.value

    const texto = search.value.toLowerCase()

    return items.value.filter(item => {
        return (
            String(item.id ?? '').toLowerCase().includes(texto) ||
            String(item.numero_documento ?? '').toLowerCase().includes(texto) ||
            String(item.correo ?? '').toLowerCase().includes(texto) ||
            nombreCompleto(item).toLowerCase().includes(texto)
        )
    })
})

const obtenerDatos = async () => {
    try {
        const response = await httpcat.get(endpoints.catalogos.catalogosSolicitud)
        items.value = response.data?.data || []
    } catch (error) {
        console.error('Error al obtener solicitudes:', error)
    }
}

const obtenerCatalogos = async () => {
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


    } catch (error) {
        console.error('Error al obtener catálogos:', error)
    }
}

watch(
    () => catalogos.value.origenesSolicitud,
    (nuevoValor) => {
        if (nuevoValor && nuevoValor.length > 0) {
            form.value.id_origen_solicitud = nuevoValor[0].id
        }
    }
)

onMounted(() => {
    //obtenerDatos()
    obtenerCatalogos()
})

const nuevo = () => {
    modo.value = 'crear'
    form.value = getInitialForm()
}

const editar = (item) => {
    modo.value = 'editar'
    form.value = { ...item }
}

const resetForm = () => {
    modo.value = 'crear'
    form.value = getInitialForm()
}

const guardar = async () => {
    try {
        if (modo.value === 'crear') {
            alertLoading('Registrando', 'Creando nueva solicitud...')
            const payload = toRaw(form.value)
            console.log('Datos a enviar para crear solicitud:', payload)
            //const response = await httpsol.get(endpoints.solicitudes.consultar)
            // console.log('Respuesta al consultar solicitudes:', response.data)

            const respuestaSave = await httpsol.post(
                endpoints.solicitudes.crear,
                {
                    ...form.value,

                }
            )
            console.log('Respuesta al crear solicitud:', respuestaSave.data)

            closeAlert()
            success(`inserción exitosa de la solicitud #${respuestaSave.data?.data || 'desconocida'}`);

        } else {
            await httpsol.put(
                `${endpoints.solicitudes.actualizar}/${form.value.id}`,
                {
                    ...form.value,
                    usuarioAct: authStore.user
                }
            )
        }

        //await obtenerDatos()
        // resetForm()
    } catch (error) {
        console.error('Error al guardar:', error)
    }
}

const eliminar = async (item) => {
    try {
        await httpsol.delete(
            `${endpoints.solicitudes.eliminarSolicitud}/${item.id}`,
            {
                data: {
                    usuarioEli: authStore.user
                }
            }
        )

        if (form.value.id === item.id) {
            resetForm()
        }

        await obtenerDatos()
    } catch (error) {
        console.error('Error al eliminar:', error)
    }
}

const menuFecha = ref(false)
const fechaSeleccionada = ref(null)

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
        success('Fotografía capturada correctamente')
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



const convertirJsonABase64 = (data) => {
    const json = JSON.stringify(data)
    return btoa(unescape(encodeURIComponent(json)))
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
</style>