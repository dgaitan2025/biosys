export function useNotify() {
  const success = (message) => {
    alert(`Éxito: ${message}`)
  }

  const error = (message) => {
    alert(`Error: ${message}`)
  }

  const info = (message) => {
    alert(`Info: ${message}`)
  }

  return {
    success,
    error,
    info
  }
}