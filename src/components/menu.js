import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/nodohttp'
import { endpoints } from '../api/endpoints'

// Estado compartido
const modulos = ref([])
const busqueda = ref('')
const historial = ref([])
const itemsActuales = ref([])
const tituloNivelActual = ref('Módulos')
const menuInicializado = ref(false)
const cargando = ref(false)
const menuCargado = ref(false)
const popstateRegistrado = ref(false)

const tieneHijos = (item) => Array.isArray(item?.children) && item.children.length > 0
const esRutaValida = (item) => item?.id_menu === 3 && !!item?.path

const normalizarMenu = (items) => {
  if (!Array.isArray(items)) return []

  return items.map(item => ({
    ...item,
    id: item.id,
    title: item.title || item.short_name || 'Sin nombre',
    icon: item.icon || 'mdi-menu',
    path: item.path || item.url || '',
    children: normalizarMenu(item.children || [])
  }))
}

const obtenerTituloBase = () => {
  return busqueda.value.trim() ? 'Resultados de búsqueda' : 'Módulos'
}

const filtrarMenu = (items, texto) => {
  if (!texto) return items

  const textoBusqueda = texto.toLowerCase()

  return items
    .map(item => {
      const coincideTitulo = item.title?.toLowerCase().includes(textoBusqueda)

      const hijosFiltrados = tieneHijos(item)
        ? filtrarMenu(item.children, texto)
        : []

      if (coincideTitulo) {
        return {
          ...item,
          children: item.children || []
        }
      }

      if (hijosFiltrados.length > 0) {
        return {
          ...item,
          children: hijosFiltrados
        }
      }

      return null
    })
    .filter(Boolean)
}

const itemsFiltrados = computed(() => {
  return filtrarMenu(modulos.value, busqueda.value.trim())
})

const actualizarURL = (path) => {
  const url = new URL(window.location)

  if (path) {
    url.searchParams.set('menu', path)
  } else {
    url.searchParams.delete('menu')
  }

  window.history.pushState({}, '', url)
}

const buscarRutaEnArbol = (items, menuPath, padres = []) => {
  for (const item of items) {
    const rutaActual = [...padres, item]

    if (item.path === menuPath) {
      return rutaActual
    }

    if (tieneHijos(item)) {
      const encontrado = buscarRutaEnArbol(item.children, menuPath, rutaActual)
      if (encontrado) return encontrado
    }
  }

  return null
}

const restaurarDesdeURL = () => {
  const url = new URL(window.location)
  const menuPath = url.searchParams.get('menu')

  if (!modulos.value.length) {
    itemsActuales.value = []
    tituloNivelActual.value = ''
    menuInicializado.value = false
    return
  }

  if (!menuPath) {
    historial.value = []
    itemsActuales.value = itemsFiltrados.value
    tituloNivelActual.value = obtenerTituloBase()
    menuInicializado.value = true
    return
  }

  const rutaEncontrada = buscarRutaEnArbol(modulos.value, menuPath)

  if (!rutaEncontrada) {
    historial.value = []
    itemsActuales.value = itemsFiltrados.value
    tituloNivelActual.value = obtenerTituloBase()
    menuInicializado.value = true
    return
  }

  const nuevoHistorial = []

  for (let i = 0; i < rutaEncontrada.length - 1; i++) {
    const itemActual = rutaEncontrada[i]
    const itemsDelNivel = i === 0 ? modulos.value : (rutaEncontrada[i - 1].children || [])

    nuevoHistorial.push({
      titulo: i === 0 ? obtenerTituloBase() : (itemActual.title || 'Módulos'),
      items: itemsDelNivel,
      path: i === 0 ? '' : (itemActual.path || '')
    })
  }

  const actual = rutaEncontrada[rutaEncontrada.length - 1]

  historial.value = nuevoHistorial
  itemsActuales.value = tieneHijos(actual) ? actual.children : []
  tituloNivelActual.value = actual.title || 'Módulos'
  menuInicializado.value = true
}

const manejarPopstate = () => {
  restaurarDesdeURL()
}

// watchers globales, se crean una sola vez
watch(busqueda, () => {
  restaurarDesdeURL()
})

watch(modulos, () => {
  restaurarDesdeURL()
})

export function useMenu() {
  const router = useRouter()

  const cargarMenu = async (forzar = false) => {
    if ((menuCargado.value && !forzar) || cargando.value) return

    try {
      cargando.value = true

      const response = await http.get(endpoints.auth.perfil)
      modulos.value = normalizarMenu(response.data?.data || [])
      menuCargado.value = true
      restaurarDesdeURL()
    } catch (error) {
      console.error('Error al cargar menú:', error)
      modulos.value = []
    } finally {
      cargando.value = false
    }
  }

  const inicializarMenu = async () => {
    if (!popstateRegistrado.value) {
      window.addEventListener('popstate', manejarPopstate)
      popstateRegistrado.value = true
    }

    await cargarMenu()
  }

const seleccionarItem = (item) => {
  if (tieneHijos(item)) {
    historial.value.push({
      titulo: tituloNivelActual.value || obtenerTituloBase(),
      items: itemsActuales.value,
      path: new URL(window.location).searchParams.get('menu') || ''
    })

    itemsActuales.value = item.children
    tituloNivelActual.value = item.title || 'Módulos'
    actualizarURL(item.path || '')
    return
  }

  if (!esRutaValida(item)) return

  actualizarURL(item.path)

  if (item.path) {
    let ruta = item.path

    if (!ruta.startsWith('/')) {
      ruta = `/usuarios/${ruta}`
    }

    router.push(ruta)
  }
}

  const volverNivel = () => {
    const anterior = historial.value.pop()
    if (!anterior) return

    itemsActuales.value = anterior.items
    tituloNivelActual.value = anterior.titulo
    actualizarURL(anterior.path)
  }

  const volverInicio = () => {
    historial.value = []
    itemsActuales.value = itemsFiltrados.value
    tituloNivelActual.value = obtenerTituloBase()
    actualizarURL('')
  }

  const descripcionItem = (item) => {
    if (item.id_menu === 1 || item.id_menu === 2) {
      return `${item.children?.length || 0} opciones`
    }
    return 'Acceso directo'
  }

  return {
    modulos,
    busqueda,
    historial,
    itemsActuales,
    tituloNivelActual,
    itemsFiltrados,
    menuInicializado,
    cargando,
    cargarMenu,
    inicializarMenu,
    seleccionarItem,
    volverNivel,
    volverInicio,
    descripcionItem,
    tieneHijos,
    esRutaValida
  }
}