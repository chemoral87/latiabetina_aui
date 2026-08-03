<template>
  <v-container fluid class="pa-6">
    <!-- Page header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center mb-1">
          <v-icon x-large color="primary" class="mr-3">mdi-flask</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold mb-0">Componentes My</h1>
            <span class="text-subtitle-1 grey--text text--darken-1">Banco de pruebas &mdash; 8 componentes para testear y comparar</span>
          </div>
        </div>
        <v-divider class="mt-2" />
      </v-col>
    </v-row>

    <!-- ─── Row 1 – Date & Time ─────────────────────────────────── -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-3 primary--text">
          <v-icon left color="primary">mdi-calendar-clock</v-icon>
          Fecha y Hora
        </h2>
      </v-col>

      <!-- DatePicker -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-1" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="blue">mdi-calendar</v-icon>
            MyDatePicker
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <MyDatePicker v-model="date" label="Selecciona una fecha" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption grey--text mr-2">Valor:</span>
              <v-chip small :color="date ? 'success' : 'grey lighten-3'" dark label class="font-weight-mono">
                {{ date || "null" }}
              </v-chip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption grey--text mr-2">Mostrar:</span>
              <v-chip small color="primary" outlined label>
                {{ formattedDate || "—" }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0 px-4 pb-3">
            <v-btn id="btn-my-date-clear" small outlined color="error" @click="date = null">
              <v-icon x-small left>mdi-close</v-icon>
              Limpiar
            </v-btn>
            <v-btn id="btn-my-date-today" small outlined color="primary" @click="date = '2026-07-21'">
              <v-icon x-small left>mdi-calendar-today</v-icon>
              Hoy
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- DateRange -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-2" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="blue">mdi-calendar-range</v-icon>
            MyDateRange
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <MyDateRange v-model="dateRange" label="Rango de fechas" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption grey--text mr-2">Valor:</span>
              <v-chip small :color="dateRange.length ? 'success' : 'grey lighten-3'" dark label class="font-weight-mono">
                {{ dateRange.length ? dateRange.join(" ~ ") : "[]" }}
              </v-chip>
            </div>
            <div class="mt-2 d-flex align-center">
              <span class="text-caption grey--text mr-2">Mostrar:</span>
              <v-chip small color="primary" outlined label>
                {{ formattedDateRange || "—" }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0 px-4 pb-3">
            <v-btn id="btn-my-daterange-clear" small outlined color="error" @click="dateRange = []">
              <v-icon x-small left>mdi-close</v-icon>
              Limpiar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- TimePicker -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-3" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="blue">mdi-clock-outline</v-icon>
            MyTimePicker
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <MyTimePicker v-model="time" label="Selecciona hora" dense outlined />
            <div class="mt-3 d-flex align-center">
              <span class="text-caption grey--text mr-2">Valor (24h):</span>
              <v-chip small :color="time ? 'success' : 'grey lighten-3'" dark label class="font-weight-mono">
                {{ time || "null" }}
              </v-chip>
            </div>
          </v-card-text>
          <v-card-actions class="pt-0 px-4 pb-3">
            <v-btn id="btn-my-time-clear" small outlined color="error" @click="time = null">
              <v-icon x-small left>mdi-close</v-icon>
              Limpiar
            </v-btn>
            <v-btn id="btn-my-time-set" small outlined color="primary" @click="time = '14:30'">
              <v-icon x-small left>mdi-clock</v-icon>
              14:30
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- ─── Row 2 – Image & Upload ──────────────────────────────── -->
    <v-row class="mt-2">
      <v-col cols="12">
        <h2 class="text-h5 mb-3 primary--text">
          <v-icon left color="primary">mdi-image</v-icon>
          Imágenes y Subida
        </h2>
      </v-col>

      <!-- PreviewImage -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-4" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="green">mdi-image-eye</v-icon>
            MyPreviewImage
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <MyPreviewImage :src="previewSrc" :loading="previewLoading" :delay-seconds="previewDelay" max-height="160" />
            <div class="mt-3">
              <v-text-field id="tf-my-index-previewsrc-1" v-model="previewSrc" label="URL de imagen" dense outlined hide-details placeholder="https://..." />
            </div>
            <div class="mt-2 d-flex align-center">
              <v-switch v-model="previewLoading" dense hide-details label="Forzar loading" class="mt-0 pt-0 mr-3" />
              <v-text-field id="tf-my-index-delay-s-2" v-model.number="previewDelay" label="Delay (s)" dense outlined hide-details style="max-width: 100px" type="number" min="0" max="10" />
            </div>
          </v-card-text>
          <v-card-actions class="pt-0 px-4 pb-3">
            <v-btn id="btn-my-preview-load" small outlined color="primary" @click="previewSrc = 'https://picsum.photos/seed/test/400/300'">
              <v-icon x-small left>mdi-image</v-icon>
              Cargar ejemplo
            </v-btn>
            <v-btn id="btn-my-preview-clear" small outlined color="error" @click="previewSrc = ''">
              <v-icon x-small left>mdi-close</v-icon>
              Limpiar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Uploadimage -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-5" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="info">mdi-camera</v-icon>
            MyUploadimage
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <p class="text-caption grey--text mb-1">Sube una imagen (se redimensiona automáticamente)</p>
            <MyUploadimage v-model="uploadBlob" :url.sync="uploadUrl" :filename.sync="uploadFilename" :file.sync="uploadFile" :size="750" @loading="uploadLoading = true" />
            <div v-if="uploadUrl" class="mt-2">
              <v-img :src="uploadUrl" max-height="80" contain class="rounded mb-2" />
              <!--     <v-chip small label color="primary" outlined>
                {{ uploadFilename || "imagen" }}
              </v-chip>  -->
            </div>
            <div v-if="uploadBlob && !uploadUrl" class="mt-2 text-caption grey--text">
              <v-progress-circular indeterminate size="16" width="2" class="mr-2" />
              Procesando...
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- UploadimageCrop -->
      <v-col cols="12" md="4">
        <v-card id="card-my-index-6" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="green">mdi-image-crop</v-icon>
            MyUploadimageCrop
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <p class="text-caption grey--text mb-1">Sube y recorta en círculo</p>
            <MyUploadimageCrop v-model="cropBlob" :url.sync="cropUrl" label="Seleccionar foto" />
            <div v-if="cropUrl" class="mt-2">
              <v-img :src="cropUrl" height="80" width="80" class="rounded-circle mb-2" />
            </div>
            <div v-if="cropBlob && !cropUrl" class="mt-2 text-caption grey--text">
              <v-progress-circular indeterminate size="16" width="2" class="mr-2" />
              Procesando...
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ─── Row 3 – Panel & Overlay ─────────────────────────────── -->
    <v-row class="mt-2">
      <v-col cols="12">
        <h2 class="text-h5 mb-3 primary--text">
          <v-icon left color="primary">mdi-layers</v-icon>
          Paneles y Diálogos
        </h2>
      </v-col>

      <!-- DragPanel -->
      <v-col cols="12" md="6">
        <v-card id="card-my-index-7" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="orange">mdi-drag</v-icon>
            MyDragPanel
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <p class="text-caption grey--text mb-3">Panel flotante que se puede arrastrar. Aparece animado desde abajo.</p>
            <v-row dense>
              <v-col cols="auto">
                <v-btn id="btn-my-drag-open" color="primary" @click="dragPanelVisible = true">
                  <v-icon left>mdi-window-maximize</v-icon>
                  Abrir panel
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn id="btn-my-drag-close" color="error" outlined @click="dragPanelVisible = false">
                  <v-icon left>mdi-close</v-icon>
                  Cerrar
                </v-btn>
              </v-col>
            </v-row>
            <div class="mt-2 text-caption">
              Estado:
              <v-chip x-small :color="dragPanelVisible ? 'success' : 'grey'" text-color="white" label>
                {{ dragPanelVisible ? "Visible" : "Oculto" }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Loading -->
      <v-col cols="12" md="6">
        <v-card id="card-my-index-8" elevation="4" hover class="rounded-lg h-100">
          <v-card-title class="py-3 text-subtitle-1 font-weight-bold">
            <v-icon left color="orange">mdi-loading</v-icon>
            MyLoading
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-4">
            <p class="text-caption grey--text mb-3">Overlay de carga con spinner y mensaje personalizable.</p>
            <v-row dense>
              <v-col cols="auto">
                <v-btn id="btn-my-loading-show" color="primary" @click="triggerLoading">
                  <v-icon left>mdi-play</v-icon>
                  Mostrar 3s
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn id="btn-my-loading-close" color="error" outlined @click="loadingVisible = false">
                  <v-icon left>mdi-stop</v-icon>
                  Cerrar
                </v-btn>
              </v-col>
            </v-row>
            <v-text-field id="tf-my-index-loadingmessage-3" v-model="loadingMessage" label="Mensaje" dense outlined hide-details class="mt-2" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ═══════════════ Floating components ═══════════════ -->

    <!-- DragPanel instance -->
    <MyDragPanel v-model="dragPanelVisible" title="Panel de prueba" right="20px" bottom="80px">
      <v-card-text class="pa-4">
        <p class="text-body-2 mb-2">
          <strong>¡Puedes arrastrarme!</strong>
          Tira de la barra azul para moverme por la pantalla.
        </p>
        <v-divider class="mb-2" />
        <div class="d-flex align-center mb-2">
          <v-icon small class="mr-2">mdi-calendar</v-icon>
          <span class="text-caption">Fecha: {{ formattedDate || "—" }}</span>
        </div>
        <div class="d-flex align-center mb-2">
          <v-icon small class="mr-2">mdi-clock</v-icon>
          <span class="text-caption">Hora: {{ time || "—" }}</span>
        </div>
        <v-btn id="btn-my-dragpanel-close" block small outlined color="error" @click="dragPanelVisible = false" class="mt-2">
          <v-icon x-small left>mdi-close</v-icon>
          Cerrar panel
        </v-btn>
      </v-card-text>
    </MyDragPanel>

    <!-- Loading overlay -->
    <MyLoading :value="loadingVisible" :message="loadingMessage" progress-color="white" />

    <!-- ─── State Observer (debug panel) ──────────────────────── -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card id="card-my-index-9" elevation="2" class="rounded-lg">
          <v-card-title class="py-2 text-subtitle-2 font-weight-bold grey lighten-3">
            <v-icon left small>mdi-code-json</v-icon>
            Estado global de los componentes
            <v-spacer />
            <v-btn id="btn-my-reset-all" x-small outlined @click="resetAll">
              <v-icon x-small left>mdi-restore</v-icon>
              Resetear todo
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-3">
            <pre class="mb-0" style="font-size: 0.8rem; max-height: 240px; overflow-y: auto">{{ stateDump }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "PageMyIndex",
  middleware: ["authenticated"],

  data() {
    return {
      // ── Date & Time ──
      date: null,
      dateRange: [],
      time: null,

      // ── Images & Upload ──
      previewSrc: "",
      previewLoading: false,
      previewDelay: 0,
      uploadBlob: null,
      uploadUrl: null,
      uploadFilename: "",
      uploadFile: null,
      uploadLoading: false,
      cropBlob: null,
      cropUrl: null,

      // ── Panels & Overlays ──
      dragPanelVisible: false,
      loadingVisible: false,
      loadingMessage: "Cargando…",
      loadingTimer: null,
    }
  },

  computed: {
    formattedDate() {
      if (!this.date) return null
      try {
        const [year, month, day] = this.date.split("-")
        if (!year || !month || !day) return this.date
        const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
        return `${day}/${monthNames[parseInt(month, 10) - 1]}/${year}`
      } catch {
        return this.date
      }
    },

    formattedDateRange() {
      if (!this.dateRange || this.dateRange.length === 0) return null
      const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
      const format = (d) => {
        const [year, month, day] = d.split("-")
        if (!year || !month || !day) return d
        return `${day}/${monthNames[parseInt(month, 10) - 1]}/${year}`
      }
      return [...this.dateRange].sort().map(format).join(" ~ ")
    },

    stateDump() {
      const dump = {
        date: this.date,
        dateRange: this.dateRange,
        time: this.time,
        previewSrc: this.previewSrc ? this.previewSrc.substring(0, 60) + "…" : null,
        previewLoading: this.previewLoading,
        uploadFilename: this.uploadFilename,
        uploadBlobSize: this.uploadBlob?.size ?? null,
        cropBlobSize: this.cropBlob?.size ?? null,
        dragPanelVisible: this.dragPanelVisible,
        loadingVisible: this.loadingVisible,
      }
      return JSON.stringify(dump, null, 2)
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "My Components Test",
      icon: "mdi-flask-outline",
      showDrawer: true,
    })
  },

  methods: {
    triggerLoading() {
      this.loadingVisible = true
      this.loadingTimer = setTimeout(() => {
        this.loadingVisible = false
      }, 3000)
    },

    resetAll() {
      this.date = null
      this.dateRange = []
      this.time = null
      this.previewSrc = ""
      this.previewLoading = false
      this.previewDelay = 0
      this.uploadBlob = null
      this.uploadUrl = null
      this.uploadFilename = ""
      this.uploadFile = null
      this.uploadLoading = false
      this.cropBlob = null
      this.cropUrl = null
      this.dragPanelVisible = false
      this.loadingVisible = false
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
        this.loadingTimer = null
      }
    },
  },

  beforeDestroy() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer)
      this.loadingTimer = null
    }
  },
}
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.font-weight-mono {
  font-family: "SF Mono", "Consolas", "Liberation Mono", monospace;
  font-size: 0.75rem;
}

.v-card.hover {
  transition: box-shadow 0.25s ease, transform 0.2s ease;
}

.v-card.hover:hover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14) !important;
  transform: translateY(-2px);
}

pre {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e9ecef;
}
</style>
