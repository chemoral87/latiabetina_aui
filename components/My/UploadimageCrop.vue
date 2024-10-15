<template>
  <div>
    <v-dialog v-model="dialog" width="500">
      <template #activator="{ on, attrs }">
        <v-btn small color="primary" v-bind="attrs" v-on="on">
          <v-icon class="mr-1">mdi-camera</v-icon>
          {{ $attrs.label }}
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="px-2 py-0 text-subtitle-1 text--primary">
          {{ $attrs.label }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-file-input v-model="image" :placeholder="$attrs.placeholder" accept="image/png, image/jpeg, image/bmp" prepend-icon="mdi-camera" @change="fileInputChange" />
            </v-col>
            <v-col cols="6">
              <cropper stencil-component="circle-stencil" :src="uri" @change="changeCropper" />
            </v-col>
            <v-col cols="6">
              <img class="image-cropper" style="max-width: 100%; min-height: 120px" :src="image_to_upload" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" outlined @click="cancelUpload()">Limpiar</v-btn>
          <v-btn color="primary" outlined @click="close()">Cancelar</v-btn>
          <v-btn color="primary" @click="dialog = false">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <img class="image-cropper" :style="{ maxHeight: computedMaxHeight }" :src="displayedImage" />
  </div>
</template>
<script>
const loadImage = require("blueimp-load-image")
export default {
  props: ["value", "size", "photo", "maxHeight"],
  data() {
    return {
      // blob: null,
      blob_cropped: null,
      dialog: false,
      uri: null,
      image: null,
      image_to_upload: "",
    }
  },
  computed: {
    computedMaxHeight() {
      return this.maxHeight || "200px"
    },
    displayedImage() {
      return this.image_to_upload || this.photo
    },
  },
  watch: {
    value: {
      handler(val) {
        if (val == null) this.cancelUpload()
      },
    },
  },
  mounted() {},
  methods: {
    close() {
      this.dialog = false
    },
    cancelUpload() {
      this.image = this.uri = this.image_to_upload = this.blob_cropped = null
      // this.dialog = false;
      this.$emit("input", this.blob_cropped)
    },
    changeCropper({ canvas }) {
      // const date = new Date()
      // const timestamp = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()

      this.image_to_upload = canvas.toDataURL()
      canvas.toBlob((blob) => {
        this.blob_cropped = blob
        this.$emit("input", this.blob_cropped)
      })
    },

    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      const byteString = atob(dataURI.split(",")[1])
      // separate out the mime component
      const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
      // write the bytes of the string to an ArrayBuffer
      const ab = new ArrayBuffer(byteString.length)
      // create a view into the buffer
      const ia = new Uint8Array(ab)
      // set the bytes of the buffer to the correct values
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      // write the ArrayBuffer to a blob, and you're done
      const blob = new Blob([ab], { type: mimeString })
      return blob
    },
    fileInputChange(e) {
      const me = this

      if (this.image == null) {
        this.cancelUpload()
      } else {
        const _URL = window.URL || window.webkitURL
        const imgLoader = new Image()
        imgLoader.onload = function () {
          const ration = Math.sqrt((this.width * this.height) / (me.maxSize * me.maxSize))
          let _maxSize = this.width > this.height ? this.width / ration : this.height / ration
          _maxSize = Math.round(_maxSize)

          loadImage(
            me.image,
            function (img, data) {
              // if (me.encoded == null || me.encoded == "blob") {
              //   me.blob = me.dataURItoBlob(img.toDataURL());
              // }
              // if (me.encoded == "base_64") {
              //   me.blob = img.toDataURL();
              // }

              me.uri = img.toDataURL()
              // me.$emit("update:url", me.uri);
            },
            {
              maxWidth: _maxSize,
              maxHeight: _maxSize,
              orientation: true,
              canvas: true,
            } // Options
          )
        }
        const objectUrl = _URL.createObjectURL(this.image)
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
</style>
