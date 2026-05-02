<template>
  <v-container fluid class="pa-6">
    <!-- Encabezado -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="8">
        <h2 class="text-h5 font-weight-bold">
          Resumen de Solicitudes
        </h2>
        <p class="text-body-2 text-grey-darken-1">
          Visualización general de solicitudes creadas, aprobadas y rechazadas.
        </p>
      </v-col>

      <v-col cols="12" md="4" class="text-md-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-home"
          @click="volverInicio"
        >
          Inicio
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loader -->
    <v-row v-if="cargando">
      <v-col cols="12" class="text-center py-10">
        <v-progress-circular
          indeterminate
          color="primary"
          size="50"
        />
        <p class="mt-3">Cargando resumen...</p>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Tarjetas resumen -->
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card class="pa-4 text-white" color="blue" rounded="lg" elevation="3">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1">Solicitudes creadas</div>
                <div class="text-h4 font-weight-bold">
                  {{ resumenSolicitudes.total_Creadas }}
                </div>
              </div>

              <v-icon size="42">
                mdi-file-document-plus
              </v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 text-white" color="green" rounded="lg" elevation="3">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1">Solicitudes aprobadas</div>
                <div class="text-h4 font-weight-bold">
                  {{ resumenSolicitudes.total_Aprobadas }}
                </div>
              </div>

              <v-icon size="42">
                mdi-check-circle
              </v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 text-white" color="red" rounded="lg" elevation="3">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1">Solicitudes rechazadas</div>
                <div class="text-h4 font-weight-bold">
                  {{ resumenSolicitudes.total_Rechazadas }}
                </div>
              </div>

              <v-icon size="42">
                mdi-close-circle
              </v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráfico -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-4" rounded="lg" elevation="3">
            <v-card-title class="text-h6 font-weight-bold">
              Gráfico de solicitudes
            </v-card-title>

            <v-card-text>
              <div style="height: 330px;">
                <Doughnut
                  :data="chartData"
                  :options="chartOptions"
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4" rounded="lg" elevation="3">
            <v-card-title class="text-h6 font-weight-bold">
              Detalle del resumen
            </v-card-title>

            <v-card-text>
              <v-table>
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Creadas</td>
                    <td class="text-right">
                      {{ resumenSolicitudes.total_Creadas }}
                    </td>
                  </tr>

                  <tr>
                    <td>Aprobadas</td>
                    <td class="text-right">
                      {{ resumenSolicitudes.total_Aprobadas }}
                    </td>
                  </tr>

                  <tr>
                    <td>Rechazadas</td>
                    <td class="text-right">
                      {{ resumenSolicitudes.total_Rechazadas }}
                    </td>
                  </tr>

                  <tr>
                    <td class="font-weight-bold">Total general</td>
                    <td class="text-right font-weight-bold">
                      {{ totalGeneral }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { httpcat, httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useRouter } from 'vue-router'
import { Doughnut } from 'vue-chartjs'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'

// Si usas tu instancia personalizada de axios, importa la tuya.
// Ejemplo:
// import httpsol from '@/services/httpsol'
// import endpoints from '@/services/endpoints'

import axios from 'axios'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

const router = useRouter()

const cargando = ref(false)

const resumenSolicitudes = ref({
  total_Creadas: 0,
  total_Aprobadas: 0,
  total_Rechazadas: 0
})

const totalGeneral = computed(() => {
  return (
    Number(resumenSolicitudes.value.total_Creadas || 0) +
    Number(resumenSolicitudes.value.total_Aprobadas || 0) +
    Number(resumenSolicitudes.value.total_Rechazadas || 0)
  )
})

const chartData = computed(() => ({
  labels: [
    'Creadas',
    'Aprobadas',
    'Rechazadas'
  ],
  datasets: [
    {
      label: 'Solicitudes',
      data: [
        Number(resumenSolicitudes.value.total_Creadas || 0),
        Number(resumenSolicitudes.value.total_Aprobadas || 0),
        Number(resumenSolicitudes.value.total_Rechazadas || 0)
      ],
      backgroundColor: [
        '#2196F3',
        '#4CAF50',
        '#F44336'
      ],
      borderWidth: 2
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label || ''
          const value = context.raw || 0
          return `${label}: ${value}`
        }
      }
    }
  }
}

async function consultarResumenSolicitudes() {
  try {
    cargando.value = true

    // Cambia esta URL por tu endpoint real
    const response = await httpsol.get(
      endpoints.solicitudes.resumen
    )

    console.log('Resumen solicitudes:', response.data)

    if (
      response.data.resultado === 200 &&
      response.data.data &&
      response.data.data.length > 0
    ) {
      resumenSolicitudes.value = {
        total_Creadas: response.data.data[0].total_Creadas || 0,
        total_Aprobadas: response.data.data[0].total_Aprobadas || 0,
        total_Rechazadas: response.data.data[0].total_Rechazadas || 0
      }
    }
  } catch (error) {
    console.error('Error al consultar resumen de solicitudes:', error)
  } finally {
    cargando.value = false
  }
}

function volverInicio() {
  router.push('/usuarios')
}

onMounted(() => {
  consultarResumenSolicitudes()
})
</script>