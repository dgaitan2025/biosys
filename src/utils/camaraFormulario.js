// src/utils/camaraFormulario.js

export const listarCamaras = async ({
    camarasDisponibles,
    camaraSeleccionada
}) => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    })

    stream.getTracks().forEach(track => track.stop())

    const dispositivos = await navigator.mediaDevices.enumerateDevices()

    camarasDisponibles.value = dispositivos
        .filter(dispositivo => dispositivo.kind === 'videoinput')
        .map((dispositivo, index) => ({
            id: dispositivo.deviceId,
            nombre: dispositivo.label || `Cámara ${index + 1}`
        }))

    if (camarasDisponibles.value.length > 0 && !camaraSeleccionada.value) {
        camaraSeleccionada.value = camarasDisponibles.value[0].id
    }
}

export const cerrarStreamCamara = ({ streamCamara }) => {
    if (streamCamara.value) {
        streamCamara.value.getTracks().forEach(track => track.stop())
        streamCamara.value = null
    }
}

export const iniciarCamaraSeleccionada = async ({
    camaraSeleccionada,
    streamCamara,
    videoRef
}) => {
    cerrarStreamCamara({ streamCamara })

    const constraints = {
        video: camaraSeleccionada.value
            ? { deviceId: { exact: camaraSeleccionada.value } }
            : true,
        audio: false
    }

    streamCamara.value = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoRef.value) {
        videoRef.value.srcObject = streamCamara.value
    }
}

export const abrirCamara = async ({
    dialogCamara,
    camarasDisponibles,
    camaraSeleccionada,
    streamCamara,
    videoRef
}) => {
    dialogCamara.value = true

    if (camarasDisponibles.value.length === 0) {
        await listarCamaras({
            camarasDisponibles,
            camaraSeleccionada
        })
    }

    await iniciarCamaraSeleccionada({
        camaraSeleccionada,
        streamCamara,
        videoRef
    })
}

export const cambiarCamara = async ({
    dialogCamara,
    camaraSeleccionada,
    streamCamara,
    videoRef
}) => {
    if (!dialogCamara.value) return

    await iniciarCamaraSeleccionada({
        camaraSeleccionada,
        streamCamara,
        videoRef
    })
}

export const tomarFoto = ({
    videoRef,
    canvasRef,
    form,
    campo = 'fotografia'
}) => {
    const video = videoRef.value
    const canvas = canvasRef.value

    if (!video || !canvas) {
        throw new Error('No se pudo capturar la fotografía')
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imagenBase64 = canvas.toDataURL('image/jpeg', 0.9)
    form.value.enrolamientos[0].imagen = imagenBase64

    form.value[campo] = imagenBase64

    return imagenBase64
}

export const cerrarCamara = ({
    streamCamara,
    dialogCamara
}) => {
    cerrarStreamCamara({ streamCamara })
    dialogCamara.value = false
}

export const eliminarFotografia = ({
    form,
    campo = 'fotografia'
}) => {
    form.value[campo] = null
}