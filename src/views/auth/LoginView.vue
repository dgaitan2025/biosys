<template>
  <v-container fluid class="fill-height login-bg pt-16">

    <v-app-bar elevation="2">
      <v-container class="d-flex align-center justify-space-between">
        <v-btn icon variant="text" color="primary" to="/">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-img src="/logo.png" max-width="40" class="mr-2" ></v-img>
        <v-toolbar-title class="font-weight-bold text-primary">
          {{ smAndDown ? 'Biosys' : 'Sistema biométrico' }}
        </v-toolbar-title>
      </v-container>
    </v-app-bar>

    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">

        <v-card class="mx-auto px-6 px-sm-12 pb-8 pt-8" elevation="3" rounded="lg">

          <v-form @submit.prevent="login">
            <div class="text-body-1 text-medium-emphasis mb-1">Usuario</div>
            <v-text-field v-model="email" density="compact" placeholder="Usuario" prepend-inner-icon="mdi-email-outline"
              variant="outlined" type="email" autocomplete="username" />

            <div class="text-body-1 text-medium-emphasis d-flex align-center justify-space-between mb-1">
              Password
            </div>

            <v-text-field v-model="password" :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
              :type="visible ? 'text' : 'password'" density="compact" placeholder="Ingrese password"
              prepend-inner-icon="mdi-lock-outline" variant="outlined" autocomplete="current-password"
              @click:append-inner="visible = !visible" />
              <div class="text-body-1 text-medium-emphasis d-flex align-center justify-space-between mb-1">
              
              <router-link to="/forgot-password" class="text-body-2 text-decoration-none text-blue">
                Reiniciar password?
              </router-link>
            </div>
          </v-form>

          <v-card class="mb-8" color="surface-variant" variant="tonal">
            <v-card-text class="text-medium-emphasis text-body-2">
              Advertencia: Después de 3 intentos fallidos,
              tu cuenta se bloqueará.
            </v-card-text>
          </v-card>

          <v-btn class="mb-4" color="blue" size="large" variant="tonal" block @click="handleLogin">
            Ingresar
          </v-btn>

          <v-card-text class="text-center pa-0 mt-2">
            <router-link to="/register" class="text-blue text-decoration-none text-body-2">
              Registrar
              <v-icon icon="mdi-chevron-right" size="small" />
            </router-link>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useLogin } from '../auth/LoginView'

const { smAndDown,
  visible,
  email,
  password,
  handleLogin } = useLogin()
const login = handleLogin
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background-color: white;
}
</style>