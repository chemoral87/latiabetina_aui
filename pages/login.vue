<template>
  <v-container>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md6 lg4>
        <v-card flat class="pa-6">
          <v-form @submit.prevent="submitLogin">
            <v-row dense>
              <v-col cols="12" class="text-center mb-4">
                <span class="text-h5">Inicio de Sesión</span>
              </v-col>

              <!-- Botón de Google primero -->
              <v-col cols="12">
                <v-btn outlined block large class="text-none mb-4"
                  style="border-color: #dadce0; color: #3c4043; background-color: white" @click="loginWithGoogle">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"
                    style="width: 18px; height: 18px; margin-right: 12px" />
                  Acceder con Google
                </v-btn>
              </v-col>

              <!-- Separador -->
              <v-col cols="12" class="d-flex align-center my-3">
                <v-divider></v-divider>
                <span class="px-3 grey--text text--darken-1">o</span>
                <v-divider></v-divider>
              </v-col>

              <!-- Campos de login -->
              <v-col cols="12">
                <v-text-field v-model="email" outlined dense autocomplete="username"
                  label="Dirección de correo electrónico" :error-messages="errors ? errors?.email : []"></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="password" outlined dense autocomplete="current-password" label="Contraseña"
                  :error-messages="errors ? errors?.password : []" :append-icon="showned ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showned ? 'text' : 'password'" @click:append="showned = !showned"></v-text-field>
              </v-col>

              <v-col cols="12" class="text-right">
                <a href="#" class="text-decoration-none" @click.prevent="$router.push('/forgot-password')">Olvidé mi
                  contraseña</a>
              </v-col>

              <v-col cols="12" class="">
                <v-btn type="submit" color="primary" block large class="text-none">Ingresar</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  middleware: ["guest"],
  data() {
    return {
      email: "",
      password: "",
      showned: false, // mostrar password
      name_secret: "",
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: `Inicio Sesión`,
      icon: "mdi-lock",
      show_login: false,
    })
    this.name_secret = process.env.BASE_URL
    // this.name_secret = process.env.NAME_SECRET;

    // Maneja el callback de Google OAuth
    this.handleGoogleCallback()
  },

  methods: {
    loginWithGoogle() {
      // Obtiene el redirect del query param o localStorage
      const redirect = this.$route.query.redirect || localStorage.getItem("loginRedirect")
      
      // Redirige al backend con el redirect como query param
      const baseUrl = process.env.BASE_URL || this.name_secret
      let googleRedirectUrl = `${baseUrl}/auth/google/redirect`
      
      if (redirect) {
        googleRedirectUrl += `?redirect=${encodeURIComponent(redirect)}`
        // También guarda en localStorage como backup
        localStorage.setItem("loginRedirect", redirect)
      }
      
      window.location.href = googleRedirectUrl
    },
    async handleGoogleCallback() {
      // Verifica si hay un token en la URL (cuando Laravel redirige de vuelta)
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")
      const redirect = urlParams.get("redirect") // Ahora viene desde el backend
      const error = urlParams.get("error")

      if(error) {
        window.history.replaceState({}, document.title, window.location.pathname)
        localStorage.removeItem("loginRedirect")
        return
      }

      if(token) {
        try {
          // Guarda el token
          this.$auth.setUserToken(token)
          
          // Intenta obtener el usuario, pero no falla si hay error
          try {
            await this.$auth.fetchUser()
          } catch(fetchError) {
            // Si falla fetchUser, continuamos de todas formas
            console.warn("Warning fetching user:", fetchError)
          }

          // Limpia la URL
          window.history.replaceState({}, document.title, window.location.pathname)

          // Usa el redirect del query param (viene del backend) o localStorage como fallback
          const redirectPath = redirect || localStorage.getItem("loginRedirect") || "/"
          
          // Limpia los redirects guardados
          localStorage.removeItem("loginRedirect")
          this.$store.dispatch("clearLoginRedirect")

          // Redirige con delay para asegurar que auth module termine de procesar
          setTimeout(() => {
            this.$router.push({
              path: redirectPath,
            })
          }, 100)
        } catch(error) {
          // Silent error handling - don't show notification
          window.history.replaceState({}, document.title, window.location.pathname)
          localStorage.removeItem("loginRedirect")
          console.error("Error during Google login:", error)
        }
      }
    },
    async submitLogin() {
      // this.$gtag.event("login", { method: "Google" })
      try {
        const credentials = {
          email: this.email,
          password: this.password,
        }
        await this.$auth.loginWith("laravelJWT", { data: credentials })
        // eslint-disable-next-line no-console
        
        // Obtiene el redirect de localStorage o query param
        const redirectFromStorage = localStorage.getItem("loginRedirect")
        const redirectPath = redirectFromStorage || this.$route.query.redirect || "/"
        
        // Limpia los redirects guardados
        this.$store.dispatch("clearLoginRedirect")
        localStorage.removeItem("loginRedirect")
        
        this.$router.push({
          path: redirectPath,
        })
      } catch(e) {
        // console.log(e)
      }
    },
  },
}
</script>
