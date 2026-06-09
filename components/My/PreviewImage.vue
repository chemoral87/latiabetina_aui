<template>
  <v-expand-transition>
    <div v-if="loading || isWaiting" class="image-loading-wrapper">
      <v-progress-circular indeterminate color="primary" :size="size" />
      <span v-if="loadingText" class="ml-3 grey--text text--darken-1">{{ loadingText }}</span>
    </div>
    <v-img v-else-if="imageReady && src" :src="src" :max-height="maxHeight" contain>
      <template #placeholder>
        <v-row class="fill-height ma-0" align="center" justify="center">
          <v-progress-circular indeterminate color="primary" />
        </v-row>
      </template>
    </v-img>
  </v-expand-transition>
</template>

<script>
export default {
  name: "MyPreviewImage",
  props: {
    src: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false,
    },
    loadingText: {
      type: String,
      default: "Procesando imagen…",
    },
    maxHeight: {
      type: [String, Number],
      default: 200,
    },
    size: {
      type: [String, Number],
      default: 48,
    },
    delaySeconds: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      imageReady: false,
      previewTimer: null,
    }
  },

  computed: {
    isWaiting() {
      return !!this.src && !this.imageReady
    },
  },

  watch: {
    src: {
      handler() {
        this.scheduleImagePreview()
      },
      immediate: true,
    },
    loading() {
      this.scheduleImagePreview()
    },
    delaySeconds() {
      this.scheduleImagePreview()
    },
  },

  beforeDestroy() {
    this.clearPreviewTimer()
  },

  methods: {
    clearPreviewTimer() {
      if(this.previewTimer) {
        clearTimeout(this.previewTimer)
        this.previewTimer = null
      }
    },

    scheduleImagePreview() {
      this.clearPreviewTimer()
      this.imageReady = false

      if(this.loading || !this.src) return

      const delay = Math.max(Number(this.delaySeconds) || 0, 0) * 1000
      if(delay === 0) {
        this.imageReady = true
        return
      }

      this.previewTimer = setTimeout(() => {
        this.imageReady = true
        this.previewTimer = null
      }, delay)
    },
  },
}
</script>

<style scoped>
.image-loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
}
</style>
