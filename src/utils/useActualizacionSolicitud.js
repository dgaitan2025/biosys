import { ref, toRaw } from 'vue'
import { httpsol } from '../api/nodohttp'
import { endpoints } from '../api/endpoints'
import { useAuthStore } from '../stores/auth'
import { alertLoading, closeAlert, useAlert } from '../utils/useAlert'
import {
    validarDocumento,
    validarNumeroDocumento,
    validarCorreo,
    validarTelefono,
    formatearTelefono
} from '../utils/validacionesformulario'

export function useActualizacionSolicitud(idTipoSolicitud) {
    const authStore = useAuthStore()
    const { success, error } = useAlert()

    const formRef = ref(null)
    const dpiBusqueda = ref('')
    const buscandoPersona = ref(false)
    const personaEncontrada = ref(false)
    const mensajeBusqueda = ref('')

    const getInitialFormActualizacion = () => ({
        id: 0,
        id_tipo_solicitud: idTipoSolicitud.value,
        numero_documento: '',
        telefono: '',
        correo: '',
        id_departamento_residencia: null,
        id_municipio_residencia: null,
        id_localizacion: null,
        direccion_residencia: '',
        id_tipo_entrega: null,
        id_departamento_entrega: null,
        id_municipio_entrega: null,
        direccion_entrega: '',
        id_centro_entrega: null,
        empadronado: 0,
        empadronamiento: '',
        id_departamento_votacion: null,
        id_municipio_votacion: null,
        id_centro_votacion: null,
        enrolado: 0,
        huella: null,
        fotografia: null,
        enrolamientos: [],
        observaciones: ''
    })

    const form = ref(getInitialFormActualizacion())

    const buscarPersonaPorDpi = async () => {
        mensajeBusqueda.value = ''
        personaEncontrada.value = false

        const resultado = validarDocumento(dpiBusqueda.value)

        if (!resultado.valido) {
            mensajeBusqueda.value = resultado.mensaje || 'Ingrese un DPI válido.'
            return
        }

        try {
            buscandoPersona.value = true

            const response = await httpsol.get(
                `${endpoints.solicitudes.buscarPorDpi}/${dpiBusqueda.value}`
            )

            const persona = response.data?.data

            if (!persona) {
                mensajeBusqueda.value = 'No se encontró una persona con el DPI ingresado.'
                personaEncontrada.value = false
                return
            }

            form.value = {
                ...getInitialFormActualizacion(),
                ...persona,
                id_tipo_solicitud: idTipoSolicitud.value,
                numero_documento: dpiBusqueda.value
            }

            personaEncontrada.value = true
            mensajeBusqueda.value = 'Persona encontrada. Puede actualizar los datos permitidos.'
        } catch (err) {
            console.error('Error al buscar persona:', err)
            mensajeBusqueda.value = 'Ocurrió un error al buscar la persona.'
        } finally {
            buscandoPersona.value = false
        }
    }

    const guardarActualizacion = async () => {
        try {
            const validacion = await formRef.value?.validate()

            if (validacion && !validacion.valid) {
                error('Revise los campos obligatorios.')
                return
            }

            alertLoading('Actualizando', 'Guardando datos modificados...')

            const payload = {
                id: form.value.id,
                id_tipo_solicitud: idTipoSolicitud.value,
                numero_documento: form.value.numero_documento,

                telefono: form.value.telefono,
                correo: form.value.correo,

                id_departamento_residencia: form.value.id_departamento_residencia,
                id_municipio_residencia: form.value.id_municipio_residencia,
                id_localizacion: form.value.id_localizacion,
                direccion_residencia: form.value.direccion_residencia,

                id_tipo_entrega: form.value.id_tipo_entrega,
                id_departamento_entrega: form.value.id_departamento_entrega,
                id_municipio_entrega: form.value.id_municipio_entrega,
                direccion_entrega: form.value.direccion_entrega,
                id_centro_entrega: form.value.id_centro_entrega,

                empadronado: form.value.empadronado,
                empadronamiento: form.value.empadronamiento,
                id_departamento_votacion: form.value.id_departamento_votacion,
                id_municipio_votacion: form.value.id_municipio_votacion,
                id_centro_votacion: form.value.id_centro_votacion,

                enrolado: form.value.enrolado,
                enrolamientos: toRaw(form.value.enrolamientos),

                observaciones: form.value.observaciones,
                usuarioAct: authStore.user
            }

            const response = await httpsol.put(
                `${endpoints.solicitudes.actualizar}/${form.value.id}`,
                payload
            )

            closeAlert()
            success('Actualización guardada correctamente.')

            console.log('Respuesta actualización:', response.data)
        } catch (err) {
            closeAlert()
            console.error('Error al guardar actualización:', err)
            error('No se pudo guardar la actualización.')
        }
    }

    const resetActualizacion = () => {
        form.value = getInitialFormActualizacion()
        dpiBusqueda.value = ''
        personaEncontrada.value = false
        mensajeBusqueda.value = ''
    }

    return {
        formRef,
        form,
        dpiBusqueda,
        buscandoPersona,
        personaEncontrada,
        mensajeBusqueda,

        validarNumeroDocumento,
        validarCorreo,
        validarTelefono,
        formatearTelefono,

        buscarPersonaPorDpi,
        guardarActualizacion,
        resetActualizacion
    }
}