<template>
  <v-card outlined class="mb-4 pa-2">
    <div class="text-caption mb-2 font-weight-bold">Importar / Exportar</div>
    <v-btn x-small :color="saveFormat === 'csv' ? 'success' : 'success'" block class="mb-2" @click="exportConfiguration">
      <v-icon left x-small>{{ saveFormat === 'csv' ? 'mdi-file-delimited' : 'mdi-code-json' }}</v-icon>
      Exportar {{ saveFormat === 'csv' ? 'CSV' : 'JSON' }}
    </v-btn>
    <v-btn x-small color="info" block @click="triggerImport">
      <v-icon left x-small>mdi-upload</v-icon>
      Importar {{ saveFormat === 'csv' ? 'CSV' : 'JSON' }}
    </v-btn>
    <input ref="fileInput" type="file" :accept="fileAccept" style="display: none" @change="onFileChange" />
  </v-card>
</template>

<script>
export default {
  name: "JsonConfig",
  props: {
    configData: {
      type: Object,
      required: true,
    },
    configDataCsv: {
      type: String,
      default: "",
    },
    saveFormat: {
      type: String,
      default: "json",
      validator: (v) => ["json", "csv"].includes(v),
    },
  },
  computed: {
    fileAccept() {
      return this.saveFormat === "csv" ? ".csv,text/csv,text/plain" : ".json,application/json"
    },
  },
  methods: {
    exportConfiguration() {
      if (this.saveFormat === "csv") {
        this._exportCsv()
      } else {
        this._exportJson()
      }
    },

    _exportCsv() {
      const csvStr = this.configDataCsv
      if (!csvStr) {
        this.$emit("import-error", new Error("No CSV data available"))
        return
      }
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" })
      this._downloadBlob(blob, `auditorio-config-${Date.now()}.csv`)
    },

    _exportJson() {
      // Deep clone and remove transient metadata
      const cleaned = JSON.parse(JSON.stringify(this.configData))
      delete cleaned.version
      delete cleaned.timestamp
      delete cleaned.settings

      // Strip category: "Ninguno" from seats
      if (Array.isArray(cleaned.s)) {
        cleaned.s.forEach((section) => {
          if (!Array.isArray(section.ss)) return
          section.ss.forEach((sub) => {
            if (!Array.isArray(sub.s)) return
            sub.s.forEach((row) => {
              if (!Array.isArray(row)) return
              row.forEach((seat) => {
                if (seat && seat.k === "Ninguno") delete seat.k
              })
            })
          })
        })
      }

      const jsonStr = JSON.stringify(cleaned, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      this._downloadBlob(blob, `auditorio-config-${Date.now()}.json`)
    },

    _downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    triggerImport() {
      // Reset so re-selecting the same file fires the change event
      this.$refs.fileInput.value = ""
      this.$refs.fileInput.click()
    },

    onFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target.result

          if (this.saveFormat === "csv") {
            // Emit the raw CSV string — editor handles parsing
            this.$emit("imported", text)
          } else {
            const config = JSON.parse(text)
            this.$emit("imported", config)
          }
        } catch (err) {
          this.$emit("import-error", err)
        } finally {
          event.target.value = ""
        }
      }
      reader.readAsText(file)
    },
  },
}
</script>

<style scoped></style>
