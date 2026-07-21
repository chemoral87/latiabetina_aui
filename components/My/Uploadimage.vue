<template>
  <div>
    <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/bmp"
      style="display:none" @change="onFileSelected" />

    <v-btn small color="primary" :loading="loading" @click="triggerFilePicker">
      <v-icon left>mdi-camera</v-icon>
      {{ label || 'Seleccionar foto' }}
    </v-btn>

    <div v-if="loading" class="d-flex align-center justify-center mt-2 grey lighten-3 rounded" style="min-height: 80px">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <div v-else-if="filename" class="d-flex align-center mt-2">
      <v-chip small label color="primary" outlined class="mr-2">
        <v-icon x-small left>mdi-file-image</v-icon>
        {{ filename }}
      </v-chip>
      <v-btn small outlined color="error" @click="clearImage">
        <v-icon left x-small>mdi-close</v-icon>
        Limpiar
      </v-btn>
    </div>
    <div v-else @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop"
      class="d-flex flex-column align-center justify-center mt-2 rounded drop-zone"
      :class="{ 'drop-zone--active': dragOver }" style="min-height: 80px; cursor: pointer; border: 2px dashed #bdbdbd;"
      @click="triggerFilePicker">
      <v-icon :color="dragOver ? 'primary' : 'grey lighten-1'">mdi-cloud-upload-outline</v-icon>
      <span class="text-caption mt-1" :class="dragOver ? 'primary--text' : 'grey--text'">Arrastra el archivo aquí</span>
    </div>
  </div>
</template>
<script>
const loadImage = require("blueimp-load-image")
export default {
  name: "UploadImage",
  props: ["value", "img", "url", "encoded", "size", "label", "placeholder"],
  data() {
    return {
      uri: null,
      blob: null,
      file: null,
      maxSize: 750,
      filename: "",
      loading: false,
      dragOver: false,
    }
  },
  watch: {
    blob() {
      this.$emit("update:url", this.uri)
      this.$emit("update:filename", this.filename)
      this.$emit("update:file", this.file)
      this.$emit("input", this.blob)
      this.$emit("change")
    },
    value: function (val) {
      if (val == null) {
        this.file = null
        this.filename = ""
        this.uri = null
        this.blob = null
        this.$refs.fileInput.value = null
      }
    },
  },
  mounted() {
    if (this.size) {
      this.maxSize = this.size
    }
  },
  methods: {
    dataURItoBlob(dataURI) {
      const byteString = atob(dataURI.split(",")[1])
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    },
    triggerFilePicker() {
      this.$refs.fileInput.click()
    },
    processFile(file) {
      const me = this
      me.loading = true
      me.filename = file.name
      me.file = file
      me.$emit("loading")

      const _URL = window.URL || window.webkitURL
      const imgLoader = new Image()
      imgLoader.onload = function () {
        const ration = Math.sqrt((this.width * this.height) / (me.maxSize * me.maxSize))
        let _maxSize = this.width > this.height ? this.width / ration : this.height / ration
        _maxSize = Math.round(_maxSize)

        loadImage(
          file,
          function (img) {
            if (me.encoded == null || me.encoded === "blob") {
              me.blob = me.dataURItoBlob(img.toDataURL())
            }
            if (me.encoded === "base_64") {
              me.blob = img.toDataURL()
            }

            me.uri = img.toDataURL()
            me.$emit("update:url", me.uri)
            me.loading = false
          },
          {
            maxWidth: _maxSize,
            maxHeight: _maxSize,
            orientation: true,
            canvas: true,
          }
        )
      }
      const objectUrl = _URL.createObjectURL(file)
      imgLoader.src = objectUrl
    },
    onFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      this.processFile(file)
      // Reset input so selecting the same file again triggers change
      e.target.value = null
    },
    onDragOver() {
      this.dragOver = true
    },
    onDragLeave() {
      this.dragOver = false
    },
    onDrop(e) {
      this.dragOver = false
      const file = e.dataTransfer.files[0]
      if (!file) return
      if (!file.type.match(/^image\/(png|jpeg|bmp)$/)) return
      this.processFile(file)
    },
    clearImage() {
      this.uri = null
      this.blob = null
      this.filename = ""
      this.file = null
      this.$refs.fileInput.value = null
      this.$emit("input", null)
    },
  },
}
</script>
<style scoped>
.drop-zone {
  transition: background-color 0.2s, border-color 0.2s;
  background-color: #f5f5f5;
}
.drop-zone:hover {
  background-color: #eeeeee;
  border-color: #1976d2 !important;
}
.drop-zone--active {
  background-color: #e3f2fd !important;
  border-color: #1976d2 !important;
}
</style>
