<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app width="350">

      <v-sheet class="pa-2 text-center" color="primary" dark>

        <div class="text-h6 font-weight-bold">BioSys</div>
        <div class="text-caption">Menú principal</div>
      </v-sheet>

      <v-list density="comfortable" nav>
        <MenuItem v-for="modulo in modulos" :key="modulo.id" :item="modulo" />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat color="white" elevation="1" height="80">
      <div class="d-flex align-center w-100">
        <!-- izquierda -->
        <v-app-bar-nav-icon @click="drawer = !drawer" />

        <!-- centro -->
        <div class="flex-grow-1 ml-2">
          <div class="font-weight-bold text-primary">
            {{ saludo }}

          </div>
          <div class="text-caption text-medium-emphasis">
            Registro y afiliación a partidos políticos
          </div>
        </div>

        <!-- derecha AVATAR-->
        <v-menu min-width="200px" class="mr-4">
          <template v-slot:activator="{ props }" class="mr-4">
            <v-btn icon v-bind="props" class="mr-4">
              <v-avatar size="44" >
                <v-img src="https://cdn.vuetifyjs.com/images/john.jpg" />
              </v-avatar>
            </v-btn>
          </template>
          <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              
              <h3 class="my-0">{{ user.fullName }}</h3>
              <p class="text-body-small mt-1">{{ user.rol }}</p>
              <v-divider class="my-3"></v-divider>
              <v-btn variant="text" rounded> Editar cuenta </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn variant="text" rounded @click="authStore.logout()"> Desconectar </v-btn>
            </div>
          </v-card-text>
        </v-card>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>


import { ref, onMounted } from 'vue'
import MenuItem from '../../components/MenuItem.vue'
import http from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useSaludo } from '../../utils/complemento'
import { useAuthStore } from '../../stores/auth'


const { saludo } = useSaludo()
const authStore = useAuthStore()

  const user = {
    
    fullName: authStore.user,
    rol: authStore.rol,
  }

  const cerrarSesion = () => {
  authStore.logout()
  router.push('/login') // ajusta la ruta
}

const drawer = ref(true)
const modulos = ref([])

const normalizarMenu = (items) => {
  if (!Array.isArray(items)) return []

  return items.map(item => ({
    ...item,
    title: item.title || item.short_name || 'Sin nombre',
    icon: item.icon || 'mdi-menu',
    children: item.children ? normalizarMenu(item.children) : []
  }))
}

const cargarMenu = async () => {
  try {
    const response = await http.get(endpoints.auth.perfil)
    modulos.value = normalizarMenu(response.data?.data || [])
    console.log('Menú:', modulos.value)
  } catch (error) {
    console.error('Error al cargar menú:', error)
  }
}

onMounted(() => {
  cargarMenu()
})
</script>