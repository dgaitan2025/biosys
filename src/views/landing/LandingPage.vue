<script setup>
import { useDisplay } from 'vuetify'
const { smAndDown } = useDisplay()
</script>

<template>
  <v-main>
    <v-container fluid class="pa-0">
      <v-app-bar elevation="2">
        <v-container class="d-flex align-center justify-space-between">
          <v-img src="/logo.png" max-width="40" class="mr-2"></v-img>
          <v-toolbar-title class="font-weight-bold text-primary">
            {{ smAndDown ? 'Biosys' : 'Sistema biométrico' }}
          </v-toolbar-title>

          <div class="d-flex ga-2">
            <v-btn color="primary" variant="flat" to="/login">Iniciar sesión</v-btn>
          </div>
        </v-container>
      </v-app-bar>

      <v-carousel class="custom-carousel">
        <v-carousel-item v-for="n in 3" :key="n">
          <v-img :src="`/carousel${n}.png`" class="carousel-image" />
        </v-carousel-item>
      </v-carousel>

      <div class="landing-background">
        <section class="hero-section">
          <v-container>
            <v-row align="center" justify="center">
              <v-col cols="12" md="6">

                <h1 class="font-weight-bold text-primary">
                  Plataforma moderna para el registro y la afiliación en partidos politicos
                </h1>
                <p class="text-body-1 text-medium-emphasis mb-6">
                  BioSys centraliza el registro de personas, validación de identidad,
                  huellas y reconocimiento facial en una plataforma.
                </p>

              </v-col>

              <v-col cols="12" md="6">
                <v-card rounded="xl" elevation="8" class="pa-6">
                  <div class="font-weight-bold text-primary mb-4">Funciones principales</div>

                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" class="pa-4" rounded="lg">
                        <v-icon size="32" color="primary" class="mb-2">mdi-account-group</v-icon>
                        <div class="font-weight-bold">Afiliados</div>
                        <div class="text-body-2 text-medium-emphasis">
                          Registro y administración de personas.
                        </div>
                      </v-card>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" class="pa-4" rounded="lg">
                        <v-icon size="32" color="primary" class="mb-2">mdi-fingerprint</v-icon>
                        <div class="font-weight-bold">Huellas</div>
                        <div class="text-body-2 text-medium-emphasis">
                          Validación biométrica segura.
                        </div>
                      </v-card>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" class="pa-4" rounded="lg">
                        <v-icon size="32" color="primary" class="mb-2">mdi-face-recognition</v-icon>
                        <div class="font-weight-bold">Rostro</div>
                        <div class="text-body-2 text-medium-emphasis">
                          Captura y verificación facial.
                        </div>
                      </v-card>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-card variant="tonal" class="pa-4" rounded="lg">
                        <v-icon size="32" color="primary" class="mb-2">mdi-shield-check</v-icon>
                        <div class="font-weight-bold">Seguridad</div>
                        <div class="text-body-2 text-medium-emphasis">
                          Control y trazabilidad de datos.
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </section>

        <section class="hero-section">
          <v-container>
            <div class="text-center mb-8">
              <h1 class="font-weight-bold text-primary mb-2">¿Por qué usar BioSys?</h1>
              <div class="text-body-1 text-medium-emphasis">
                Diseñado para prevenir la afiliación de personas fallecidas o que ya se encuentren
                registradas en otros partidos políticos.
              </div>
            </div>

            <v-row>
              <v-col cols="12" md="4">
                <v-card rounded="xl" elevation="2" class="pa-6 h-100">
                  <v-icon color="primary" size="36" class="mb-3">mdi-speedometer</v-icon>
                  <div class="text-h6 font-weight-bold mb-2">Procesos ágiles</div>
                  <p class="text-body-2 text-medium-emphasis">
                    Reduce tiempos de captura y validación de información.
                  </p>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="xl" elevation="2" class="pa-6 h-100">
                  <v-icon color="primary" size="36" class="mb-3">mdi-database-lock</v-icon>
                  <div class="text-h6 font-weight-bold mb-2">Datos protegidos</div>
                  <p class="text-body-2 text-medium-emphasis">
                    Manejo estructurado de datos con enfoque en seguridad.
                  </p>
                </v-card>
              </v-col>

              <v-col cols="12" md="4">
                <v-card rounded="xl" elevation="2" class="pa-6 h-100">
                  <v-icon color="primary" size="36" class="mb-3">mdi-chart-line</v-icon>
                  <div class="text-h6 font-weight-bold mb-2">Escalable</div>
                  <p class="text-body-2 text-medium-emphasis">
                    Preparado para crecer con más módulos y usuarios.
                  </p>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </section>

      </div>

      <v-footer class="footer">
        <v-container>
          <v-row align="center" justify="space-between">

            <!-- Logo / Nombre -->
            <v-col cols="12" md="4" class="text-center text-md-left">
              <div class="d-flex align-center justify-center justify-md-start">
                <v-icon color="primary" class="mr-2">mdi-fingerprint</v-icon>
                <span class="font-weight-bold text-primary text-h6">BioSys</span>
              </div>
              
            </v-col>

          

            <!-- Redes -->
            <v-col cols="12" md="4" class="text-center text-md-right">
              <v-btn icon>
                <v-icon>mdi-facebook</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
              <v-btn icon>
                <v-icon>mdi-linkedin</v-icon>
              </v-btn>
            </v-col>

          </v-row>

          <!-- Línea -->
          <v-divider class="my-4"></v-divider>

          <!-- Copyright -->
          <v-row justify="center">
            <v-col cols="12" class="text-center text-body-2 text-medium-emphasis">
              © 2026 BioSys. Todos los derechos reservados.
            </v-col>
          </v-row>

        </v-container>
      </v-footer>
    </v-container>


  </v-main>
</template>

<style scoped>
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: transparent;
}

.custom-carousel {
  width: 100%;
  height: 100vh;
}

/* Vuetify renderiza un <img> dentro de .v-img__img */
.carousel-image :deep(.v-img__img) {
  object-fit: fill !important;
  /* estira sin mantener proporción */
  width: 100%;
  height: 100%;
}

/* Asegura que el contenedor v-img también ocupe todo */
.carousel-image {
  width: 100%;
  height: 100%;
}

.landing-background {
  background: white;
}

.footer {
  background: white;
  padding-top: 20px;
  padding-bottom: 10px;
}
</style>