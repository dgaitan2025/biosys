<template>
  <div class="contenedor">
    <h2>Registro y verificación local de huella</h2>

    <p v-if="error" class="error">{{ error }}</p>
    <p>Procesando: {{ isCapturing ? 'Sí' : 'No' }}</p>

    <div class="acciones">
      <button @click="registrarHuella" :disabled="isCapturing">
        Registrar huella
      </button>


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
import { ref } from 'vue'
import { httpshuella } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'

const emit = defineEmits(['huellaCapturada'])

const error = ref(null)
const mensaje = ref('')
const isCapturing = ref(false)
const resultadoVerificacion = ref(null)

async function registrarHuella() {
  try {
    error.value = null
    mensaje.value = 'Coloque el dedo en el lector.'
    resultadoVerificacion.value = null
    isCapturing.value = true
    let fingerprints = []

    const response = await httpshuella.get(endpoints.biometriahuella.enrolar)

    console.log('Respuesta completa:', response)

    const data = response.data

    if (!data.success) {
      throw new Error(data.error || data.message || 'No se pudo enrolar la huella.')
    }

    fingerprints = data.fingerprints || []

    if (fingerprints.length === 0) {
      throw new Error('No se recibió ninguna huella del lector.')
    }

    emit('huellaCapturada', fingerprints)

    mensaje.value = `Se enrolaron ${fingerprints.length} huellas correctamente.`
  } catch (e) {
    console.error('Error completo:', e)

    error.value =
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.message ||
      'Error al registrar la huella.'
  } finally {
    isCapturing.value = false
  }
}

async function verificarHuella() {
  try {
    error.value = null
    mensaje.value = 'Coloque el dedo en el lector.'
    resultadoVerificacion.value = null
    isCapturing.value = true

    const templateBase64 = localStorage.getItem(STORAGE_KEY)

    if (!templateBase64) {
      throw new Error('No hay template registrado.')
    }

    const response = await fetch(`${API_BIOMETRIA_URL}/verificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        templateBase64
      })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'No se pudo verificar la huella.')
    }

    resultadoVerificacion.value = data.coincide

    mensaje.value = data.coincide
      ? 'La huella coincide.'
      : 'La huella no coincide.'
  } catch (e) {
    console.error(e)
    error.value = e.message || 'Error al verificar la huella.'
    resultadoVerificacion.value = false
  } finally {
    isCapturing.value = false
  }
}

function limpiarHuella() {
  localStorage.removeItem(STORAGE_KEY)
  resultadoVerificacion.value = null
  mensaje.value = 'Huella eliminada.'
  error.value = null
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
}
</style>