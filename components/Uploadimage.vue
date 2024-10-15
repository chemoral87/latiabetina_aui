<template>
  <v-file-input v-bind="{ ...$props, ...$attrs }" v-model="image" accept="image/png, image/jpeg, image/bmp" prepend-icon="mdi-camera" @change="Preview_image"></v-file-input>
</template>
<script>
const loadImage = require("blueimp-load-image")
export default {
  name: "UploadImage",
  props: ["value", "img", "url", "encoded", "size"],
  data() {
    return {
      uri: null,
      image: null,
      blob: null,
      file: null,
      maxSize: 750, // max size for image upload after transform
      filename: "",
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
        this.image = null
        this.file = null
        this.filename = ""
      }
    },
  },
  mounted() {
    const me = this
    me.maxSize = me.size ? me.size : me.maxSize
  },
  methods: {
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
    Preview_image(e) {
      const me = this

      if (this.image == null) {
        this.uri = null
        this.blob = null
        this.filename = ""
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
              if (me.encoded == null || me.encoded === "blob") {
                me.blob = me.dataURItoBlob(img.toDataURL())
              }
              if (me.encoded === "base_64") {
                me.blob = img.toDataURL()
              }

              me.uri = img.toDataURL()
              me.$emit("update:url", me.uri)
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
