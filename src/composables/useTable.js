import { ref, computed } from 'vue'

export function useTable(initialData = []) {
  const items = ref(initialData)
  const search = ref('')
  const loading = ref(false)

  const filteredItems = computed(() => {
    if (!search.value) return items.value

    return items.value.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.value.toLowerCase())
      )
    )
  })

  return {
    items,
    search,
    loading,
    filteredItems
  }
}