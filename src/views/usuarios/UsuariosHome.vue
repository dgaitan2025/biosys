<template>
  <v-container fluid class="pa-4">
    <v-text-field
      v-model="busqueda"
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      color="primary"
      variant="outlined"
      density="comfortable"
      clearable
      class="mb-4"
    />

    <MenuCards
      :historial="historial"
      :itemsActuales="itemsActuales"
      :tituloNivelActual="tituloNivelActual"
      :seleccionarItem="seleccionarItem"
      :volverNivel="volverNivel"
      :volverInicio="volverInicio"
      :descripcionItem="descripcionItem"
    />
  </v-container>
</template>

<script setup>
import MenuCards from '../../components/menucard.vue'
import { useMenu } from '../../components/menu'

const {
  busqueda,
  historial,
  itemsActuales,
  tituloNivelActual,
  seleccionarItem,
  volverNivel,
  volverInicio,
  descripcionItem
} = useMenu()
</script>