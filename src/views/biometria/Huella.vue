<template>
  <div class="contenedor">
    <h2>Registro y verificación local de huella</h2>
    <!-- COMENTARIO-->

    <p v-if="error" class="error">{{ error }}</p>
    <p>Dispositivo conectado: {{ deviceConnected ? 'Sí' : 'No' }}</p>
    <p>Capturando: {{ isCapturing ? 'Sí' : 'No' }}</p>
    <!--<p v-if="deviceId">DeviceId: {{ deviceId }}</p> -->

    <div class="acciones">
      <button @click="registrarHuella" :disabled="!deviceConnected || isCapturing">
        Registrar huella
      </button>

      <!--<button @click="verificarHuella" :disabled="!deviceConnected || isCapturing">
        Verificar huella
      </button>-->

      <button v-if="isCapturing" @click="stopCapture">
        Cancelar
      </button>

      <!--<button @click="limpiarHuella">
        Limpiar huella guardada
      </button>-->

      
    </div>

    <p v-if="modoActual"><strong>Modo:</strong> {{ modoActual }}</p>

    <div v-if="modoActual === 'registro'" class="estado">
      <p><strong>Muestras capturadas:</strong> {{ muestrasRegistro.length }} / {{ TOTAL_MUESTRAS }}</p>
      <p v-if="muestrasRegistro.length < TOTAL_MUESTRAS">
        Coloque el mismo dedo nuevamente para continuar el enrolamiento.
      </p>
    </div>

    <div v-if="sampleData" class="ok">
      Huella capturada correctamente
    </div>

    <div v-if="resultadoVerificacion !== null" class="resultado">
      <strong>Resultado:</strong>
      <span :class="resultadoVerificacion ? 'ok-text' : 'error-text'">
        {{ resultadoVerificacion ? 'La huella coincide' : 'La huella no coincide' }}
      </span>
    </div>

    <div v-if="mensaje" class="ok">
      {{ mensaje }}
    </div>
  </div>


</template>



<script setup>
import { ref, onMounted, onUnmounted } from 'vue'


const error = ref(null)
const mensaje = ref('')
const deviceConnected = ref(false)
const isCapturing = ref(false)
const sampleData = ref(null)
const deviceId = ref(null)
const modoActual = ref('')
const resultadoVerificacion = ref(null)
const emit = defineEmits(['huellaCapturada'])


const TOTAL_MUESTRAS = 3
const STORAGE_KEY = 'huella_demo_multi'

const muestrasRegistro = ref([])

let reader = null
let SampleFormat = null



onMounted(async () => {
  try {
    const dpDevices = window.dp?.devices

    if (!dpDevices) {
      error.value = 'No se cargó dp.devices. Revisa index.html y los archivos en public.'
      return
    }

    const FingerprintReader = dpDevices.FingerprintReader
    SampleFormat = dpDevices.SampleFormat

    reader = new FingerprintReader()

    reader.on('DeviceConnected', (event) => {
      console.log('DeviceConnected', event)
      deviceConnected.value = true
      deviceId.value = event?.deviceId || deviceId.value
      error.value = null
    })

    reader.on('DeviceDisconnected', (event) => {
      console.log('DeviceDisconnected', event)
      if (event?.deviceId === deviceId.value || !event?.deviceId) {
        deviceConnected.value = false
        deviceId.value = null
      }
      isCapturing.value = false
    })

    reader.on('QualityReported', (event) => {
      console.log('QualityReported', event)
    })

    reader.on('SamplesAcquired', async (event) => {
      console.log('SamplesAcquired', event)

      sampleData.value = event.samples
      error.value = null

      if (modoActual.value === 'registro') {
        await manejarRegistro(event.samples)
      } else if (modoActual.value === 'verificacion') {
        await manejarVerificacion(event.samples)
        await stopCapture()
      }
    })

    reader.on('ErrorOccurred', (event) => {
      console.log('ErrorOccurred', event)
      isCapturing.value = false
      error.value = event?.error?.message || 'Error al capturar'
    })

    const devices = await reader.enumerateDevices()
    console.log('Dispositivos detectados:', devices)

    if (devices && devices.length > 0) {
      deviceConnected.value = true
      deviceId.value = devices[0]
      error.value = null
    } else {
      deviceConnected.value = false
      error.value = 'No se encontró ningún lector conectado.'
    }
  } catch (e) {
    console.error(e)
    error.value = e.message || 'No se pudo inicializar el lector'
  }
})

async function manejarRegistro(samples) {
  const muestraNormalizada = JSON.stringify(samples)
  muestrasRegistro.value.push(muestraNormalizada)

  await stopCapture()

  if (muestrasRegistro.value.length < TOTAL_MUESTRAS) {
    mensaje.value = `Muestra ${muestrasRegistro.value.length} capturada. Coloque el mismo dedo nuevamente.`

    setTimeout(async () => {
      if (modoActual.value === 'registro') {
        await iniciarCaptura('registro')
      }
    }, 800)

    return
  }

  const payloadRegistro = {
    totalMuestras: TOTAL_MUESTRAS,
    muestras: [...muestrasRegistro.value],
    fechaRegistro: new Date().toISOString()
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadRegistro))

  const huellaBase64 = convertirJsonABase64(payloadRegistro)

  emit('huellaCapturada', huellaBase64)

  resultadoVerificacion.value = null
  mensaje.value = 'Enrolamiento completado correctamente con 3 muestras.'
  muestrasRegistro.value = []
  modoActual.value = ''
}

async function manejarVerificacion(samples) {
  const guardada = localStorage.getItem(STORAGE_KEY)

  if (!guardada) {
    error.value = 'No hay huella registrada en localStorage.'
    resultadoVerificacion.value = false
    return
  }

  const registro = JSON.parse(guardada)
  const actual = JSON.stringify(samples)

  const coincideExactamente = registro.muestras?.includes(actual) || false

  resultadoVerificacion.value = coincideExactamente

  if (coincideExactamente) {
    mensaje.value = 'La muestra coincide con una de las capturadas en el enrolamiento.'
  } else {
    mensaje.value = 'No hubo coincidencia exacta. Para verificación real necesitas un motor biométrico.'
  }
}

async function iniciarCaptura(modo) {
  try {
    if (!reader || !SampleFormat) {
      error.value = 'El lector no está inicializado.'
      return
    }

    if (!deviceId.value) {
      error.value = 'No hay un dispositivo disponible.'
      return
    }

    modoActual.value = modo
    error.value = null
    sampleData.value = null

    if (modo === 'registro' && muestrasRegistro.value.length === 0) {
      resultadoVerificacion.value = null
      mensaje.value = 'Iniciando enrolamiento. Capture 3 veces el mismo dedo.'
    }

    if (modo === 'verificacion') {
      resultadoVerificacion.value = null
      mensaje.value = 'Coloque el dedo para verificar.'
    }

    isCapturing.value = true

    await reader.startAcquisition(
      SampleFormat.Intermediate,
      deviceId.value
    )

    console.log('Captura iniciada en:', deviceId.value, 'modo:', modo)
  } catch (e) {
    console.error(e)
    isCapturing.value = false
    error.value = e.message || 'No se pudo iniciar la captura'
  }
}

function registrarHuella() {
  muestrasRegistro.value = []
  resultadoVerificacion.value = null
  iniciarCaptura('registro')
}

function verificarHuella() {
  iniciarCaptura('verificacion')
}

async function stopCapture() {
  try {
    if (reader) {
      await reader.stopAcquisition()
    }
  } catch (e) {
    console.error('Error al detener captura:', e)
  } finally {
    isCapturing.value = false
  }
}

function limpiarHuella() {
  localStorage.removeItem(STORAGE_KEY)
  muestrasRegistro.value = []
  sampleData.value = null
  resultadoVerificacion.value = null
  modoActual.value = ''
  mensaje.value = ''
  error.value = null
  alert('Huella eliminada del localStorage')
}

onUnmounted(() => {
  reader?.off?.()
})

const convertirJsonABase64 = (data) => {
  const json = JSON.stringify(data)
  return btoa(unescape(encodeURIComponent(json)))
}


</script>

<style scoped>
.contenedor {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.acciones {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 14px 0;
}

button {
  padding: 10px 14px;
}

.error {
  color: red;
}

.ok {
  margin-top: 12px;
  color: green;
  font-weight: bold;
}

.resultado {
  margin-top: 12px;
  font-size: 16px;
}

.ok-text {
  color: green;
  font-weight: bold;
}

.error-text {
  color: red;
  font-weight: bold;
}

.estado {
  margin-top: 12px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 8px;
}
</style>