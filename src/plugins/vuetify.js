import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1565c0',
          secondary: '#0d47a1',
          background: '#f4f8fb',
          surface: '#ffffff'
        }
      }
    }
  }
})