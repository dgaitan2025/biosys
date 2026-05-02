<template>
  <v-app class="bg-white">
    <v-navigation-drawer v-model="drawer" temporary width="350">
      <v-sheet class="pa-2 text-center" color="rgba(17, 148, 241, 0.45)" dark height="80">
        <div class="text-h6 font-weight-bold">BioSys</div>
        <div class="text-caption">Menú principal</div>
      </v-sheet>

      <v-sheet class="pa-2 d-flex align-center ga-2 px-6">
        <v-text-field v-model="busqueda" label="Buscar" prepend-inner-icon="mdi-magnify" color="primary"
          variant="outlined" density="comfortable" bg-color="white" hide-details clearable class="flex-grow-1"
          @click:clear="busqueda = ''" />

        <v-btn icon size="small" variant="tonal" color="primary" @click="opened.length ? cerrarTodo() : abrirTodo()">
          <v-icon>
            {{ opened.length ? 'mdi-arrow-collapse' : 'mdi-arrow-expand' }}
          </v-icon>
        </v-btn>
      </v-sheet>

      <v-list density="comfortable" nav v-model:opened="opened">
        <MenuItem v-for="modulo in modulosFiltrados" :key="modulo.id" :item="modulo" :opened="opened" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat color="grey-lighten-5" elevation="1" height="80">
      <div class="d-flex align-center w-100">
        <v-app-bar-nav-icon @click="drawer = !drawer" />

        <div class="flex-grow-1 ml-2">
          <div class="font-weight-bold text-primary">
            {{ saludo }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Registro y afiliación a partidos políticos
          </div>
        </div>

        <v-menu min-width="200px" class="mr-4">
          <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mr-4">
              <v-avatar size="50">
                <v-img :src="imagenUsuario" />
              </v-avatar>
            </v-btn>
          </template>

          <v-card>
            <v-card-text>
              <div class="mx-auto text-center">
                <h3 class="my-0">{{ user.fullName }}</h3>
                <p class="text-body-small mt-1">{{ user.rol }}</p>
                <v-divider class="my-3"></v-divider>
                <v-btn variant="text" rounded>Editar cuenta</v-btn>
                <v-divider class="my-3"></v-divider>
                <v-btn variant="text" rounded @click="authStore.logout()">
                  Desconectar
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <router-view :busqueda="busqueda" :historial="historial" :items-actuales="itemsActuales"
        :titulo-nivel-actual="tituloNivelActual" :seleccionar-item="seleccionarItem" :volver-nivel="volverNivel"
        :volver-inicio="volverInicio" :descripcion-item="descripcionItem" />
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import MenuItem from '../../components/MenuItem.vue'
import { useSaludo } from '../../utils/complemento'
import { useAuthStore } from '../../stores/auth'
import { useMenu } from '../../components/menu'

const { saludo } = useSaludo()
const authStore = useAuthStore()
const drawer = ref(false)
const opened = ref([])

const user = computed(() => (
  {
    fullName: authStore.user,
    rol: authStore.rol,
    foto: authStore.fotografia
  }))

  const imagenDefault = ref('/logo.png')

const imagenUsuario = computed(() => {
  return user.value.foto
    ? `data:image/png;base64,${user.value.foto}`
    : imagenDefault.value
})


const {
  modulos,
  busqueda,
  historial,
  itemsActuales,
  tituloNivelActual,
  itemsFiltrados,
  seleccionarItem,
  volverNivel,
  volverInicio,
  descripcionItem,
  inicializarMenu
} = useMenu()

onMounted(() => {
  inicializarMenu()
})

const modulosFiltrados = computed(() => itemsFiltrados.value)
</script>