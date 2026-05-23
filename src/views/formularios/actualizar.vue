<template>
    <!-- BUSCADOR PARA ACTUALIZACIÓN -->
    <v-card class="mb-4 pa-4" rounded="xl" elevation="2">
        <v-row align="center">
            <v-col cols="12">
                <div class="text-subtitle-1 font-weight-bold">
                    Buscar afiliado para actualización
                </div>
                <div class="text-caption text-medium-emphasis">
                    Ingrese el DPI para cargar los datos actuales del afiliado.
                </div>
            </v-col>

            <v-col cols="12" md="6">
                <v-text-field
                    v-model="dpiBusqueda"
                    label="DPI del afiliado"
                    variant="outlined"
                    placeholder="0000 00000 0000"
                    :rules="[validarNumeroDocumento]"
                    clearable
                    :disabled="buscandoSolicitud"
                />
            </v-col>

            <v-col cols="12" md="3">
                <v-btn
                    color="primary"
                    prepend-icon="mdi-account-search"
                    height="56"
                    block
                    :loading="buscandoSolicitud"
                    :disabled="validarNumeroDocumento(dpiBusqueda) !== true || buscandoSolicitud"
                    @click="buscarAfiliadoParaActualizar"
                >
                    Buscar
                </v-btn>
            </v-col>

            <v-col cols="12" md="3" v-if="solicitudEncontrada">
                <v-btn
                    color="secondary"
                    variant="tonal"
                    prepend-icon="mdi-refresh"
                    height="56"
                    block
                    @click="nuevaBusqueda"
                >
                    Nueva búsqueda
                </v-btn>
            </v-col>
        </v-row>
    </v-card>

    <v-alert
        v-if="!solicitudEncontrada"
        type="info"
        variant="tonal"
        class="mb-4"
        rounded="lg"
    >
        Primero debe buscar un afiliado por DPI para habilitar el formulario de actualización.
    </v-alert>

    <v-form ref="formRef" v-if="solicitudEncontrada">
        <v-container fluid>
            <!-- DATOS GENERALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos generales
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_ejercicio_fiscal"
                        :items="catalogos.ejerciciosFiscales"
                        item-title="codigo"
                        item-value="id"
                        label="Ejercicio fiscal"
                        variant="outlined"
                        :disabled="bloquearDatosNoEditables"
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_origen_solicitud"
                        :items="catalogos.origenesSolicitud"
                        item-title="nombre"
                        item-value="id"
                        label="Origen solicitud"
                        variant="outlined"
                        :disabled="bloquearDatosNoEditables"
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFecha" :close-on-content-click="false" location="bottom" :disabled="true">
                        <template #activator="{ props }">
                            <v-text-field
                                v-model="form.fecha"
                                label="Fecha"
                                variant="outlined"
                                placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar"
                                v-bind="props"
                                :rules="[campoObligatorio]"
                                readonly
                            />
                        </template>

                        <v-date-picker v-model="fechaSeleccionada" @update:model-value="seleccionarFecha" />
                    </v-menu>
                </v-col>

                <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                    <v-text-field
                        v-model="form.correlativo"
                        label="Correlativo"
                        type="number"
                        variant="outlined"
                        :readonly="bloquearDatosNoEditables"
                    />
                </v-col>

                <v-col v-if="mostrarCorrelativoNumero" cols="12" md="3">
                    <v-text-field
                        v-model="form.numero"
                        label="Número"
                        type="number"
                        variant="outlined"
                        :readonly="bloquearDatosNoEditables"
                    />
                </v-col>
            </v-row>

            <!-- DOCUMENTO -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Documento
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_tipo_documento"
                        :items="catalogos.tiposDocumento"
                        item-title="nombre"
                        item-value="id"
                        label="Tipo documento"
                        variant="outlined"
                        :disabled="bloquearDatosNoEditables"
                    />
                </v-col>

                <v-col cols="12" md="5">
                    <v-text-field
                        v-model="form.numero_documento"
                        label="Número documento / DPI"
                        type="text"
                        variant="outlined"
                        placeholder="0000 00000 0000"
                        :rules="[validarNumeroDocumento]"
                        :success="documentoValido"
                        :success-messages="documentoValido ? mensajeDocumento : ''"
                        :error="mensajeDocumento !== '' && !documentoValido"
                        :error-messages="mensajeDocumento !== '' && !documentoValido ? mensajeDocumento : ''"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaEmision" :close-on-content-click="false" location="bottom" :disabled="bloquearDatosNoEditables">
                        <template #activator="{ props }">
                            <v-text-field
                                v-model="form.fecha_emision"
                                label="Fecha emisión"
                                variant="outlined"
                                placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar"
                                v-bind="props"
                                :rules="[validarFechaEmision]"
                                readonly
                            />
                        </template>

                        <v-date-picker
                            v-model="fechaEmisionSeleccionada"
                            @update:model-value="seleccionarFechaEmision"
                        />
                    </v-menu>
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaVencimiento" :close-on-content-click="false" location="bottom" :disabled="bloquearDatosNoEditables">
                        <template #activator="{ props }">
                            <v-text-field
                                ref="fechaVencimientoRef"
                                v-model="form.fecha_vencimiento"
                                label="Fecha vencimiento"
                                variant="outlined"
                                placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar"
                                v-bind="props"
                                :rules="[validarFechaVencimiento]"
                                readonly
                            />
                        </template>

                        <v-date-picker
                            v-model="fechaVencimientoSeleccionada"
                            @update:model-value="seleccionarFechaVencimiento"
                        />
                    </v-menu>
                </v-col>

                <v-col cols="12" md="3">
                    <v-text-field
                        v-model="form.fecha_defuncion"
                        label="Fecha defunción"
                        variant="outlined"
                        placeholder="dd/mm/yyyy"
                        prepend-inner-icon="mdi-calendar"
                        readonly
                        :error="!!form.fecha_defuncion"
                        :error-messages="form.fecha_defuncion ? 'Persona fallecida, no puede ser afiliada' : ''"
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.correlativo_documento"
                        label="Correlativo documento"
                        type="number"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_entidad_emisora"
                        :items="catalogos.entidadesEmisoras"
                        item-title="nombre"
                        item-value="id"
                        label="Entidad emisora"
                        variant="outlined"
                        :disabled="bloquearDatosNoEditables"
                    />
                </v-col>
            </v-row>

            <!-- DATOS PERSONALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos personales
                    </div>
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.nombre1"
                        label="Primer nombre"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.nombre2"
                        label="Segundo nombre"
                        variant="outlined"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.nombre3"
                        label="Tercer nombre"
                        variant="outlined"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.apellido1"
                        label="Primer apellido"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.apellido2"
                        label="Segundo apellido"
                        variant="outlined"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-text-field
                        v-model="form.apellido3"
                        label="Tercer apellido"
                        variant="outlined"
                        readonly
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.sexo"
                        :items="['M', 'F']"
                        label="Sexo"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        disabled
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_estado_civil"
                        :items="catalogos.estadosCiviles"
                        item-title="nombre"
                        item-value="id"
                        label="Estado civil"
                        variant="outlined"
                        disabled
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-menu v-model="menuFechaNacimiento" :close-on-content-click="false" location="bottom" :disabled="true">
                        <template #activator="{ props }">
                            <v-text-field
                                v-model="form.fecha_nacimiento"
                                label="Fecha nacimiento"
                                variant="outlined"
                                placeholder="dd/mm/yyyy"
                                prepend-inner-icon="mdi-calendar"
                                v-bind="props"
                                :rules="[validarFechaNacimiento]"
                                readonly
                            />
                        </template>

                        <v-date-picker
                            v-model="fechaNacimientoSeleccionada"
                            @update:model-value="seleccionarFechaNacimiento"
                        />
                    </v-menu>
                </v-col>

                <!-- EDITABLES -->
                <v-col cols="12" md="3">
                    <v-text-field
                        v-model="form.correo"
                        label="Correo"
                        type="email"
                        variant="outlined"
                        :rules="[validarCorreo, campoObligatorio]"
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-text-field
                        v-model="form.telefono"
                        label="Teléfono"
                        type="text"
                        variant="outlined"
                        placeholder="0000-0000"
                        maxlength="9"
                        :rules="[validarTelefono, campoObligatorio]"
                        @input="form.telefono = formatearTelefono(form.telefono)"
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_ocupacion"
                        :items="catalogos.ocupaciones"
                        item-title="nombre"
                        item-value="id"
                        label="Ocupación"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                    />
                </v-col>
            </v-row>

            <!-- NACIMIENTO -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Lugar de nacimiento
                    </div>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="form.id_departamento_nacimiento"
                        :items="catalogos.departamentos"
                        item-title="nombre"
                        item-value="id"
                        label="Departamento nacimiento"
                        variant="outlined"
                        disabled
                    />
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="form.id_municipio_nacimiento"
                        :items="municipiosNacimientoFiltrados"
                        item-title="nombre"
                        item-value="id"
                        label="Municipio nacimiento"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        disabled
                    />
                </v-col>
            </v-row>

            <!-- VECINDAD -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Vecindad
                    </div>
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="form.id_departamento_vecindad"
                        :items="catalogos.departamentos"
                        item-title="nombre"
                        item-value="id"
                        label="Departamento vecindad"
                        variant="outlined"
                        disabled
                    />
                </v-col>

                <v-col cols="12" md="6">
                    <v-select
                        v-model="form.id_municipio_vecindad"
                        :items="municipiosVecindadFiltrados"
                        item-title="nombre"
                        item-value="id"
                        label="Municipio vecindad"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                        disabled
                    />
                </v-col>
            </v-row>

            <!-- RESIDENCIA -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Residencia
                    </div>
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_departamento_residencia"
                        :items="catalogos.departamentos"
                        item-title="nombre"
                        item-value="id"
                        label="Departamento residencia"
                        variant="outlined"
                        @update:model-value="cambiarDepartamentoResidencia"
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_municipio_residencia"
                        :items="municipiosResidenciaFiltrados"
                        item-title="nombre"
                        item-value="id"
                        label="Municipio residencia"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                    />
                </v-col>

                <v-col cols="12">
                    <v-textarea
                        v-model="form.direccion_residencia"
                        label="Dirección residencia"
                        variant="outlined"
                        rows="2"
                        :rules="[campoObligatorio]"
                    />
                </v-col>
            </v-row>

            <!-- ENTREGA -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Entrega
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.id_tipo_entrega"
                        :items="catalogos.tiposEntrega"
                        item-title="nombre"
                        item-value="id"
                        label="Tipo entrega"
                        variant="outlined"
                    />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12" md="3">
                    <v-select
                        v-model="form.id_departamento_entrega"
                        :items="catalogos.departamentos"
                        item-title="nombre"
                        item-value="id"
                        label="Departamento entrega"
                        variant="outlined"
                        @update:model-value="cambiarDepartamentoEntrega"
                    />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12" md="3">
                    <v-select
                        v-model="form.id_municipio_entrega"
                        :items="municipiosEntregaFiltrados"
                        item-title="nombre"
                        item-value="id"
                        label="Municipio entrega"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                    />
                </v-col>

                <v-col v-if="esEntregaCentro" cols="12" md="3">
                    <v-select
                        v-model="form.id_centro_entrega"
                        :items="catalogos.centrosEntrega"
                        item-title="nombre"
                        item-value="id"
                        label="Centro entrega"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                    />
                </v-col>

                <v-col v-if="esEntregaDomicilio" cols="12">
                    <v-textarea
                        v-model="form.direccion_entrega"
                        label="Dirección entrega"
                        variant="outlined"
                        rows="2"
                        :rules="[campoObligatorio]"
                    />
                </v-col>
            </v-row>

            <!-- DATOS ELECTORALES -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos electorales
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <v-switch
                        v-model="form.empadronado"
                        :true-value="1"
                        :false-value="0"
                        label="Empadronado"
                        color="primary"
                        inset
                    />
                </v-col>

                <v-col cols="12" md="3" v-if="form.empadronado === 1">
                    <v-text-field
                        v-model="form.empadronamiento"
                        label="Número de empadronamiento"
                        variant="outlined"
                        clearable
                    />
                </v-col>

                <v-col cols="12" md="3">
                    <v-select
                        v-model="form.consultado_renap"
                        :items="['S', 'N']"
                        label="Consultado RENAP"
                        variant="outlined"
                        disabled
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_departamento_votacion"
                        :items="catalogos.departamentos"
                        item-title="nombre"
                        item-value="id"
                        label="Departamento votación"
                        variant="outlined"
                        @update:model-value="cambiarDepartamentoCentroVotacion"
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_municipio_votacion"
                        :items="municipiosCentroVotacionFiltrados"
                        item-title="nombre"
                        item-value="id"
                        label="Municipio votación"
                        variant="outlined"
                        :rules="[campoObligatorio]"
                    />
                </v-col>

                <v-col cols="12" md="4">
                    <v-select
                        v-model="form.id_centro_votacion"
                        :items="catalogos.centrosVotacion"
                        item-title="nombre"
                        item-value="id"
                        label="Centro votación"
                        variant="outlined"
                    />
                </v-col>
            </v-row>

            <!-- OTROS -->
            <v-row>
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Otros datos
                    </div>
                </v-col>

                <v-col cols="12">
                    <v-textarea
                        v-model="form.observaciones"
                        label="Observaciones"
                        variant="outlined"
                        rows="3"
                    />
                </v-col>
            </v-row>

            <!-- DATOS BIOMÉTRICOS -->
            <v-row align="stretch">
                <v-col cols="12">
                    <div class="text-subtitle-1 font-weight-bold mb-2">
                        Datos biométricos
                    </div>
                </v-col>

                <!-- HUELLA -->
                <v-col cols="12" md="6" class="d-flex">
                    <v-card class="pa-4 biometria-card d-flex flex-column" rounded="xl" elevation="2">
                        <div class="text-subtitle-2 font-weight-bold mb-2">
                            Huella digital
                        </div>

                        <div class="biometria-body d-flex flex-column align-center justify-center">
                            <v-icon size="90" color="primary">
                                mdi-fingerprint
                            </v-icon>

                            <v-btn
                                color="primary"
                                prepend-icon="mdi-fingerprint"
                                class="mt-4"
                                @click="dialogHuella = true"
                            >
                                Capturar / actualizar huella
                            </v-btn>

                            <div class="mt-3 text-caption">
                                {{
                                    form.huella
                                        ? 'Huella capturada correctamente'
                                        : 'Sin huella capturada'
                                }}
                            </div>
                        </div>
                    </v-card>
                </v-col>

                <!-- FOTOGRAFÍA -->
                <v-col cols="12" md="6" class="d-flex">
                    <v-card class="pa-4 biometria-card d-flex flex-column" rounded="xl" elevation="2">
                        <div class="text-subtitle-2 font-weight-bold mb-2">
                            Fotografía
                        </div>

                        <div class="biometria-body d-flex flex-column align-center justify-center">
                            <v-img
                                v-if="form.fotografia"
                                :src="form.fotografia"
                                width="180"
                                height="180"
                                class="rounded foto-preview"
                                cover
                            />

                            <v-icon v-else size="90" color="primary">
                                mdi-camera
                            </v-icon>

                            <v-btn
                                color="primary"
                                prepend-icon="mdi-camera"
                                class="mt-4"
                                @click="abrirCamara"
                            >
                                Capturar / actualizar fotografía
                            </v-btn>

                            <v-btn
                                v-if="form.fotografia"
                                color="error"
                                variant="text"
                                class="mt-2"
                                @click="eliminarFotografia"
                            >
                                Eliminar fotografía
                            </v-btn>

                            <div class="mt-2 text-caption">
                                {{
                                    form.fotografia
                                        ? 'Fotografía capturada correctamente'
                                        : 'Sin fotografía capturada'
                                }}
                            </div>
                        </div>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
            <v-btn variant="text" @click="nuevaBusqueda">
                Cancelar
            </v-btn>

            <v-btn color="primary" prepend-icon="mdi-content-save" @click="guardar">
                Actualizar
            </v-btn>
        </v-card-actions>
    </v-form>

    <!-- DIALOG HUELLA -->
    <v-dialog v-model="dialogHuella" max-width="650" persistent>
        <v-card rounded="xl" elevation="8">
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-h6 font-weight-bold">
                    Captura de huella
                </span>

                <v-btn icon="mdi-close" variant="text" @click="dialogHuella = false" />
            </v-card-title>

            <v-divider />

            <v-card-text>
                <CapturaHuella :dedo="dedoSeleccionado" @huellaCapturada="guardarHuella" />
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="error" @click="dialogHuella = false">
                    Cancelar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- DIALOG CÁMARA -->
    <v-dialog v-model="dialogCamara" max-width="600" persistent>
        <v-card rounded="xl">
            <v-card-title class="text-h6 font-weight-bold">
                Capturar fotografía
            </v-card-title>

            <v-card-text>
                <v-select
                    v-model="camaraSeleccionada"
                    :items="camarasDisponibles"
                    item-title="nombre"
                    item-value="id"
                    label="Seleccionar cámara"
                    variant="outlined"
                    prepend-inner-icon="mdi-video"
                    class="mb-4"
                    @update:model-value="cambiarCamara"
                />

                <div class="camera-container">
                    <video ref="videoRef" autoplay playsinline class="camera-video"></video>
                    <canvas ref="canvasRef" class="d-none"></canvas>
                </div>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn variant="text" color="error" @click="cerrarCamara">
                    Cancelar
                </v-btn>

                <v-btn color="primary" prepend-icon="mdi-camera" @click="tomarFoto">
                    Tomar foto
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, toRefs, nextTick } from 'vue'
import { httpsol } from '../../api/nodohttp'
import { endpoints } from '../../api/endpoints'
import { alertLoading, closeAlert, useAlert } from '../../utils/useAlert'
import CapturaHuella from '../biometria/Huella.vue'

import {
    obtenerFechaHoy,
    validarNumeroDocumento,
    validarDocumento,
    validarFecha,
    validarFechaVencimiento as validarFechaVencimientoUtil,
    campoObligatorio,
    validarFechaNacimiento,
    validarCorreo,
    formatearTelefono,
    validarTelefono,
    convertirFechaDDMMYYYY
} from '../../utils/validacionesformulario'

import {
    abrirCamara as abrirCamaraUtil,
    cambiarCamara as cambiarCamaraUtil,
    tomarFoto as tomarFotoUtil,
    cerrarCamara as cerrarCamaraUtil,
    eliminarFotografia as eliminarFotografiaUtil
} from '../../utils/camaraFormulario'

const props = defineProps({
    catalogos: {
        type: Object,
        required: true
    },
    idTipoSolicitud: {
        type: [Number, String],
        required: true
    }
})

const { catalogos } = toRefs(props)

const { success, error } = useAlert()

const formRef = ref(null)
const fechaVencimientoRef = ref(null)

const dpiBusqueda = ref('')
const buscandoSolicitud = ref(false)
const solicitudEncontrada = ref(false)

const dialogHuella = ref(false)
const dedoSeleccionado = ref(1)

const dialogCamara = ref(false)
const videoRef = ref(null)
const canvasRef = ref(null)
const streamCamara = ref(null)
const camarasDisponibles = ref([])
const camaraSeleccionada = ref(null)

const mostrarCorrelativoNumero = ref(false)

const mensajeDocumento = ref('')
const documentoValido = ref(false)

const menuFecha = ref(false)
const fechaSeleccionada = ref(null)

const menuFechaEmision = ref(false)
const menuFechaVencimiento = ref(false)
const fechaEmisionSeleccionada = ref(null)
const fechaVencimientoSeleccionada = ref(null)

const menuFechaNacimiento = ref(false)
const fechaNacimientoSeleccionada = ref(null)

const bloquearDatosNoEditables = computed(() => solicitudEncontrada.value)

const dedosHuella = [
    { id: 1, nombre: 'Índice derecho' },
    { id: 2, nombre: 'Índice izquierdo' },
    { id: 3, nombre: 'Medio derecho' },
    { id: 4, nombre: 'Medio izquierdo' },
    { id: 5, nombre: 'Anular derecho' },
    { id: 6, nombre: 'Anular izquierdo' },
    { id: 7, nombre: 'Meñique derecho' },
    { id: 8, nombre: 'Meñique izquierdo' },
    { id: 9, nombre: 'Pulgar derecho' },
    { id: 10, nombre: 'Pulgar izquierdo' }
]

const getInitialForm = () => ({
    id: 0,
    id_ejercicio_fiscal: 1,
    id_tipo_solicitud: props.idTipoSolicitud,
    id_origen_solicitud: 1,
    fecha: obtenerFechaHoy(),

    correlativo: 1,
    numero: 1,

    id_tipo_documento: 1,
    numero_documento: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    correlativo_documento: null,
    id_entidad_emisora: 1,

    nombre1: '',
    nombre2: '',
    nombre3: null,
    apellido1: '',
    apellido2: '',
    apellido3: null,
    sexo: 'M',
    id_estado_civil: 1,
    fecha_nacimiento: '',
    correo: '',
    telefono: '',

    probatorio: null,
    id_ocupacion: 1,

    id_departamento_nacimiento: 1,
    id_municipio_nacimiento: 1,

    id_departamento_vecindad: 1,
    id_municipio_vecindad: 1,

    id_departamento_residencia: 1,
    id_municipio_residencia: 1,
    direccion_residencia: '',
    id_localizacion: 1,

    id_tipo_entrega: 1,
    id_departamento_entrega: 1,
    id_municipio_entrega: 1,
    direccion_entrega: '',
    id_centro_entrega: 1,

    empadronado: 0,
    empadronamiento: 0,
    anverso: null,
    reverso: null,

    id_departamento_votacion: 1,
    id_municipio_votacion: 1,
    id_centro_votacion: 1,

    fecha_defuncion: null,
    enrolado: 0,
    id_padre: 0,
    consultado_renap: 'N',
    observaciones: '',

    huella: null,
    fotografia: null,

    enrolamientos: [
        {
            id: 0,
            id_caracteristica: 11,
            probatorio: '',
            imagen: '',
            plantilla: '',
            thumnail: '',
            observaciones: 'Rostro frontal'
        }
    ]
})

const form = ref(getInitialForm())

const esEntregaDomicilio = computed(() => Number(form.value.id_tipo_entrega) === 1)
const esEntregaCentro = computed(() => Number(form.value.id_tipo_entrega) === 2)

const municipiosResidenciaFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_residencia)
    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosNacimientoFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_nacimiento)
    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosVecindadFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_vecindad)
    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosEntregaFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_entrega)
    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const municipiosCentroVotacionFiltrados = computed(() => {
    const idDepartamento = Number(form.value.id_departamento_votacion)
    if (!idDepartamento) return []

    return catalogos.value.municipios.filter(municipio =>
        Number(municipio.id_departamento) === idDepartamento
    )
})

const cambiarDepartamentoResidencia = () => {
    form.value.id_municipio_residencia = null
}

const cambiarDepartamentoNacimiento = () => {
    form.value.id_municipio_nacimiento = null
}

const cambiarDepartamentoVecindad = () => {
    form.value.id_municipio_vecindad = null
}

const cambiarDepartamentoEntrega = () => {
    form.value.id_municipio_entrega = null
}

const cambiarDepartamentoCentroVotacion = () => {
    form.value.id_municipio_votacion = null
}

const limpiarDpi = (valor) => {
    return String(valor || '')
        .replace(/\s/g, '')
        .replace(/-/g, '')
}

const obtenerDataRespuesta = (response) => {
    if (response?.data?.data) return response.data.data
    if (response?.data?.datos) return response.data.datos
    if (response?.data?.solicitud) return response.data.solicitud
    return response?.data || null
}

const normalizarFotografia = (foto) => {
    if (!foto) return null

    const valor = String(foto)

    if (valor.startsWith('data:image')) {
        return valor
    }

    return `data:image/jpeg;base64,${valor}`
}

const cargarDatosParaActualizar = (data) => {
    const inicial = getInitialForm()

    form.value = {
        ...inicial,
        ...data,

        id: data.id || data.id_solicitud || data.idSolicitud || 0,
        id_tipo_solicitud: props.idTipoSolicitud,

        numero_documento: data.numero_documento || data.dpi || data.cui || '',
        fecha: data.fecha || inicial.fecha,

        fecha_emision: data.fecha_emision || '',
        fecha_vencimiento: data.fecha_vencimiento || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        fecha_defuncion: data.fecha_defuncion || null,

        consultado_renap: data.consultado_renap || 'S',

        enrolamientos: data.enrolamientos?.length
            ? data.enrolamientos
            : inicial.enrolamientos,

        fotografia: normalizarFotografia(data.fotografia || data.foto),
        huella: data.huella || data.plantilla_huella || null
    }

    documentoValido.value = true
    mensajeDocumento.value = 'Documento cargado correctamente'
}

const buscarAfiliadoParaActualizar = async () => {
    try {
        const resultado = validarDocumento(dpiBusqueda.value)

        if (!resultado.valido) {
            error(resultado.mensaje || 'Ingrese un DPI válido')
            return
        }

        buscandoSolicitud.value = true
        solicitudEncontrada.value = false

        alertLoading('Buscando afiliado', 'Consultando información del afiliado...')

        const dpiLimpio = limpiarDpi(dpiBusqueda.value)

        const response = await httpsol.get(
            `${endpoints.solicitudes.buscarPorDpi}/${dpiLimpio}`
        )

        const data = obtenerDataRespuesta(response)

        closeAlert()

        if (!data || response.data?.resultado === 404 || response.data?.success === false) {
            error(response.data?.mensaje || 'No se encontró un afiliado con el DPI ingresado')
            return
        }

        cargarDatosParaActualizar(data)

        solicitudEncontrada.value = true
        success('Datos cargados correctamente')
    } catch (err) {
        closeAlert()
        console.error('Error al buscar afiliado:', err)
        error('No se pudo buscar el afiliado')
    } finally {
        buscandoSolicitud.value = false
    }
}

const nuevaBusqueda = () => {
    form.value = getInitialForm()
    dpiBusqueda.value = ''
    solicitudEncontrada.value = false
    mensajeDocumento.value = ''
    documentoValido.value = false
}

const revalidarFechaVencimiento = async () => {
    await nextTick()

    if (!fechaVencimientoRef.value) return

    await fechaVencimientoRef.value.validate()
}

const formatearFechaInput = (fecha) => {
    if (!fecha) return ''

    const date = new Date(fecha)

    const dia = String(date.getDate()).padStart(2, '0')
    const mes = String(date.getMonth() + 1).padStart(2, '0')
    const anio = date.getFullYear()

    return `${dia}/${mes}/${anio}`
}

const seleccionarFecha = (fecha) => {
    form.value.fecha = formatearFechaInput(fecha)
    menuFecha.value = false
}

const seleccionarFechaEmision = async (fecha) => {
    form.value.fecha_emision = formatearFechaInput(fecha)
    menuFechaEmision.value = false

    await revalidarFechaVencimiento()
}

const seleccionarFechaVencimiento = (fecha) => {
    form.value.fecha_vencimiento = formatearFechaInput(fecha)
    menuFechaVencimiento.value = false
}

const seleccionarFechaNacimiento = (fecha) => {
    form.value.fecha_nacimiento = formatearFechaInput(fecha)
    menuFechaNacimiento.value = false
}

const validarFechaEmision = (valor) => {
    return validarFecha(valor)
}

const validarFechaVencimiento = (valor) => {
    return validarFechaVencimientoUtil(
        valor,
        form.value.fecha_emision
    )
}

const limpiarSoloHuellas = () => {
    const idsDedos = dedosHuella.map(x => x.id)

    form.value.enrolamientos = form.value.enrolamientos.filter(
        x => !idsDedos.includes(x.id_caracteristica)
    )

    form.value.huella = null
    form.value.enrolado = 0
}

const guardarHuella = (fingerprints) => {
    try {
        if (!Array.isArray(fingerprints) || fingerprints.length === 0) {
            error('No se recibió información de la huella')
            return
        }

        limpiarSoloHuellas()

        if (!form.value.enrolamientos) {
            form.value.enrolamientos = []
        }

        fingerprints.forEach((item) => {
            const huellaBase64 = item.templateBase64

            if (!huellaBase64) return

            const nuevoEnrolamiento = {
                id: 0,
                id_caracteristica: item.finger,
                probatorio: huellaBase64,
                imagen: huellaBase64,
                plantilla: huellaBase64,
                thumnail: huellaBase64,
                observaciones: `Huella dedo ${item.finger}`
            }

            const index = form.value.enrolamientos.findIndex(
                x => x.id_caracteristica === item.finger
            )

            if (index >= 0) {
                form.value.enrolamientos[index] = nuevoEnrolamiento
            } else {
                form.value.enrolamientos.push(nuevoEnrolamiento)
            }
        })

        form.value.huella = fingerprints[0].templateBase64
        form.value.enrolado = 1

        dialogHuella.value = false

        success(`Se guardaron ${fingerprints.length} huellas correctamente`)
    } catch (err) {
        console.error('Error al guardar huellas:', err)
        error('Error al guardar las huellas capturadas')
    }
}

const abrirCamara = async () => {
    try {
        await abrirCamaraUtil({
            dialogCamara,
            camarasDisponibles,
            camaraSeleccionada,
            streamCamara,
            videoRef
        })
    } catch (err) {
        console.error('Error al abrir la cámara:', err)
        error('No se pudo acceder a la cámara')
        dialogCamara.value = false
    }
}

const cambiarCamara = async () => {
    try {
        await cambiarCamaraUtil({
            dialogCamara,
            camaraSeleccionada,
            streamCamara,
            videoRef
        })
    } catch (err) {
        console.error('Error al cambiar cámara:', err)
        error('No se pudo cambiar la cámara')
    }
}

const tomarFoto = () => {
    try {
        tomarFotoUtil({
            videoRef,
            canvasRef,
            form
        })

        cerrarCamara()
    } catch (err) {
        console.error('Error al tomar fotografía:', err)
        error('No se pudo capturar la fotografía')
    }
}

const cerrarCamara = () => {
    cerrarCamaraUtil({
        streamCamara,
        dialogCamara
    })
}

const eliminarFotografia = () => {
    eliminarFotografiaUtil({
        form
    })
}

const obtenerPayloadActualizacion = () => {
    return {
        ...form.value,
        id_tipo_solicitud: props.idTipoSolicitud,

        // Por seguridad, estos datos se envían tal como fueron cargados, pero no se editan en pantalla.
        numero_documento: limpiarDpi(form.value.numero_documento),
        consultado_renap: form.value.consultado_renap || 'S'
    }
}

const guardar = async () => {
    try {
        if (!form.value.id || Number(form.value.id) <= 0) {
            error('No se encontró el identificador de la solicitud para actualizar')
            return
        }

        if (form.value.fecha_defuncion !== null && form.value.fecha_defuncion !== '') {
            error('Persona fallecida. No se puede actualizar una solicitud para este ciudadano.')
            return
        }

        const fechaSolicitud = convertirFechaDDMMYYYY(form.value.fecha)
        const fechaVencimiento = convertirFechaDDMMYYYY(form.value.fecha_vencimiento)

        if (fechaVencimiento <= fechaSolicitud) {
            error('Documento vencido. La fecha de vencimiento debe ser mayor que la fecha de la solicitud.')
            return
        }

        const validacion = await formRef.value?.validate()

        if (validacion && !validacion.valid) {
            error('Revise los campos obligatorios antes de actualizar')
            return
        }

        if (!form.value.fotografia || !form.value.huella) {
            error('Datos biométricos incompletos. Se requiere una fotografía y una huella.')
            return
        }

        alertLoading('Actualizando', 'Guardando cambios de la solicitud...')

        const payload = obtenerPayloadActualizacion()

        console.log('Datos a enviar para actualizar solicitud:', payload)

        const respuestaSave = await httpsol.put(
            `${endpoints.solicitudes.actualizar}/${form.value.id}`,
            payload
        )

        closeAlert()

        if (
            respuestaSave.data?.resultado === 200 ||
            respuestaSave.data?.success === true ||
            respuestaSave.status === 200
        ) {
            success(respuestaSave.data?.mensaje || 'Actualización exitosa de la solicitud')
            return
        }

        error(respuestaSave.data?.mensaje || 'Error desconocido al actualizar la solicitud')
    } catch (err) {
        closeAlert()
        console.error('Error al actualizar afiliación:', err)
        error('No se pudo actualizar la solicitud de afiliación')
    }
}

watch(
    () => props.idTipoSolicitud,
    (nuevoValor) => {
        form.value.id_tipo_solicitud = nuevoValor
    }
)

watch(
    () => form.value.fecha_emision,
    () => {
        formRef.value?.validate()
    }
)
</script>

<style scoped>
.border {
    border-width: 2px !important;
    border-style: solid !important;
}

.border-primary {
    border-color: rgb(var(--v-theme-primary)) !important;
}

.camera-container {
    width: 100%;
    max-width: 100%;
    height: 320px;
    overflow: hidden;
    border-radius: 16px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.camera-video {
    width: 100%;
    height: 100%;
    max-width: 100%;
    object-fit: cover;
    display: block;
}

.biometria-card {
    width: 100%;
}

.biometria-body {
    min-height: 230px;
}

.foto-preview {
    border: 2px solid rgba(var(--v-theme-primary), 0.35);
}
</style>
