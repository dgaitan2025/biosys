<template>
  <v-container fluid class="pa-4">
    <!-- BOTÓN AGREGAR -->
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="abrirAgregar">
        <v-icon start>mdi-plus</v-icon>
        Agregar
      </v-btn>
    </div>

    <!-- GRID DE CARDS -->
    <v-row>
      <v-col v-for="item in items" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <v-card rounded="xl" elevation="2" class="pa-3 h-100">
          <v-card-title class="text-h6 font-weight-bold">
            {{ item.nombre }}
          </v-card-title>

          <v-card-text>
            <div class="mb-2">
              <strong>Código:</strong> {{ item.codigo }}
            </div>

            <div class="mb-2">
              <strong>Descripción:</strong>
              {{ item.descripcion || 'Sin descripción' }}
            </div>

            <div class="mb-2">
              <strong>Observaciones:</strong>
              {{ item.observaciones || 'Sin observaciones' }}
            </div>

            <div>
              <strong>Estado:</strong>
              <v-chip size="small" :color="item.activo === 1 ? 'success' : 'error'" variant="flat">
                {{ item.activo === 1 ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </div>
          </v-card-text>

          <v-card-actions class="justify-end">
            <v-btn icon color="warning" @click="abrirEditar(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>

            <v-btn v-if="item.activo === 1" icon color="error" @click="eliminar(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- MODAL FORMULARIO -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>{{ modo === 'agregar' ? 'Agregar' : 'Editar' }}</span>

          <v-btn icon @click="cerrar">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="form.codigo" label="Código" />
          <v-text-field v-model="form.nombre" label="Nombre" />
          <v-text-field v-model="form.descripcion" label="Descripción" />
          <v-text-field v-model="form.observaciones" label="Observaciones" />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn color="grey" @click="cerrar">Cancelar</v-btn>
          <v-btn color="primary" @click="guardar">
            {{ modo === 'agregar' ? 'Guardar' : 'Actualizar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

import { httpcat } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { useAuthStore } from '../../stores/auth'

const dialog = ref(false)
const modo = ref('agregar')
const items = ref([])
const authStore = useAuthStore()

const form = ref({
  id: 0,
  codigo: '',
  nombre: '',
  descripcion: '',
  observaciones: '',
  usuarioIng: authStore.user
})


// Cargar listado desde API
const obtenerDatos = async () => {
  try {
    const response = await httpcat.get(endpoints.catalogos.departametos)
    items.value = response.data
    console.log('Datos obtenidos:', items.value);

  } catch (error) {
    console.error('Error al obtener datos:', error)
  }
}

onMounted(() => {
  obtenerDatos()
})

// Abrir agregar
const abrirAgregar = () => {
  modo.value = 'agregar'
  form.value = {
    id: 0,
    codigo: '',
    nombre: '',
    descripcion: '',
    observaciones: '',

  }
  dialog.value = true
}

// Abrir editar
const abrirEditar = (item) => {
  modo.value = 'editar'
  form.value = { ...item }
  dialog.value = true
}

// Guardar / actualizar
const guardar = async () => {
  try {
    if (modo.value === 'agregar') {
      console.log('Datos a enviar para crear:', form.value);
      const response = await httpcat.post(
        endpoints.catalogos.creardepartamento,
        {
          ...form.value,
          usuarioIng: authStore.user
        }
      )
      console.log('Respuesta al crear:', response.data);
    } else {
      const response = await httpcat.put(
        `${endpoints.catalogos.actualizarDepartamento}/${form.value.id}`,
        {
          ...form.value,
          usuarioAct: authStore.user
        }
      )
      alert(response.data.mensaje)
    }

    await obtenerDatos()
    cerrar()
  } catch (error) {
    console.error('Error al guardar:', error)
  }
}

// Eliminar
const eliminar = async (item) => {
  try {
    const response = await httpcat.delete(
      `${endpoints.catalogos.eliminarDepartamento}/${item.id}`,
      {
        data: {
          usuarioEli: authStore.user
        }
      }
    )
    await obtenerDatos()
  } catch (error) {
    console.error('Error al eliminar:', error)
  }
}

// Cerrar modal
const cerrar = () => {
  dialog.value = false
}
</script>