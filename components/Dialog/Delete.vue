<template>
  <v-dialog :value="true" persistent max-width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2" color="error">mdi-alert</v-icon>
        <span class="text-h5">{{ item.title }}</span>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="text-body-1 text--primary">
          {{ item.text }}
          <strong v-if="item.strong">{{ item.strong }}</strong>
          ?
        </div>
        <div class="text-caption grey--text mt-2">Esta acción no se puede deshacer</div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="grey" outlined :disabled="loading" @click="close">NO</v-btn>
        <v-btn color="primary" :loading="loading" @click="ok">SI</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "DialogDelete",

  props: {
    dialog: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      item: {
        title: "",
        text: "",
        strong: "",
        payload: null,
      },
    }
  },

  computed: {
    hasPayload() {
      return this.item.payload !== null && this.item.payload !== undefined
    },
  },

  watch: {
    dialog: {
      handler(newValue) {
        this.initializeDialog(newValue)
      },
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    this.initializeDialog(this.dialog)
  },

  methods: {
    initializeDialog(dialogData) {
      if (!dialogData) return

      this.item = {
        title: dialogData.title || "Confirmación",
        text: dialogData.text || "Confirmación",
        strong: dialogData.strong || "",
        payload: dialogData.payload !== undefined ? dialogData.payload : null,
      }
    },

    close() {
      if (this.loading) return
      this.$emit("close")
    },

    ok() {
      if (this.loading) return

      if (this.hasPayload) {
        this.$emit("ok", this.item.payload)
      } else {
        this.$emit("ok")
      }
    },
  },
}
</script>
