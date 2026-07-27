<template>
  <div>
    <input type="file" ref="fileInput" accept="image/png, image/jpeg, image/bmp"
      style="display:none" @change="onFileSelected" />

    <v-btn small color="primary" :loading="loading" id="btn-my-uploadimagecrop-pick" @click="triggerFilePicker">
      <v-icon left>mdi-camera</v-icon>
      {{ label || 'Subir foto' }}
    </v-btn>

    <div v-if="loading" class="d-flex align-center justify-center mt-2 grey lighten-3 rounded" style="min-height: 80px">
      <v-progress-circular indeterminate color="primary" size="24" />
    </div>
    <div v-else-if="filename" class="d-flex align-center mt-2">
      <v-chip small label color="primary" outlined class="mr-2">
        <v-icon x-small left>mdi-file-image</v-icon>
        {{ filename }}
      </v-chip>
      <v-btn small outlined color="error" id="btn-my-uploadimagecrop-clear" @click="clearImage">
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

    <v-dialog id="dlg-my-uploa-1" :value="dialog" persistent max-width="520px">
      <v-card>
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
          <v-icon left small color="primary">mdi-crop</v-icon>
          {{ label || 'Recortar foto' }}
          <v-spacer />
          <v-btn icon x-small id="btn-my-uploadimagecrop-close" @click="cancel()">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <cropper v-if="uri" stencil-component="circle-stencil" :src="uri" @change="changeCropper" />
              <div v-else class="d-flex align-center justify-center grey lighten-3 rounded" style="height: 160px">
                <v-icon large color="grey lighten-1">mdi-image-plus</v-icon>
              </div>
            </v-col>
            <v-col cols="6">
              <div v-if="image_to_upload" class="d-flex align-center justify-center grey lighten-4 rounded-circle"
                style="width: 160px; height: 160px; overflow: hidden;">
                <img style="max-width: 100%; min-height: 120px; border-radius: 50%;" :src="image_to_upload" />
              </div>
              <div v-else class="d-flex align-center justify-center grey lighten-3 rounded-circle"
                style="width: 160px; height: 160px;">
                <v-icon large color="grey lighten-1">mdi-image-off-outline</v-icon>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn color="primary" outlined class="mr-2" id="btn-my-uploadimagecrop-cancel" @click="cancel()">
            <v-icon left>mdi-close</v-icon>
            Cancelar
          </v-btn>
          <v-btn color="primary" id="btn-my-uploadimagecrop-save" @click="save()">
            <v-icon left>mdi-content-save</v-icon>
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const loadImage = require("blueimp-load-image")
export default {
  components: {
    Cropper,
  },
  props: ["value", "url", "size", "label"],
  data() {
    return {
      blob_cropped: null,
      dialog: false,
      uri: null,
      image_to_upload: "",
      savedBlob: null,
      savedImageToUpload: "",
      filename: "",
      loading: false,
      maxSize: 750,
      dragOver: false,
    }
  },
  watch: {
    dialog(val) {
      if (val) {
        this.savedBlob = this.blob_cropped
        this.savedImageToUpload = this.image_to_upload
      }
    },
    value: {
      handler(val) {
        if (val == null) this.clearImage()
      },
    },
  },
  mounted() {
    if (this.size) {
      this.maxSize = this.size
    }
  },
  methods: {
    save() {
      this.$emit("input", this.blob_cropped)
      this.$emit("update:url", this.image_to_upload)
      this.dialog = false
    },
    triggerFilePicker() {
      this.$refs.fileInput.click()
    },
    onFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      this.fileInputChange(file)
      // Reset input so selecting the same file triggers change
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
      this.fileInputChange(file)
    },
    cancel() {
      this.uri = null
      this.image_to_upload = this.savedImageToUpload
      this.blob_cropped = this.savedBlob
      this.dialog = false
    },
    clearImage() {
      this.uri = null
      this.image_to_upload = null
      this.blob_cropped = null
      this.filename = ""
      this.$refs.fileInput.value = null
      this.$emit("input", null)
    },
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
    changeCropper({ canvas }) {
      this.image_to_upload = canvas.toDataURL()
      this.blob_cropped = this.dataURItoBlob(this.image_to_upload)
    },
    fileInputChange(file) {
      const me = this

      if (!file) {
        this.uri = null
        this.image_to_upload = null
        this.blob_cropped = null
        this.filename = ""
      } else {
        me.loading = true
        me.filename = file.name

        const _URL = window.URL || window.webkitURL
        const imgLoader = new Image()
        imgLoader.onload = function () {
          const ration = Math.sqrt((this.width * this.height) / (me.maxSize * me.maxSize))
          let _maxSize = this.width > this.height ? this.width / ration : this.height / ration
          _maxSize = Math.round(_maxSize)

          loadImage(
            file,
            function (img) {
              me.uri = img.toDataURL()
              me.dialog = true
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
      }
    },
  },
}
</script>
<style scoped>
.image-cropper {
  border-radius: 50%;
}
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
