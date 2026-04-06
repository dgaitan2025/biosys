import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

export function useSaludo() {
    const authStore = useAuthStore()
  const saludo = computed(() => {
    const nickname = authStore.user
    console.log('nickname', nickname)
    const hora = new Date().getHours()

    if (hora >= 0 && hora < 12) {
      return 'Buenos dias, ' + nickname
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas tardes, ' + nickname
    } else {
      return 'Buenas noches, ' + nickname
    }
  })

  return {
    saludo
  }
}