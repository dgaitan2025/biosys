<template>
    <v-container fluid class="fill-height bg-grey-lighten-4">

        <v-row justify="center" align="center">
            <v-col cols="12" class="d-flex justify-end">
                <v-btn color="primary" prepend-icon="mdi-home" @click="volverInicio">
                    Inicio
                </v-btn>
            </v-col>

            <v-col cols="12" sm="10" md="7" lg="5">



                <v-card-title class="text-center text-h5 font-weight-bold">
                    Identificador Biométrico Facial

                </v-card-title>



                <v-form ref="formRef" v-model="formValido" @submit.prevent="enviarDatos">
                    <v-text-field v-model="form.dpi" label="DPI" placeholder="1234567890101"
                        prepend-inner-icon="mdi-card-account-details" variant="outlined" maxlength="13" counter
                        :rules="dpiRules" class="mb-4" />

                    <v-card class="pa-4 biometria-card d-flex flex-column mb-4" rounded="xl" elevation="2">
                        <div class="text-subtitle-2 font-weight-bold mb-2">
                            Fotografía facial
                        </div>

                        <div class="biometria-body d-flex flex-column align-center justify-center">
                            <v-img v-if="form.fotografia" :src="form.fotografia" width="180" height="180"
                                class="rounded foto-preview" cover />

                            <v-icon v-else size="90" color="primary">
                                mdi-face-recognition
                            </v-icon>

                            <v-btn color="primary" prepend-icon="mdi-camera" class="mt-4"
                                @click="abrirCamaraFormulario">
                                Capturar rostro
                            </v-btn>

                            <v-btn v-if="form.fotografia" color="error" variant="text" class="mt-2"
                                @click="eliminarFotografiaFormulario">
                                Eliminar fotografía
                            </v-btn>

                            <div class="mt-2 text-caption text-center">
                                {{
                                    form.fotografia
                                        ? 'Rostro capturado correctamente'
                                        : 'Sin rostro capturado'
                                }}
                            </div>
                        </div>
                    </v-card>

                    <v-btn type="submit" color="success" block size="large"
                        :disabled="!formValido || !form.enrolamientos[0].imagen">
                        Verificar rostro
                    </v-btn>
                </v-form>

                <v-dialog v-model="dialogCamara" max-width="300px">
                    <v-card class="pa-4 rounded-xl">
                        <v-card-title class="text-h6">
                            Capturar rostro
                        </v-card-title>

                        <v-select v-model="camaraSeleccionada" :items="camarasDisponibles" item-title="nombre"
                            item-value="id" label="Seleccionar cámara" variant="outlined" class="mb-3"
                            @update:model-value="cambiarCamaraFormulario" />

                        <video ref="videoRef" autoplay playsinline class="video-camara"></video>

                        <canvas ref="canvasRef" class="d-none"></canvas>

                        <v-card-actions class="px-0 mt-3">
                            <v-btn color="error" variant="tonal" @click="cerrarCamaraFormulario">
                                Cancelar
                            </v-btn>

                            <v-spacer />

                            <v-btn color="primary" @click="tomarFoto">
                                Tomar foto
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { validarNumeroDocumento } from '../../utils/validacionesformulario'
import { httpcat, httpshuella } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import { useRouter } from 'vue-router'

import {
    abrirCamara,
    cambiarCamara,
    tomarFoto as tomarFotoUtil,
    cerrarCamara
} from '../../utils/camaraFormulario'

const { success, error } = useAlert()
const router = useRouter()
const formRef = ref(null)
const formValido = ref(false)

const dialogCamara = ref(false)
const camarasDisponibles = ref([])
const camaraSeleccionada = ref(null)
const streamCamara = ref(null)
const videoRef = ref(null)
const canvasRef = ref(null)

const form = ref({
    dpi: '',
    fotografia: null,
    enrolamientos: [
        {
            imagen: null
        }
    ]
})


function volverInicio() {
    router.push('/usuarios')
}
const dpiRules = [
    v => !!v || 'El DPI es obligatorio',
    v => /^\d+$/.test(v) || 'El DPI solo debe contener números',
    v => v.length === 13 || 'El DPI debe tener 13 dígitos',
    v => validarNumeroDocumento(v) || 'El DPI no es válido'
]

const abrirCamaraFormulario = async () => {
    await abrirCamara({
        dialogCamara,
        camarasDisponibles,
        camaraSeleccionada,
        streamCamara,
        videoRef
    })
}

const cambiarCamaraFormulario = async () => {
    await cambiarCamara({
        dialogCamara,
        camaraSeleccionada,
        streamCamara,
        videoRef
    })
}

const tomarFoto = () => {
    try {
        tomarFotoUtil({
            videoRef,
            canvasRef,
            form
        })

        cerrarCamaraFormulario()

    } catch (err) {
        console.error('Error al tomar fotografía:', err)
        error('No se pudo capturar la fotografía')
    }

    console.log('Form después de tomar foto:', form.value)
}

const cerrarCamaraFormulario = () => {
    cerrarCamara({
        streamCamara,
        dialogCamara
    })
}

const enviarDatos = async () => {

    alertLoading('Validando rostro, por favor espere...')
    const { valid } = await formRef.value.validate()
    if (!valid) return

    if (!form.value.enrolamientos[0].imagen) {
        error('Error', 'Debe capturar una fotografía antes de validar.')
        return
    }

    const payloadRostro = {
        numero_documento: String(form.value.dpi).replace(/\s/g, ''),
        rostro: form.value.fotografia.replace(/^data:image\/(png|jpeg);base64,/, '')
    }

    try {
        const responseRostro = await httpcat.post(
            endpoints.solicitudes.validarRostro,
            payloadRostro
        )

        if (!responseRostro.data) {
            closeAlert()
            error(
                'Error',
                responseRostro.data?.mensaje || 'No se recibió respuesta del servidor.'
            )
            return
        }

        if (responseRostro.data?.coincide === false) {
            closeAlert()
            error(
                'Validación fallida',
                responseRostro.data?.mensaje || 'El rostro no coincide con el registro.'
            )
            return
        }
        closeAlert()

        console.log('Respuesta rostro:', responseRostro.data)

        success('Validación exitosa', 'El rostro coincide con el registro.')

    } catch (err) {
        console.error('Status:', err.response?.status)
        console.error('Respuesta backend:', err.response?.data)
        console.error('Error completo:', err)

        closeAlert()
        error(
            'Error',
            err.response?.data?.mensaje || 'Ocurrió un error al validar el rostro.'
        )
    }
}
</script>

<style scoped>
.biometria-card {
    width: 100%;
    min-height: 280px;
}

.biometria-body {

    min-height: 220px;
}

.foto-preview {
    border: 2px solid rgba(0, 0, 0, 0.08);
}

.video-camara {
    width: 100%;
    max-height: 50%;
    border-radius: 16px;
    background: #000;
    object-fit: cover;
}
</style>