<template>
  <v-dialog :value="true" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="error">mdi-alert</v-icon>
        {{ item.title }}
        <v-spacer />
        <v-btn icon x-small @click="close">
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

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="error" outlined class="mr-2" :disabled="loading" @click="close">
          <v-icon left>mdi-close</v-icon>
          NO
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="ok">
          <v-icon left>mdi-check</v-icon>
          SI
        </v-btn>
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
