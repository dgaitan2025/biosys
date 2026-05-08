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
                    Identificador Biométrico dactilar
                </v-card-title>

                <v-form ref="formRef" v-model="formValido" @submit.prevent="enviarDatos">
                    <v-text-field v-model="form.dpi" label="DPI" placeholder="1234567890101"
                        prepend-inner-icon="mdi-card-account-details" variant="outlined" maxlength="13" counter
                        :rules="dpiRules" class="mb-4" />

                    <div class="text-subtitle-1 font-weight-medium mb-2">
                        Seleccione la mano
                    </div>

                    <v-radio-group v-model="form.mano" inline :rules="[v => !!v || 'Seleccione una mano']"
                        @update:model-value="limpiarDedoYHuella">
                        <v-radio label="Derecha" value="derecha" />
                        <v-radio label="Izquierda" value="izquierda" />
                    </v-radio-group>

                    <v-alert v-if="form.mano" type="info" variant="tonal" density="compact" class="mb-4">
                        Mano seleccionada: {{ form.mano === 'derecha' ? 'Derecha' : 'Izquierda' }}
                    </v-alert>

                    <v-select v-model="form.dedo" :items="dedosDisponibles" item-title="nombre" item-value="codigo"
                        label="Seleccione el dedo" prepend-inner-icon="mdi-fingerprint" variant="outlined"
                        :disabled="!form.mano" :rules="[v => !!v || 'Seleccione un dedo']" class="mb-3"
                        @update:model-value="form.codigoHuella = null" />

                    <v-btn type="submit" color="primary" block size="large" :disabled="!formValido">
                        verificar huella
                    </v-btn>
                </v-form>

            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
    validarNumeroDocumento,

} from '../../utils/validacionesformulario'
import { httpcat, httpshuella } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import { useRouter } from 'vue-router'


const router = useRouter()
function volverInicio() {
    router.push('/usuarios')
}

const formRef = ref(null)
const formValido = ref(false)
const { success, error, confirm } = useAlert()

const form = ref({
    dpi: '',
    mano: null,
    dedo: null,
    codigoHuella: null
})

const dpiRules = [
    v => !!v || 'El DPI es obligatorio',
    v => /^\d+$/.test(v) || 'El DPI solo debe contener números',
    v => v.length === 13 || 'El DPI debe tener 13 dígitos',
    v => validarNumeroDocumento(v) || 'El DPI no es válido'
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

const codigosHuella = computed(() => {
    return form.value.dedo ? codigosPorDedo[form.value.dedo] || [] : []
})

const limpiarDedoYHuella = () => {
    form.value.dedo = null
    form.value.codigoHuella = null
}

const enviarDatos = async () => {
    const { valid } = await formRef.value.validate()
    if (!valid) return

    const payloadHuella = {
        numero_documento: String(form.value.dpi).replace(/\s/g, ''),
        codigo: form.value.dedo
    }

    console.log('Payload huella:', payloadHuella)

    try {
        const responseHuella = await httpcat.post(
            endpoints.solicitudes.huella,
            payloadHuella
        )

        console.log('Respuesta huella:', responseHuella.data)

        if (!responseHuella.data || !responseHuella.data.imagen) {
            error(
                'Error',
                responseHuella.data?.mensaje || 'No se encontró imagen de huella.'
            )
            return
        }

        const payloadBiometria = {
            templateBase64: responseHuella.data.imagen
        }

        console.log('Payload biometría:', payloadBiometria)

        const responseBiometria = await httpshuella.post(
            endpoints.biometriahuella.verificar,
            payloadBiometria
        )

        console.log('Respuesta biometría:', responseBiometria.data)

        if (responseBiometria.data?.verified === false) {
            error(
                'Validación fallida',
                'La huella no coincide con el registro.'
            )
            return
        }

        success(
            'Validación exitosa',
            'La huella coincide con el registro.'
        )

    } catch (err) {
        console.error('Status:', err.response?.status)
        console.error('Respuesta backend:', err.response?.data)
        console.error('Error completo:', err)

        error(
            'Error',
            err.response?.data?.mensaje || 'Ocurrió un error al validar la huella.'
        )
    }
}
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}
</style>