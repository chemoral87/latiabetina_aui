<template>
  <v-dialog :value="true" persistent max-width="500px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-text-field
            v-model="item.folio_number"
            label="Número de Folio"
            :error-messages="errors.folio_number"
            :disabled="loading"
            required
            autofocus
          />
          <v-text-field
            v-model="item.date"
            label="Fecha"
            type="date"
            :error-messages="errors.date"
            :disabled="loading"
            required
            @keyup.enter="save"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!isValid" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConsolidationDialog",

  props: {
    sheet: {
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
        folio_number: "",
        date: "",
      },
    }
  },

  computed: {
    isEditMode() {
      return !!this.item.id
    },

    iconTitle() {
      return this.isEditMode ? "mdi-pencil" : "mdi-plus"
    },

    formTitle() {
      return this.isEditMode ? "Editar Consolidado" : "Nuevo Consolidado"
    },

    errors() {
      const validationErrors = this.$store.getters["validation/errors"]
      return validationErrors || {}
    },

    isValid() {
      return this.item.folio_number && this.item.date
    },
  },

  watch: {
    sheet: {
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
      if (this.sheet && Object.keys(this.sheet).length > 0) {
        this.item = Object.assign({}, this.sheet)
      } else {
        // Default to today
        const today = new Date().toISOString().substr(0, 10);
        this.item.date = today;
      }
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
