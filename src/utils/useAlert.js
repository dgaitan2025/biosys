import Swal from 'sweetalert2'

export function useAlert() {

const success = (msg) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom',
    showConfirmButton: false,
    timer: 7500,
    timerProgressBar: true,

    background: '#25D366',
    color: '#ffffff',

    customClass: {
      popup: 'whatsapp-toast'
    },

    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer
      toast.onmouseleave = Swal.resumeTimer
    }
  })

  Toast.fire({
    icon: 'success',
    title: msg
  })
}

  const error = (msg, title = 'Error') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: msg,
      confirmButtonColor: '#ef4444',
      background: '#fef2f2',
      color: '#7f1d1d',
      iconColor: '#ef4444'
    })
  }

  const confirm = async (msg, title = '¿Estás seguro?') => {
    return await Swal.fire({
      title: title,
      text: msg,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      background: '#f9fafb'
    })
  }

  const loading = (title = 'Procesando...', text = 'Espere un momento') => {
    Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#f9fafb',
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  const close = () => {
    Swal.close()
  }

  return { success, error, confirm, loading, close }
}

export const alertLoading = (titulo = 'Procesando...', texto = 'Espere un momento') => {
  Swal.fire({
    title: titulo,
    text: texto,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading()
    }
  })
}

export const closeAlert = () => {
  Swal.close()
}