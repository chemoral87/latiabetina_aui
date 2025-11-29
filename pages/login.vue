<template>
  <v-container>
    <v-layout align-center justify-center>
      <v-flex xs12 md5 lg6>
        <v-form @submit.prevent="submitLogin">
          <v-row dense>
            <v-col cols="12">
              <span class="text-h5">Inicio Sesión</span>
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="email" hide-details outlined autocomplete="username" label="Correo Electrónico" placeholder=" " persistent-placeholder :error-messages="errors ? errors?.email : []"></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="password"
                outlined
                autocomplete="current-password"
                label="Contraseña"
                placeholder=" "
                persistent-placeholder
                :error-messages="errors ? errors?.password : []"
                :append-icon="showned ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showned ? 'text' : 'password'"
                @click:append="showned = !showned"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-btn type="submit" color="primary" class="mr-2 mb-8">Iniciar Sesión</v-btn>
              <v-btn outlined color="primary" class="mr-2 mb-8" @click="$router.push('/forgot-password')">Recuperar contraseña</v-btn>
            </v-col>
            <v-col cols="12">
              <v-divider class="mb-4"></v-divider>
              <v-btn outlined color="red darken-1" block class="text-none" @click="loginWithGoogle">
                <v-icon left>mdi-google</v-icon>
                Continuar con Google
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
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
      icon: "lock",
      show_login: false,
    })
    this.name_secret = process.env.BASE_URL
    // this.name_secret = process.env.NAME_SECRET;

    // Maneja el callback de Google OAuth
    this.handleGoogleCallback()
  },

  methods: {
    loginWithGoogle() {
      // Redirige directamente sin hacer petición AJAX
      const baseUrl = process.env.BASE_URL || this.name_secret
      window.location.href = `${baseUrl}/auth/google/redirect`
    },
    async handleGoogleCallback() {
      // Verifica si hay un token en la URL (cuando Laravel redirige de vuelta)
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")
      const error = urlParams.get("error")

      if (error) {
        this.$store.dispatch("notify", { error: "Error al procesar la autenticación de Google" })
        window.history.replaceState({}, document.title, window.location.pathname)
        return
      }

      if (token) {
        try {
          // Guarda el token y obtiene el usuario
          this.$auth.setUserToken(token)
          await this.$auth.fetchUser()

          // Limpia la URL
          window.history.replaceState({}, document.title, window.location.pathname)

          // Redirige al dashboard o a la ruta solicitada
          this.$router.push({
            path: this.$route.query.redirect || "/",
          })
        } catch (error) {
          console.error("Error en el callback de Google:", error)
          this.$store.dispatch("notify", { error: "Error al procesar la autenticación de Google" })
          window.history.replaceState({}, document.title, window.location.pathname)
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
        this.$router.push({
          path: this.$route.query.redirect || "/",
        })
      } catch (e) {
        // console.log(e)
      }
    },
  },
}
</script>
