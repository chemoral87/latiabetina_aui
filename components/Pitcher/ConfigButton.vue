<template>
  <div>
    <v-btn class="mr-1 settings-btn-glow" @click="settingsDialog = true">
      <v-icon left>mdi-cog</v-icon>
      Config
    </v-btn>
    <v-dialog v-model="settingsDialog" max-width="500px">
      <v-card>
        <v-card-title>
          Configuración v2.023
          <v-spacer></v-spacer>
          <v-btn icon @click="settingsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <!-- Microfono Section -->
            <v-col cols="12">
              <h3 class="text-center py-0 my-0">Micrófono</h3>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="sensitivity" :min="0.0001" :max="0.01" :step="0.0001" label="Sensibilidad" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ sensitivity.toFixed(4) }}
              </div>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row dense>
            <!-- Histograma Section -->
            <v-col cols="12">
              <h3 class="text-center py-0 my-0">Histograma</h3>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch v-model="latinNotation" label="Notación latina" hide-details class="mt-0 pt-0"></v-switch>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch v-model="showMicrotones" :label="latinNotation ? 'Mostrar microtonos' : 'Show microtones'" hide-details class="mt-0 pt-0"></v-switch>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="maxHistory" :min="300" :max="800" :step="50" label="Máx Historial" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ maxHistory }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="totalNotes" :min="13" :max="25" :step="1" label="# Notas" hide-details thumb-label />
              <div class="text-center font-weight-bold">
                {{ totalNotes }}
              </div>
            </v-col>
            <v-col cols="12" sm="6">
              <v-slider v-model="histogramHeight" :min="250" :max="450" :step="25" label="Altura Histograma" hide-details thumb-label />
              <div class="text-center font-weight-bold">{{ histogramHeight }}px</div>
            </v-col>
          </v-row>
          <v-divider class="my-4"></v-divider>
          <v-row dense>
            <!-- Pentagrama Section -->
            <v-col cols="12">
              <h3 class="text-center py-0 my-0">Pentagrama</h3>
            </v-col>
            <v-col cols="12" sm="6">
              <v-switch v-model="ghostQuarterNote" label="Mostrar nota fantasma" hide-details class="mt-0 pt-0"></v-switch>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="settingsDialog = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "PitcherConfigButton",
  data() {
    return {
      settingsDialog: false,
    }
  },
  computed: {
    latinNotation: {
      get() {
        return this.$store.state.pitcher_store.latinNotation
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_LATIN_NOTATION", value)
      },
    },
    showMicrotones: {
      get() {
        return this.$store.state.pitcher_store.showMicrotones
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_SHOW_MICROTONES", value)
      },
    },
    ghostQuarterNote: {
      get() {
        return this.$store.state.pitcher_store.ghostQuarterNote
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_GHOST_QUARTER_NOTE", value)
      },
    },
    sensitivity: {
      get() {
        return this.$store.state.pitcher_store.sensitivity
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_SENSITIVITY", value)
      },
    },
    maxHistory: {
      get() {
        return this.$store.state.pitcher_store.maxHistory
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_MAX_HISTORY", value)
      },
    },
    totalNotes: {
      get() {
        return this.$store.state.pitcher_store.totalNotes
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_TOTAL_NOTES", value)
      },
    },
    histogramHeight: {
      get() {
        return this.$store.state.pitcher_store.histogramHeight
      },
      set(value) {
        this.$store.commit("pitcher_store/SET_HISTOGRAM_HEIGHT", value)
      },
    },
  },
}
</script>
<style scoped>
.settings-btn-glow {
  animation: glow-pulse 2s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.8), 0 0 30px rgba(33, 150, 243, 0.6);
  }
}
</style>
