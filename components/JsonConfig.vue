<template>
  <v-card outlined class="mb-4 pa-2">
    <div class="text-caption mb-2 font-weight-bold">Configuración</div>
    <v-btn x-small color="success" block class="mb-2" @click="exportConfiguration">
      <v-icon left x-small>mdi-download</v-icon>
      Exportar JSON
    </v-btn>
    <v-btn x-small color="info" block @click="triggerImport">
      <v-icon left x-small>mdi-upload</v-icon>
      Importar JSON
    </v-btn>
    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="onFileChange" />
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
  },
  methods: {
    exportConfiguration() {
      // Deep clone and remove category: "Ninguno" if present
      const cleaned = JSON.parse(JSON.stringify(this.configData))
      
      // Remove metadata and settings as requested
      delete cleaned.version
      delete cleaned.timestamp
      delete cleaned.settings

      if (Array.isArray(cleaned.sections)) {
        cleaned.sections.forEach((section) => {
          if (!Array.isArray(section.subsections)) return
          section.subsections.forEach((sub) => {
            if (!Array.isArray(sub.seats)) return
            sub.seats.forEach((row) => {
              if (!Array.isArray(row)) return
              row.forEach((seat) => {
                if (seat && seat.category === "Ninguno") delete seat.category
              })
            })
          })
        })
      }

      const jsonStr = JSON.stringify(cleaned, null, 2)
      const blob = new Blob([jsonStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `auditorio-config-${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    triggerImport() {
      this.$refs.fileInput.click()
    },
    onFileChange(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result)
          this.$emit("imported", config)
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
