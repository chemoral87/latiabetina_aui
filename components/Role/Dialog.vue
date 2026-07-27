<template>
  <v-dialog id="dlg-role-dialo-1" :value="true" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">{{ iconTitle }}</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small id="btn-role-dialog-close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-text-field id="tf-role-dialo-item-name-1" v-model="item.name" label="Nombre" :error-messages="errors.name" :disabled="loading" required
            autofocus @keyup.enter="save" />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" :disabled="loading" id="btn-role-dialog-cancel" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!isValid" id="btn-role-dialog-save" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "RoleDialog",

  props: {
    role: {
      type: Object,
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
        name: "",
      },
    }
  },

  computed: {
    isEditMode() {
      return !!this.item.id
    },

    iconTitle() {
      return "mdi-redhat"
    },

    formTitle() {
      return this.isEditMode ? "Editar Rol" : "Nuevo Rol"
    },

    errors() {
      const validationErrors = this.$store.getters["validation/errors"]
      return validationErrors || {}
    },

    isValid() {
      return this.item.name && this.item.name.trim().length > 0
    },
  },

  watch: {
    role: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          this.item = Object.assign({}, newValue)
        }
      },
      immediate: true,
      deep: true,
    },
  },

  mounted() {
    this.initializeForm()
  },

  methods: {
    initializeForm() {
      if (this.role && Object.keys(this.role).length > 0) {
        this.item = Object.assign({}, this.role)
      }
      // Limpiar errores de validación al inicializar
      this.$store.dispatch("validation/clearErrors")
    },

    close() {
      this.$emit("close")
    },

    save() {
      if (!this.isValid || this.loading) return

      this.$emit("save", Object.assign({}, this.item))
    },
  },
}
</script>
