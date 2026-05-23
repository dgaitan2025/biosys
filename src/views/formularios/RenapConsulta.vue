<template>
    <v-container fluid class="pa-4">
        <v-card class="rounded-xl elevation-3">
            <v-card-title class="d-flex align-center justify-space-between">
                <div>
                    <h2 class="text-h5 font-weight-bold mb-1">
                        Consulta RENAP
                    </h2>
                    <p class="text-body-2 text-grey-darken-1 mb-0">
                        Ingrese el DPI para consultar y extraer los datos del ciudadano.
                    </p>
                </div>

                <v-chip v-if="form.consultado_renap === 'S'" color="success" variant="flat"
                    prepend-icon="mdi-check-circle">
                    Consultado RENAP
                </v-chip>

                <v-chip v-else color="warning" variant="tonal" prepend-icon="mdi-alert-circle">
                    Sin consultar
                </v-chip>
            </v-card-title>

            <v-divider />

            <v-card-text>
                <v-form ref="formRef">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field v-model="form.numero_documento" label="Número de DPI" variant="outlined"
                                density="comfortable" prepend-inner-icon="mdi-card-account-details"
                                :rules="[campoObligatorio]" :error="mensajeDocumento && !documentoValido"
                                :error-messages="mensajeDocumento && !documentoValido ? mensajeDocumento : ''"
                                :readonly="form.consultado_renap === 'S'" @blur="validarDpi" />
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-btn block height="48" color="primary" variant="flat" prepend-icon="mdi-account-search"
                                :loading="consultandoRenap"
                                :disabled="consultandoRenap || form.consultado_renap === 'S'" @click="consultarRenap">
                                Consultar RENAP
                            </v-btn>
                        </v-col>

                        <v-col cols="12" md="3">
                            <v-btn block height="48" color="secondary" variant="tonal" prepend-icon="mdi-eye"
                                :disabled="!personaRenap" @click="dialogResultadoRenap = true">
                                Ver resultado
                            </v-btn>
                        </v-col>

                        <v-col cols="12" md="2">
                            <v-btn block height="48" color="error" variant="tonal" prepend-icon="mdi-refresh"
                                @click="limpiarConsultaRenap">
                                Limpiar
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-alert v-if="mensajeDocumento" :type="documentoValido ? 'success' : 'warning'" variant="tonal"
                        border="start" class="mb-4">
                        {{ mensajeDocumento }}
                    </v-alert>

                    <v-row>
                        <v-col cols="12" md="3" class="text-center">
                            <v-card variant="tonal" class="rounded-xl pa-4 h-100">
                                <v-avatar size="160" class="mb-3">
                                    <v-img v-if="form.fotografia" :src="form.fotografia" cover />
                                    <v-icon v-else size="140" color="grey">
                                        mdi-account-circle
                                    </v-icon>
                                </v-avatar>

                                <div class="text-subtitle-1 font-weight-bold">
                                    Fotografía
                                </div>

                                <div class="text-caption text-grey-darken-1">
                                    Fuente RENAP
                                </div>
                            </v-card>
                        </v-col>

                        <v-col cols="12" md="9">
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.cui" label="CUI" variant="outlined"
                                        density="comfortable" readonly />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.nombre1" label="Primer nombre" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.nombre2" label="Segundo nombre" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.nombre3" label="Tercer nombre" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.apellido1" label="Primer apellido" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.apellido2" label="Segundo apellido" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.apellido3" label="Apellido de casada" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.sexo" label="Género" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.estado_civil_renap" label="Estado civil RENAP"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.fecha_nacimiento" label="Fecha nacimiento"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.fecha_defuncion" label="Fecha defunción"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.nacionalidad" label="Nacionalidad" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.pais_nacimiento" label="País de nacimiento"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.departamento_nacimiento_renap"
                                        label="Departamento nacimiento RENAP" variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.municipio_nacimiento_renap"
                                        label="Municipio nacimiento RENAP" variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.vecindad" label="Vecindad" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.orden_cedula" label="Orden cédula" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.registro_cedula" label="Registro cédula"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="8">
                                    <v-text-field v-model="form.ocupacion" label="Ocupación" variant="outlined"
                                        density="comfortable" :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.fecha_vencimiento" label="Fecha vencimiento DPI"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>

                                <v-col cols="12" md="4">
                                    <v-text-field v-model="form.correlativo_documento" label="Correlativo DPI"
                                        variant="outlined" density="comfortable"
                                        :readonly="form.consultado_renap === 'S'" />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>


    </v-container>
</template>

<script setup>
import { computed, ref } from 'vue'

// Ajusta estas rutas según tu proyecto
import { httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'

// Ajusta estos imports según donde tengas tus alertas
// También puedes borrar estos imports si ya tienes estas funciones globales.
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'

const props = defineProps({
    catalogos: {
        type: Object,
        default: () => ({
            departamentos: [],
            municipios: [],
            estadosCiviles: []
        })
    }
})

const { success, error } = useAlert()
const formRef = ref(null)
const consultandoRenap = ref(false)
const mensajeDocumento = ref('')
const documentoValido = ref(false)
const respuestaRenapVista = ref(null)
const dialogResultadoRenap = ref(false)

const form = ref({
    numero_documento: '',

    cui: '',
    nombre1: '',
    nombre2: '',
    nombre3: null,
    apellido1: '',
    apellido2: '',
    apellido3: null,

    sexo: '',
    fecha_nacimiento: '',
    fecha_defuncion: null,
    id_estado_civil: null,
    estado_civil_renap: '',

    nacionalidad: '',
    pais_nacimiento: '',
    departamento_nacimiento_renap: '',
    municipio_nacimiento_renap: '',
    vecindad: '',

    orden_cedula: '',
    registro_cedula: '',
    ocupacion: '',

    id_departamento_nacimiento: null,
    id_municipio_nacimiento: null,
    id_departamento_vecindad: null,
    id_municipio_vecindad: null,
    id_departamento_residencia: null,
    id_municipio_residencia: null,
    id_departamento_votacion: null,
    id_municipio_votacion: null,

    fecha_vencimiento: '',
    correlativo_documento: '',

    consultado_renap: 'N',
    fotografia: '',

    enrolamientos: [
        {
            imagen: ''
        }
    ]
})

const catalogos = computed(() => props.catalogos)

const campoObligatorio = value => {
    return !!value || 'Este campo es obligatorio'
}

const personaRenap = computed(() => {
    return respuestaRenapVista.value?.respuesta_renap?.data?.[0]
        || respuestaRenapVista.value?.data?.[0]
        || null
})

const respuestaRenapExitosa = computed(() => {
    return respuestaRenapVista.value?.result === true
        || respuestaRenapVista.value?.respuesta_renap?.result === true
})

const mensajeRespuestaRenap = computed(() => {
    return respuestaRenapVista.value?.mensaje
        || respuestaRenapVista.value?.respuesta_renap?.mensaje
        || 'Consulta realizada.'
})

const datosPrincipalesRenap = computed(() => {
    const persona = personaRenap.value

    if (!persona) return []

    return [
        {
            label: 'Fecha nacimiento',
            value: persona.FECHA_NACIMIENTO
        },
        {
            label: 'Género',
            value: traducirGeneroRenap(persona.GENERO)
        },
        {
            label: 'Estado civil',
            value: traducirEstadoCivilRenap(persona.ESTADO_CIVIL)
        },
        {
            label: 'Nacionalidad',
            value: persona.NACIONALIDAD
        },
        {
            label: 'País nacimiento',
            value: persona.PAIS_NACIMIENTO
        },
        {
            label: 'Vencimiento DPI',
            value: persona.FECHA_VENCIMIENTO
        },
        {
            label: 'Departamento nacimiento',
            value: persona.DEPTO_NACIMIENTO
        },
        {
            label: 'Municipio nacimiento',
            value: persona.MUNI_NACIMIENTO
        },
        {
            label: 'Vecindad',
            value: persona.VECINDAD
        },
        {
            label: 'Orden cédula',
            value: persona.ORDEN_CEDULA
        },
        {
            label: 'Registro cédula',
            value: persona.REGISTRO_CEDULA
        },
        {
            label: 'Fecha defunción',
            value: persona.FECHA_DEFUNCION
        }
    ]
})

const validarDocumento = dpi => {
    const dpiLimpio = String(dpi || '')
        .replace(/\s/g, '')
        .replace(/-/g, '')

    if (!dpiLimpio) {
        return {
            valido: false,
            mensaje: 'Ingrese un número de DPI'
        }
    }

    if (!/^\d+$/.test(dpiLimpio)) {
        return {
            valido: false,
            mensaje: 'El DPI solo debe contener números'
        }
    }

    if (dpiLimpio.length !== 13) {
        return {
            valido: false,
            mensaje: 'El DPI debe tener 13 dígitos'
        }
    }

    return {
        valido: true,
        mensaje: 'DPI válido'
    }
}

const validarDpi = () => {
    const resultado = validarDocumento(form.value.numero_documento)

    mensajeDocumento.value = resultado.mensaje
    documentoValido.value = resultado.valido
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

        const respuestaRenap = renap.data

        console.log('Respuesta RENAP:', respuestaRenap)

        respuestaRenapVista.value = respuestaRenap
        localStorage.setItem('renap_response', JSON.stringify(respuestaRenap))

        const datosPersona = respuestaRenap.data

        if (datosPersona.respuesta_renap.data[0].VALIDACION === "NO_HIT") {
            closeAlert()
            error('No se encontraron datos en RENAP para el DPI ingresado')
            return
        }

        const vecindad = separarDepartamentoMunicipio(datosPersona.respuesta_renap.data[0].VECINDAD)

        form.value.cui = datosPersona.respuesta_renap.data[0].CUI || ''

        form.value.nombre1 = datosPersona.respuesta_renap.data[0].PRIMER_NOMBRE || ''
        form.value.nombre2 = datosPersona.respuesta_renap.data[0].SEGUNDO_NOMBRE || ''
        form.value.nombre3 = datosPersona.respuesta_renap.data[0].TERCER_NOMBRE || null

        form.value.apellido1 = datosPersona.respuesta_renap.data[0].PRIMER_APELLIDO || ''
        form.value.apellido2 = datosPersona.respuesta_renap.data[0].SEGUNDO_APELLIDO || ''
        form.value.apellido3 = datosPersona.respuesta_renap.data[0].APELLIDO_CASADA || null

        form.value.sexo = datosPersona.respuesta_renap.data[0].GENERO || ''
        form.value.fecha_nacimiento = datosPersona.respuesta_renap.data[0].FECHA_NACIMIENTO || ''
        form.value.fecha_defuncion = datosPersona.respuesta_renap.data[0].FECHA_DEFUNCION || null

        form.value.estado_civil_renap = traducirEstadoCivilRenap(datosPersona.respuesta_renap.data[0].ESTADO_CIVIL)

        form.value.id_estado_civil =
            obtenerIdEstadoCivilRenap(datosPersona.respuesta_renap.data[0].ESTADO_CIVIL)
            || form.value.id_estado_civil

        form.value.nacionalidad = datosPersona.respuesta_renap.data[0].NACIONALIDAD || ''
        form.value.pais_nacimiento = datosPersona.respuesta_renap.data[0].PAIS_NACIMIENTO || ''

        form.value.departamento_nacimiento_renap = datosPersona.respuesta_renap.data[0].DEPTO_NACIMIENTO || ''
        form.value.municipio_nacimiento_renap = datosPersona.respuesta_renap.data[0].MUNI_NACIMIENTO || ''

        form.value.vecindad = datosPersona.respuesta_renap.data[0].VECINDAD || ''

        form.value.orden_cedula = datosPersona.respuesta_renap.data[0].ORDEN_CEDULA || ''
        form.value.registro_cedula = datosPersona.respuesta_renap.data[0].REGISTRO_CEDULA || ''

        form.value.ocupacion = datosPersona.respuesta_renap.data[0].OCUPACION || ''

        form.value.fecha_vencimiento = datosPersona.respuesta_renap.data[0].FECHA_VENCIMIENTO || ''
        form.value.correlativo_documento = datosPersona.respuesta_renap.data[0].CORRELATIVO_DPI || ''

        form.value.consultado_renap = 'S'

        if (datosPersona.respuesta_renap.data[0].FOTO) {
            form.value.fotografia = obtenerFotoRenap(datosPersona.respuesta_renap.data[0].FOTO)

            if (form.value.enrolamientos?.[0]) {
                form.value.enrolamientos[0].imagen = datosPersona.respuesta_renap.data[0].FOTO
            }
        } else {
            form.value.fotografia = ''
        }

        

        closeAlert()
        success('Datos extraídos de RENAP correctamente')
    } catch (err) {
        closeAlert()
        console.error('Error al consultar RENAP:', err)

        const mensaje =
            err?.response?.data?.mensaje
            || err?.response?.data?.message
            || 'No se pudo consultar RENAP'

        error(mensaje)
    } finally {
        consultandoRenap.value = false
    }
}

const limpiarConsultaRenap = () => {
    form.value.numero_documento = ''
    form.value.nombre1 = ''
    form.value.nombre2 = ''
    form.value.nombre3 = null
    form.value.apellido1 = ''
    form.value.apellido2 = ''
    form.value.apellido3 = null
    form.value.sexo = ''
    form.value.fecha_nacimiento = ''
    form.value.fecha_defuncion = null
    form.value.id_estado_civil = null
    form.value.id_departamento_nacimiento = null
    form.value.id_municipio_nacimiento = null
    form.value.id_departamento_vecindad = null
    form.value.id_municipio_vecindad = null
    form.value.id_departamento_residencia = null
    form.value.id_municipio_residencia = null
    form.value.id_departamento_votacion = null
    form.value.id_municipio_votacion = null
    form.value.fecha_vencimiento = ''
    form.value.correlativo_documento = ''
    form.value.consultado_renap = 'N'
    form.value.fotografia = ''
    form.value.enrolamientos = [
        {
            imagen: ''
        }
    ]

    respuestaRenapVista.value = null
    dialogResultadoRenap.value = false
    mensajeDocumento.value = ''
    documentoValido.value = false

    localStorage.removeItem('renap_response')
}

const separarDepartamentoMunicipio = valor => {
    if (!valor) {
        return {
            departamento: '',
            municipio: ''
        }
    }

    const partes = String(valor)
        .split(',')
        .map(x => x.trim())

    return {
        departamento: partes[0] || '',
        municipio: partes[1] || ''
    }
}

const obtenerIdEstadoCivilRenap = estado => {
    const estados = {
        S: 'SOLTERO',
        C: 'CASADO',
        D: 'DIVORCIADO',
        V: 'VIUDO',
        U: 'UNION LIBRE'
    }

    const nombreEstado = estados[estado]

    if (!nombreEstado) return null

    const encontrado = catalogos.value.estadosCiviles?.find(item =>
        normalizarTexto(item.nombre) === normalizarTexto(nombreEstado)
    )

    return encontrado?.id || null
}

const obtenerIdPorNombre = (lista, nombre) => {
    if (!Array.isArray(lista) || !nombre) return null

    const encontrado = lista.find(item =>
        normalizarTexto(item.nombre) === normalizarTexto(nombre)
    )

    return encontrado?.id || null
}

const normalizarTexto = texto => {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase()
}

const nombreCompletoRenap = persona => {
    return [
        persona.PRIMER_NOMBRE,
        persona.SEGUNDO_NOMBRE,
        persona.TERCER_NOMBRE,
        persona.PRIMER_APELLIDO,
        persona.SEGUNDO_APELLIDO,
        persona.APELLIDO_CASADA
    ]
        .filter(Boolean)
        .join(' ')
}

const traducirGeneroRenap = genero => {
    const generos = {
        M: 'Masculino',
        F: 'Femenino'
    }

    return generos[genero] || 'N/A'
}

const traducirEstadoCivilRenap = estado => {
    const estados = {
        S: 'Soltero',
        C: 'Casado',
        D: 'Divorciado',
        V: 'Viudo',
        U: 'Unión libre'
    }

    return estados[estado] || 'N/A'
}

const obtenerFotoRenap = foto => {
    if (!foto) return ''

    if (foto.startsWith('data:image')) {
        return foto
    }

    return `data:image/jpeg;base64,${foto}`
}
</script>