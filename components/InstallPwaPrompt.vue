<template>
  <div>
    <!-- Modal para Android (Chrome) -->
    <v-dialog v-model="showAndroidPrompt" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-cellphone-arrow-down</v-icon>
          Instalar Aplicación
        </v-card-title>
        <v-card-text class="pt-2">
          Instala esta aplicación en tu pantalla de inicio para un acceso rápido y una mejor experiencia a pantalla
          completa.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="grey" @click="dismissAndroid">Quizás más tarde</v-btn>
          <v-btn text color="primary" font-weight-bold @click="installAndroid">Instalar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal para iOS (Safari) -->
    <v-dialog v-model="showIosPrompt" max-width="400" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-apple</v-icon>
          Instalar en iOS
        </v-card-title>
        <v-card-text class="pt-2 pb-0">
          Para instalar esta app en tu iPhone/iPad y verla a pantalla completa:
          <ol class="mt-3 mb-3 ml-4">
            <li class="mb-2">Toca el botón <strong>Compartir</strong> <v-icon small>mdi-export-variant</v-icon> en la
              barra inferior de Safari.</li>
            <li>Desliza hacia abajo y selecciona <strong>"Agregar a inicio"</strong> <v-icon
                small>mdi-plus-box-outline</v-icon>.</li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="dismissIos">Entendido</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Floating button to trigger install if dismissed before -->
    <v-btn v-if="(deferredPrompt || isIosEligible) && !isStandalone && showFloatingButton" color="primary" fab small
      fixed bottom right style="bottom: 80px; z-index: 99;" @click="triggerPrompt">
      <v-icon>mdi-download</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: "InstallPwaPrompt",
  data() {
    return {
      deferredPrompt: null,
      showAndroidPrompt: false,
      showIosPrompt: false,
      isIosEligible: false,
      isStandalone: false,
      showFloatingButton: false,
    }
  },
  mounted() {
    // Determine if the app is already running in standalone mode (PWA)
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

    if(this.isStandalone) {
      return // Don't show anything if already installed
    }

    // Attempt to read from local storage to see if user dismissed it recently
    const dismissedAt = localStorage.getItem('pwaPromptDismissed')
    const now = new Date().getTime()
    const daysSinceDismissed = dismissedAt ? (now - parseInt(dismissedAt)) / (1000 * 3600 * 24) : null

    // If dismissed less than 7 days ago, only show the floating button, not the popup immediately
    const shouldAutoPrompt = !dismissedAt || daysSinceDismissed > 7

    // Listen for Chrome install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e

      if(shouldAutoPrompt) {
        this.showAndroidPrompt = true
      } else {
        this.showFloatingButton = true
      }
    })

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(userAgent)
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|mercury/.test(userAgent)

    if(isIos && isSafari && !this.isStandalone) {
      this.isIosEligible = true
      if(shouldAutoPrompt) {
        this.showIosPrompt = true
      } else {
        this.showFloatingButton = true
      }
    }
  },
  methods: {
    triggerPrompt() {
      if(this.deferredPrompt) {
        this.showAndroidPrompt = true
      } else if(this.isIosEligible) {
        this.showIosPrompt = true
      }
      this.showFloatingButton = false
    },
    dismissAndroid() {
      this.showAndroidPrompt = false
      this.showFloatingButton = true
      localStorage.setItem('pwaPromptDismissed', new Date().getTime().toString())
    },
    async installAndroid() {
      this.showAndroidPrompt = false
      if(this.deferredPrompt) {
        this.deferredPrompt.prompt()
        const { outcome } = await this.deferredPrompt.userChoice
        if(outcome === 'accepted') {
          console.log('User accepted the install prompt')
          this.showFloatingButton = false
        } else {
          console.log('User dismissed the install prompt')
          this.showFloatingButton = true
        }
        this.deferredPrompt = null
      }
    },
    dismissIos() {
      this.showIosPrompt = false
      this.showFloatingButton = true
      localStorage.setItem('pwaPromptDismissed', new Date().getTime().toString())
    }
  }
}
</script>
