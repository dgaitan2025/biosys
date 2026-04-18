<template>
    <v-container fluid class="pa-4">
        <div class="d-flex align-center justify-space-between mb-4">
            <div>

                <div class="text-h5 font-weight-bold text-primary">
                    <v-btn icon variant="tonal" color="primary" @click="volverInicio">
                        <v-icon>mdi-home</v-icon>
                    </v-btn>
                    {{ tituloNivelActual }}
                </div>

            </div>


                    <v-btn v-if="historial.length" icon variant="tonal" color="primary" @click="volverNivel">
                <v-icon>mdi-chevron-left</v-icon>
            </v-btn>


        </div>

        <v-row density="comfortable">
            <v-col v-for="item in itemsActuales" :key="item.id" cols="12" sm="6" md="4" lg="3">
                <v-card class="h-100 cursor-pointer" rounded="xl" elevation="2" hover @click="seleccionarItem(item)">
                    <!-- ICONO + TITULO CENTRADO -->

                    <v-card-text class="d-flex flex-column align-center justify-center py-6">

                        <v-avatar size="70" color="primary" variant="tonal" class="mb-3">
                            <v-icon size="34">{{ item.icon }}</v-icon>
                        </v-avatar>
                        <div class="font-weight-bold text-subtitle-1 text-center">
                            {{ item.title }}
                        </div>

                        <div class="text-caption text-medium-emphasis text-center">
                            {{ descripcionItem(item) }}
                        </div>
                    </v-card-text>

                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
defineProps({
  historial: {
    type: Array,
    default: () => []
  },
  itemsActuales: {
    type: Array,
    default: () => []
  },
  tituloNivelActual: {
    type: String,
    default: 'Módulos'
  },
  seleccionarItem: {
    type: Function,
    required: true
  },
  volverNivel: {
    type: Function,
    required: true
  },
  volverInicio: {
    type: Function,
    required: true
  },
  descripcionItem: {
    type: Function,
    required: true
  }
})
</script>