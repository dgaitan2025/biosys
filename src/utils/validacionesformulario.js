import { ref} from 'vue'
import {cuiValido} from './validaDPI'
const mensajeCui = ref('')
const mensajeDocumento = ref('')
const documentoValido = ref(false)


export const obtenerFechaHoy = () => {
    const hoy = new Date()

    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const anio = hoy.getFullYear()

    return `${dia}/${mes}/${anio}`
}

export const validarNumeroDocumento = (valor) => {
    if (!valor) return 'El número de documento es obligatorio'

    const resultado = cuiValido(valor)

    if (!resultado.valido) {
        return 'El número de DPI/CUI no es válido'
    }else {

            console.log('Departamento:', resultado.departamento)
            console.log('Municipio:', resultado.municipio)
            mensajeCui.value = `CUI válido: ${resultado.departamento}, ${resultado.municipio}`

        return true
    }

    return true
}

export const validarCuiDocumento = (valor) => {
    const resultado = cuiValido(valor)

    if (!resultado.valido) {
        return 'El número de DPI/CUI ingresado no es válido'
        return
    }

    console.log('Departamento:', resultado.departamento)
    console.log('Municipio:', resultado.municipio)

    success(`CUI válido: ${resultado.departamento}, ${resultado.municipio}`)
}

export const validarDocumento = (valor) => {
    if (!valor) {
        return {
            valido: false,
            mensaje: 'El número de documento es obligatorio',
            departamento: null,
            municipio: null
        }
    }

    const resultado = cuiValido(valor)

    if (!resultado.valido) {
        return {
            valido: false,
            mensaje: 'El número de DPI/CUI no es válido',
            departamento: null,
            municipio: null
        }
    }

    return {
        valido: true,
        mensaje: `CUI válido: ${resultado.departamento}, ${resultado.municipio}`,
        departamento: resultado.departamento,
        municipio: resultado.municipio
    }
}

export const validarFecha = (valor) => {

    console.log('Valor a validar:', valor)
    if (!valor) return 'La fecha es obligatoria'

    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

    if (!regex.test(valor)) {
        return 'La fecha debe tener formato dd/mm/yyyy'
    }

    return true
}

export const convertirFechaDDMMYYYY = (valor) => {
    if (!valor) return null

    const partes = valor.split('/')

    if (partes.length !== 3) return null

    const dia = Number(partes[0])
    const mes = Number(partes[1])
    const anio = Number(partes[2])

    if (!dia || !mes || !anio) return null

    return new Date(anio, mes - 1, dia)
}

export const validarFechaVencimiento = (fechaVencimiento, fechaEmision) => {
    if (!fechaVencimiento) {
        return 'La fecha de vencimiento es obligatoria'
    }

    const validacionFormato = validarFecha(fechaVencimiento)

    if (validacionFormato !== true) {
        return validacionFormato
    }

    if (!fechaEmision) {
        return 'Primero debe ingresar la fecha de emisión'
    }

    const fechaEmi = convertirFechaDDMMYYYY(fechaEmision)
    const fechaVen = convertirFechaDDMMYYYY(fechaVencimiento)

    if (!fechaEmi || !fechaVen) {
        return 'Las fechas no tienen un formato válido'
    }

    if (fechaVen <= fechaEmi) {
        return 'La fecha de vencimiento debe ser mayor a la fecha de emisión'
    }

    return true
}

export const campoObligatorio = (valor) => {
    if (!valor || String(valor).trim() === '') {
        return 'Este campo es obligatorio'
    }

    return true
}

export const validarFechaNacimiento = (valor) => {
    if (!valor || String(valor).trim() === '') {
        return 'La fecha de nacimiento es obligatoria'
    }

    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

    if (!regex.test(valor)) {
        return 'La fecha debe tener formato dd/mm/yyyy'
    }

    const fechaNacimiento = convertirFechaDDMMYYYY(valor)

    if (!fechaNacimiento || isNaN(fechaNacimiento.getTime())) {
        return 'La fecha de nacimiento no es válida'
    }

    const hoy = new Date()

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
    const mes = hoy.getMonth() - fechaNacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--
    }

    if (edad < 18) {
        return 'La persona debe tener al menos 18 años'
    }

    if (edad > 100) {
        return 'La persona no puede tener más de 100 años'
    }

    return true
}

const CORREO_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validarCorreo = (valor) => {
    const correoTrim = (valor || "").trim();

    if (!correoTrim) return "El correo es obligatorio";

    if (!CORREO_REGEX.test(correoTrim)) {
        return "Formato de correo inválido";
    }

    return null; // ✅ válido
};

export const formatearTelefono = (valor) => {
    if (!valor) return ''

    let numeros = String(valor).replace(/\D/g, '')

    numeros = numeros.substring(0, 8)

    if (numeros.length > 4) {
        return `${numeros.substring(0, 4)}-${numeros.substring(4)}`
    }

    return numeros
}

export const validarTelefono = (valor) => {
    if (!valor || String(valor).trim() === '') {
        return 'El teléfono es obligatorio'
    }

    const regex = /^[0-9]{4}-[0-9]{4}$/

    if (!regex.test(valor)) {
        return 'El teléfono debe tener 8 dígitos con formato 0000-0000'
    }

    return true
}