<template>

    <v-card-title class="pa-6 bg-white">
        <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between ga-4 w-100">
            <div class="d-flex align-center ga-4">
                <v-avatar color="primary" variant="tonal" size="56">
                    <v-icon size="32">mdi-account-check</v-icon>
                </v-avatar>

                <div>
                    <div class="text-h5 font-weight-bold">
                        Registrar asistencia
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                        Registro de asistencia a evento por DPI, QR, rostro o huella.
                    </div>
                </div>
            </div>

            <v-chip :color="form.rostro || form.huella ? 'success' : 'warning'" variant="tonal" size="large"
                class="font-weight-bold">
                <v-icon start>
                    {{ form.rostro || form.huella ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                </v-icon>
                {{ form.rostro || form.huella ? 'Validación realizada' : 'Validación pendiente' }}
            </v-chip>
        </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-6">
        <v-alert v-if="errorCatalogos" type="error" variant="tonal" class="mb-4" rounded="lg">
            {{ errorCatalogos }}
        </v-alert>

        <v-form ref="formRef">
            <v-row>
                <!-- DATOS DE ASISTENCIA -->
                <v-col cols="12" lg="5">
                    <v-card rounded="xl" variant="tonal" color="white" class="pa-4 h-100">
                        <div class="d-flex align-center ga-3 mb-4">
                            <v-avatar color="primary" variant="flat">
                                <v-icon>mdi-calendar-check</v-icon>
                            </v-avatar>

                            <div>
                                <div class="text-subtitle-1 font-weight-bold">
                                    Datos de asistencia
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                    Seleccione evento e ingrese DPI.
                                </div>
                            </div>
                        </div>

                        <v-select v-model="form.id_evento" :items="catalogos.eventos" item-title="texto" item-value="id"
                            label="Evento" variant="outlined" bg-color="surface" prepend-inner-icon="mdi-calendar"
                            :rules="[campoObligatorio]" :loading="cargandoCatalogos" :disabled="cargandoCatalogos" />

                        <v-text-field v-model="form.numero_documento" label="Número documento / DPI" variant="outlined"
                            bg-color="surface" placeholder="0000 00000 0000"
                            prepend-inner-icon="mdi-card-account-details" :rules="[validarNumeroDocumento]"
                            maxlength="15" @input="form.numero_documento = formatearDpiInput(form.numero_documento)"
                            @blur="validarDocumentoBlur" :success="documentoValido"
                            :success-messages="documentoValido ? mensajeDocumento : ''"
                            :error="mensajeDocumento !== '' && !documentoValido"
                            :error-messages="mensajeDocumento !== '' && !documentoValido ? mensajeDocumento : ''" />

                        <v-btn color="secondary" variant="flat" prepend-icon="mdi-qrcode-scan" block size="large"
                            class="mb-4" @click="abrirLectorQr">
                            Leer QR
                        </v-btn>

                        <v-select v-model="form.tipo_validacion" :items="tiposValidacion" item-title="nombre"
                            item-value="id" label="Tipo de validación" variant="outlined" bg-color="surface"
                            prepend-inner-icon="mdi-shield-check" :rules="[campoObligatorio]" />

                        <v-alert type="info" variant="tonal" density="compact" rounded="lg" class="mt-2">
                            Seleccione el método de validación para registrar la asistencia.
                        </v-alert>
                    </v-card>
                </v-col>

                <!-- VALIDACIÓN BIOMÉTRICA -->
                <v-col cols="12" lg="7">
                    <v-card rounded="xl" elevation="0" border class="pa-4 h-100">
                        <div class="d-flex align-center ga-3 mb-4">
                            <v-avatar color="primary" variant="tonal">
                                <v-icon>mdi-fingerprint</v-icon>
                            </v-avatar>

                            <div>
                                <div class="text-subtitle-1 font-weight-bold">
                                    Validación biométrica
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                    Capture rostro o verifique huella.
                                </div>
                            </div>
                        </div>

                        <v-row>
                            <!-- ROSTRO -->
                            <v-col v-if="habilitarRostro" cols="12" md="6">
                                <v-card rounded="xl" elevation="2" class="pa-4 h-100"
                                    :color="form.fotografia ? 'success' : undefined"
                                    :variant="form.fotografia ? 'tonal' : 'elevated'">
                                    <div class="d-flex align-center justify-space-between mb-4">
                                        <div class="d-flex align-center ga-2">
                                            <v-icon color="primary">mdi-camera</v-icon>
                                            <span class="font-weight-bold">Rostro</span>
                                        </div>

                                        <v-chip :color="form.fotografia ? 'success' : 'warning'" size="small"
                                            variant="tonal">
                                            {{ form.fotografia ? 'Capturado' : 'Pendiente' }}
                                        </v-chip>
                                    </div>

                                    <div class="d-flex flex-column align-center justify-center">
                                        <v-avatar size="180" color="primary" variant="tonal" class="mb-4">
                                            <v-img v-if="form.fotografia" :src="form.fotografia" cover />

                                            <v-icon v-else size="82">
                                                mdi-camera-plus
                                            </v-icon>
                                        </v-avatar>

                                        <v-btn color="primary" prepend-icon="mdi-camera" block size="large"
                                            :disabled="!habilitarRostro" @click="abrirCamara">
                                            Capturar fotografía
                                        </v-btn>

                                        <v-btn v-if="form.rostro || form.fotografia" color="error" variant="text" block
                                            class="mt-2" :disabled="!habilitarRostro" @click="eliminarFotografia">
                                            Eliminar fotografía
                                        </v-btn>

                                        <div class="text-caption text-medium-emphasis mt-3 text-center">
                                            {{
                                                form.rostro || form.fotografia
                                                    ? 'Fotografía capturada correctamente'
                                                    : 'Sin fotografía capturada'
                                            }}
                                        </div>
                                    </div>
                                </v-card>
                            </v-col>

                            <!-- HUELLA -->
                            <v-row justify="center" align="stretch">
                                <v-col v-if="habilitarHuella" cols="12" md="6">
                                    <v-card rounded="xl" elevation="2" class="pa-4 h-100 w-100"
                                        :color="form.huella ? 'success' : undefined"
                                        :variant="form.huella ? 'tonal' : 'elevated'">
                                        <div class="d-flex align-center justify-space-between mb-4">
                                            <div class="d-flex align-center ga-2">
                                                <v-icon color="primary">mdi-fingerprint</v-icon>
                                                <span class="font-weight-bold">Huella</span>
                                            </div>

                                        </div>

                                        <div class="d-flex flex-column align-center">
                                            <v-avatar size="60" color="primary" variant="tonal" class="mb-4">
                                                <v-icon size="40">
                                                    mdi-fingerprint
                                                </v-icon>
                                            </v-avatar>

                                            <v-radio-group v-model="form.mano" inline class="mt-0"
                                                :rules="habilitarHuella ? [v => !!v || 'Seleccione una mano'] : []"
                                                @update:model-value="limpiarDedoYHuella">
                                                <v-radio label="Derecha" value="derecha" />
                                                <v-radio label="Izquierda" value="izquierda" />
                                            </v-radio-group>

                                            <v-alert v-if="form.mano" type="info" variant="tonal" density="compact"
                                                rounded="lg" class="mb-3 w-100">
                                                Mano seleccionada:
                                                {{ form.mano === 'derecha' ? 'Derecha' : 'Izquierda' }}
                                            </v-alert>

                                            <v-select v-model="form.codigo_huella" :items="dedosDisponibles"
                                                item-title="nombre" item-value="codigo" label="Seleccione el dedo"
                                                prepend-inner-icon="mdi-fingerprint" variant="outlined"
                                                bg-color="surface" class="w-100" :disabled="!form.mano"
                                                :rules="habilitarHuella ? [v => !!v || 'Seleccione un dedo'] : []"
                                                @update:model-value="form.huella = ''" />

                                            <v-btn color="primary" prepend-icon="mdi-fingerprint" block size="large"
                                                :loading="verificandoHuella"
                                                :disabled="!form.mano || !form.codigo_huella || verificandoHuella"
                                                @click="verificarHuellaRegistrada">
                                                Verificar huella
                                            </v-btn>

                                            <v-btn v-if="form.huella" color="error" variant="text" block class="mt-2"
                                                @click="eliminarHuella">
                                                Eliminar huella
                                            </v-btn>

                                            <div class="text-caption text-medium-emphasis mt-3 text-center">
                                                {{
                                                    form.huella
                                                        ? 'Huella verificada correctamente'
                                                        : 'Sin huella verificada'
                                                }}
                                            </div>
                                        </div>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-col v-if="!habilitarRostro && !habilitarHuella" cols="12">
                                <v-alert type="warning" variant="tonal" rounded="lg">
                                    Seleccione un tipo de validación para continuar.
                                </v-alert>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
        </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-4 justify-space-between">
        <div class="text-caption text-medium-emphasis">
            Fecha: {{ form.fecha }}
        </div>

        <v-btn variant="tonal" color="error" prepend-icon="mdi-broom" :disabled="guardando" @click="limpiarFormulario">
            Limpiar
        </v-btn>
    </v-card-actions>


    <!-- DIALOG CÁMARA -->
    <v-dialog v-model="dialogCamara" max-width="700" persistent>
        <v-card rounded="xl">
            <v-card-title class="d-flex align-center justify-space-between pa-5">
                <div class="d-flex align-center ga-3">
                    <v-avatar color="primary" variant="tonal">
                        <v-icon>mdi-camera</v-icon>
                    </v-avatar>

                    <div>
                        <div class="text-h6 font-weight-bold">
                            Capturar fotografía
                        </div>
                        <div class="text-caption text-medium-emphasis">
                            Seleccione cámara y capture la imagen.
                        </div>
                    </div>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="cerrarCamara" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-5">
                <v-select v-model="camaraSeleccionada" :items="camarasDisponibles" item-title="nombre" item-value="id"
                    label="Seleccionar cámara" variant="outlined" prepend-inner-icon="mdi-video" class="mb-4"
                    @update:model-value="cambiarCamara" />

                <v-responsive aspect-ratio="16/9" class="rounded-xl bg-black">
                    <video ref="videoRef" autoplay playsinline class="w-100 h-100" style="object-fit: cover;"></video>

                    <canvas ref="canvasRef" class="d-none"></canvas>
                </v-responsive>
            </v-card-text>

            <v-card-actions class="pa-5 justify-end">
                <v-btn variant="text" color="error" @click="cerrarCamara">
                    Cancelar
                </v-btn>

                <v-btn color="primary" prepend-icon="mdi-camera" @click="tomarFoto">
                    Registrar asistencia
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- DIALOG QR -->
    <v-dialog v-model="dialogQr" max-width="700" persistent>
        <v-card rounded="xl">
            <v-card-title class="d-flex align-center justify-space-between pa-5">
                <div class="d-flex align-center ga-3">
                    <v-avatar color="secondary" variant="tonal">
                        <v-icon>mdi-qrcode-scan</v-icon>
                    </v-avatar>

                    <div>
                        <div class="text-h6 font-weight-bold">
                            Leer código QR
                        </div>
                        <div class="text-caption text-medium-emphasis">
                            Escanee el QR para cargar el DPI.
                        </div>
                    </div>
                </div>

                <v-btn icon="mdi-close" variant="text" @click="cerrarLectorQr" />
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-5">
                <v-alert type="info" variant="tonal" class="mb-4" rounded="lg">
                    Coloque el QR frente a la cámara.
                </v-alert>

                <v-responsive aspect-ratio="16/9" class="rounded-xl bg-black">
                    <video ref="videoQrRef" class="w-100 h-100" autoplay playsinline style="object-fit: cover;"></video>
                </v-responsive>
            </v-card-text>

            <v-card-actions class="pa-5 justify-end">
                <v-btn variant="text" color="error" @click="cerrarLectorQr">
                    Cancelar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { httpsol, httpcat, httpshuella } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import {
    abrirCamara as abrirCamaraUtil,
    cambiarCamara as cambiarCamaraUtil,
    tomarFoto as tomarFotoUtil,
    cerrarCamara as cerrarCamaraUtil,
    eliminarFotografia as eliminarFotografiaUtil
} from '../../utils/camaraFormulario'

import QrScanner from 'qr-scanner'

const emit = defineEmits(['asistenciaRegistrada', 'cancelar'])

const { success, error } = useAlert()

const dialogQr = ref(false)
const videoQrRef = ref(null)
const qrScanner = ref(null)

const formRef = ref(null)
const guardando = ref(false)
const verificandoHuella = ref(false)

const cargandoCatalogos = ref(false)
const errorCatalogos = ref('')

const dialogCamara = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const streamCamara = ref(null)
const camarasDisponibles = ref([])
const camaraSeleccionada = ref(null)

const documentoValido = ref(false)
const mensajeDocumento = ref('')



const catalogos = ref({
    eventos: []
})

const tiposValidacion = [
    { id: 'ROSTRO', nombre: 'Rostro' },
    { id: 'HUELLA', nombre: 'Huella' }
]

const dedos = {
    derecha: [
        { nombre: 'Pulgar', codigo: 'H1' },
        { nombre: 'Índice', codigo: 'H2' },
        { nombre: 'Medio', codigo: 'H3' },
        { nombre: 'Anular', codigo: 'H4' },
        { nombre: 'Meñique', codigo: 'H5' }
    ],
    izquierda: [
        { nombre: 'Pulgar', codigo: 'H6' },
        { nombre: 'Índice', codigo: 'H7' },
        { nombre: 'Medio', codigo: 'H8' },
        { nombre: 'Anular', codigo: 'H9' },
        { nombre: 'Meñique', codigo: 'H10' }
    ]
}

const dedosDisponibles = computed(() => {
    return form.value.mano ? dedos[form.value.mano] : []
})

const obtenerFechaHoraActual = () => {
    const fecha = new Date()

    const dia = String(fecha.getDate()).padStart(2, '0')
    const mes = String(fecha.getMonth() + 1).padStart(2, '0')
    const anio = fecha.getFullYear()
    const hora = String(fecha.getHours()).padStart(2, '0')
    const minuto = String(fecha.getMinutes()).padStart(2, '0')
    const segundo = String(fecha.getSeconds()).padStart(2, '0')

    return `${dia}/${mes}/${anio} ${hora}:${minuto}:${segundo}`
}

const getInitialForm = () => ({
    id_evento: 1,
    numero_documento: '',
    rostro: '',
    rostroPreview: '',
    fotografia: null,
    enrolamientos: [
        {
            codigo: 'R1',
            id_caracteristica: 11,
            imagen: '',
            plantilla: '',
            observaciones: 'Rostro frontal'
        }
    ],
    huella: null,
    mano: "izquierda",
    codigo_huella: 'H7',
    id_caracteristica_huella: null,
    fecha: obtenerFechaHoraActual(),
    tipo_validacion: null,
    observaciones: ''
})

const form = ref(getInitialForm())

const habilitarRostro = computed(() => {
    return form.value.tipo_validacion === 'BIOMETRICA'
        || form.value.tipo_validacion === 'ROSTRO'
})

const habilitarHuella = computed(() => {
    return form.value.tipo_validacion === 'BIOMETRICA'
        || form.value.tipo_validacion === 'HUELLA'
})

watch(
    () => form.value.tipo_validacion,
    (nuevoValor) => {
        if (nuevoValor === 'ROSTRO') {
            form.value.mano = null
            form.value.codigo_huella = null
            eliminarHuella()
        }

        if (nuevoValor === 'HUELLA') {
            eliminarFotografia()
        }
    }
)



const campoObligatorio = (valor) => {
    return !!valor || 'Campo obligatorio'
}

const limpiarDpi = (valor) => {
    return String(valor || '')
        .replace(/\s/g, '')
        .replace(/-/g, '')
}

const validarNumeroDocumento = (valor) => {
    const dpi = limpiarDpi(valor)

    if (!dpi) return 'Campo obligatorio'
    if (!/^\d+$/.test(dpi)) return 'El DPI debe contener solo números'
    if (dpi.length !== 13) return 'El DPI debe tener 13 dígitos'

    return true
}

const formatearDpiInput = (valor) => {
    const dpi = limpiarDpi(valor).slice(0, 13)

    if (dpi.length <= 4) return dpi
    if (dpi.length <= 9) return `${dpi.slice(0, 4)} ${dpi.slice(4)}`

    return `${dpi.slice(0, 4)} ${dpi.slice(4, 9)} ${dpi.slice(9)}`
}

const validarDocumentoBlur = () => {
    const resultado = validarNumeroDocumento(form.value.numero_documento)

    documentoValido.value = resultado === true
    mensajeDocumento.value = resultado === true
        ? 'DPI válido'
        : resultado
}

const endpointCatalogos = computed(() => {
    return endpoints?.asistencias?.catalogos
        || endpoints?.eventos?.listar
        || '/biosys/api/gestion_eventos/Evento/listar'
})

const endpointRegistrarAsistencia = computed(() => {
    return endpoints?.asistencias?.registrar
        || '/biosys/api/gestion_eventos/Asistencia/registrar'
})

const normalizarEventos = (data) => {
    const eventos =
        data?.eventos
        || data?.Eventos
        || data?.lista
        || data?.items
        || data

    if (!Array.isArray(eventos)) return []

    return eventos.map(evento => ({
        id: evento.id,
        codigo: evento.codigo || '',
        nombre: evento.nombre || '',
        fecha: evento.fecha || '',
        activo: evento.activo,
        texto: `${evento.codigo || 'SIN-CODIGO'} - ${evento.nombre || 'Sin nombre'}`
    }))
}

const cargarCatalogos = async () => {
    try {
        cargandoCatalogos.value = true
        errorCatalogos.value = ''

        const response = await httpsol.get(endpoints.catalogos.eventos)

        const data = response.data?.data || response.data || []
        console.log('Respuesta eventos:', data)

        catalogos.value.eventos = normalizarEventos(data)
            .filter(evento => Number(evento.activo ?? 1) === 1)

        if (!catalogos.value.eventos.length) {
            errorCatalogos.value = 'No se encontraron eventos activos.'
        }
    } catch (err) {
        console.error('Error al cargar eventos:', err)
        errorCatalogos.value = 'No se pudieron cargar los eventos.'
    } finally {
        cargandoCatalogos.value = false
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
        console.error('Error al abrir cámara:', err)
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
            form,
            origen: 'asistencia',
        })

        cerrarCamara()
    } catch (err) {
        console.error('Error al tomar fotografía:', err)
        error('No se pudo capturar la fotografía')
    }


}
watch(
    () => form.value.fotografia,
    async (nuevaFoto, fotoAnterior) => {
        if (!nuevaFoto || nuevaFoto === fotoAnterior) return

        if (form.value.tipo_validacion !== 'ROSTRO') return

        await guardarAsistenciaRostro()
    }
)

const cerrarCamara = () => {
    cerrarCamaraUtil({
        streamCamara,
        dialogCamara
    })
}

const eliminarFotografia = () => {
    eliminarFotografiaUtil({
        form,
        campo: 'fotografia'
    })

    form.value.rostro = ''
    form.value.rostroPreview = ''
    form.value.enrolamientos[0].imagen = ''
}
const obtenerIdCaracteristicaDesdeCodigo = (codigo) => {
    const numero = String(codigo || '').replace('H', '')
    return Number(numero || 0)
}

const limpiarDedoYHuella = () => {
    form.value.codigo_huella = null
    eliminarHuella()
}

const verificarHuellaRegistrada = async () => {
    try {
        validarDocumentoBlur()

        if (!documentoValido.value) {
            error('Ingrese un DPI válido antes de verificar la huella')
            return
        }

        if (!form.value.mano) {
            error('Seleccione una mano')
            return
        }

        if (!form.value.codigo_huella) {
            error('Seleccione un dedo')
            return
        }

        verificandoHuella.value = true
        alertLoading('Verificando huella', 'Consultando y validando huella registrada...')

        const payloadHuella = {
            numero_documento: limpiarDpi(form.value.numero_documento),
            codigo: form.value.codigo_huella
        }

        console.log('Payload huella asistencia:', payloadHuella)

        const responseHuella = await httpcat.post(
            endpoints.solicitudes.huella,
            payloadHuella
        )

        console.log('Respuesta huella asistencia:', responseHuella.data)

        if (!responseHuella.data || !responseHuella.data.imagen) {
            throw new Error(
                responseHuella.data?.mensaje ||
                'No se encontró imagen de huella para el DPI y dedo seleccionado.'
            )
        }

        const payloadBiometria = {
            templateBase64: responseHuella.data.imagen
        }

        console.log('Payload biometría huella asistencia:', payloadBiometria)

        const responseBiometria = await httpshuella.post(
            endpoints.biometriahuella.verificar,
            payloadBiometria
        )

        const registrarAsistencia = {
            id_evento: form.value.id_evento,
            id_afiliado: responseHuella.data.idAfiliado

        }

        console.log('Respuesta biometría huella asistencia:', responseBiometria.data)

        if (responseBiometria.data?.verified === false) {
            throw new Error('La huella no coincide con el registro.')
        } else {

            console.log('datos para registrar asistencia por huella:', registrarAsistencia)

            const registro = await httpsol.post(endpoints.asistencia.asistenciaHuella, registrarAsistencia

            )

            if (registro.data.resultado === 200) {

                closeAlert()
                success('Registro de asistencia exitoso.')
            } else {
                throw new Error(registro.data?.mensaje || 'No se pudo registrar la asistencia después de verificar la huella.')
            }



        }

        form.value.huella = responseHuella.data.imagen
        form.value.id_caracteristica_huella = obtenerIdCaracteristicaDesdeCodigo(form.value.codigo_huella)

    } catch (err) {
        console.error('Error al verificar huella:', err)
        closeAlert()
        error(
            'Error',
            err.response?.data?.mensaje ||
            err.response?.data?.message ||
            err.message ||
            'Ocurrió un error al validar la huella.'
        )
    } finally {

        verificandoHuella.value = false
    }
}

const eliminarHuella = () => {
    form.value.huella = ''
    form.value.id_caracteristica_huella = null
}

const validarBiometria = () => {
    if (form.value.tipo_validacion === 'BIOMETRICA') {
        if (!form.value.rostro || !form.value.huella) {
            error('Debe capturar fotografía y huella para registrar la asistencia')
            return false
        }
    }

    if (form.value.tipo_validacion === 'ROSTRO' && !form.value.rostro) {
        error('Debe capturar la fotografía para registrar la asistencia')
        return false
    }

    if (form.value.tipo_validacion === 'HUELLA' && !form.value.huella) {
        error('Debe capturar la huella para registrar la asistencia')
        return false
    }

    return true
}

const obtenerPayload = () => {
    return {
        id_evento: Number(form.value.id_evento),
        numero_documento: limpiarDpi(form.value.numero_documento),
        rostro: form.value.rostro,
        huella: form.value.huella,
        codigo_huella: form.value.codigo_huella,
        id_caracteristica_huella: Number(form.value.id_caracteristica_huella || 0),
        fecha: form.value.fecha,
        tipo_validacion: form.value.tipo_validacion,
        observaciones: form.value.observaciones
            ? String(form.value.observaciones).trim()
            : null
    }
}

const guardarAsistencia = async () => {
    try {
        const validacion = await formRef.value?.validate()

        if (validacion && !validacion.valid) {
            error('Revise los campos obligatorios antes de registrar')
            return
        }

        validarDocumentoBlur()

        if (!documentoValido.value) {
            error('Ingrese un DPI válido')
            return
        }

        if (!validarBiometria()) {
            return
        }

        guardando.value = true
        alertLoading('Registrando asistencia', 'Guardando validación biométrica...')

        const payload = obtenerPayload()

        const response = await httpsol.post(
            endpointRegistrarAsistencia.value,
            payload
        )

        closeAlert()

        if (
            response.data?.resultado === 200 ||
            response.data?.success === true ||
            response.status === 200
        ) {
            success(response.data?.mensaje || 'Asistencia registrada correctamente')
            emit('asistenciaRegistrada', response.data?.data || payload)
            limpiarFormulario()
            return
        }

        error(response.data?.mensaje || 'No se pudo registrar la asistencia')
    } catch (err) {
        closeAlert()
        console.error('Error al registrar asistencia:', err)
        error('Ocurrió un error al registrar la asistencia')
    } finally {
        guardando.value = false
    }
}

const limpiarFormulario = () => {
    form.value = getInitialForm()
    documentoValido.value = false
    mensajeDocumento.value = ''
    formRef.value?.resetValidation()
    emit('cancelar')
}

// para la asistencia 
const guardarAsistenciaRostro = async () => {
    try {
        if (!form.value.fotografia) return

        if (!form.value.id_evento) {
            error('Seleccione un evento antes de registrar asistencia')
            return
        }

        validarDocumentoBlur()

        if (!documentoValido.value) {
            error('Ingrese un DPI válido antes de registrar asistencia')
            return
        }

        const rostroBase64 = form.value.fotografia.replace('data:image/jpeg;base64,', '')

        const payload = {
            id_evento: Number(form.value.id_evento),
            numero_documento: limpiarDpi(form.value.numero_documento),
            rostro: rostroBase64
        }

        alertLoading('Registrando asistencia', 'Validando rostro y guardando asistencia...')

        const response = await httpsol.post(
            endpoints.asistencia.asistenciaRostro,
            payload
        )

        closeAlert()

        if (
            response.data?.resultado === 200 ||
            response.data?.success === true
        ) {
            success(response.data?.mensaje || 'Asistencia registrada correctamente')
            return
        }

        error(response.data?.mensaje || 'No se pudo registrar la asistencia')
    } catch (err) {
        closeAlert()
        console.error('Error al registrar asistencia por rostro:', err)

        error(
            'Error',
            err.response?.data?.mensaje ||
            err.response?.data?.message ||
            err.message ||
            'Ocurrió un error al registrar la asistencia'
        )
    }
}

//para el QR

const abrirLectorQr = async () => {
    try {
        dialogQr.value = true

        await nextTick()

        qrScanner.value = new QrScanner(
            videoQrRef.value,
            result => {
                procesarQr(result.data)
            },
            {
                preferredCamera: 'environment',
                highlightScanRegion: true,
                highlightCodeOutline: true
            }
        )

        await qrScanner.value.start()
    } catch (err) {
        console.error('Error al abrir lector QR:', err)
        error('No se pudo acceder a la cámara para leer QR')
        cerrarLectorQr()
    }
}

const cerrarLectorQr = () => {
    if (qrScanner.value) {
        qrScanner.value.stop()
        qrScanner.value.destroy()
        qrScanner.value = null
    }

    dialogQr.value = false
}

const procesarQr = (valorQr) => {
    console.log('QR detectado:', valorQr)

    const dpi = extraerDpiDesdeQr(valorQr)

    if (!dpi) {
        error('QR inválido', 'No se pudo obtener un DPI válido del código QR.')
        return
    }

    form.value.numero_documento = formatearDpiInput(dpi)
    validarDocumentoBlur()

    cerrarLectorQr()

    success('QR leído correctamente', 'El DPI fue cargado en el formulario.')
}

const extraerDpiDesdeQr = (valorQr) => {
    try {
        const texto = String(valorQr || '').trim()

        if (texto.startsWith('{')) {
            const data = JSON.parse(texto)

            const dpiJson =
                data.numero_documento ||
                data.dpi ||
                data.cui ||
                data.documento

            const limpio = String(dpiJson || '').replace(/\D/g, '')

            return limpio.length === 13 ? limpio : null
        }

        const soloNumeros = texto.replace(/\D/g, '')

        return soloNumeros.length === 13 ? soloNumeros : null
    } catch (err) {
        console.error('Error al procesar QR:', err)
        return null
    }
}


onMounted(() => {
    cargarCatalogos()
})
</script>
