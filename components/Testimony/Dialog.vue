<template>
  <v-dialog :value="true" persistent max-width="600px">
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
          <v-text-field v-model="item.name" label="Nombre" :error-messages="errors.name" :disabled="loading" required autofocus @keyup.enter="save" />
          <v-text-field v-model="item.phone_number" label="Teléfono" :error-messages="errors.phone_number" :disabled="loading" />
          <v-text-field v-model="categoriesString" label="Categorías (coma separadas)" :disabled="loading" />
          <v-text-field v-model="item.link" label="Enlace" :disabled="loading" />
          <v-textarea v-model="item.description" label="Descripción" rows="4" :error-messages="errors.description" :disabled="loading" />
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
  name: 'TestimonyDialog',
  props: {
    testimony: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      item: {
        id: null,
        name: '',
        phone_number: '',
        categories: [],
        link: null,
        description: '',
      },
    }
  },
  computed: {
    isEditMode() {
      return !!this.item.id
    },
    iconTitle() {
      return this.isEditMode ? 'mdi-pencil' : 'mdi-plus'
    },
    formTitle() {
      return this.isEditMode ? 'Editar Testimonio' : 'Nuevo Testimonio'
    },
    errors() {
      const validationErrors = this.$store.getters['validation/errors']
      return validationErrors || {}
    },
    isValid() {
      return this.item.name && this.item.name.trim().length > 0
    },
    categoriesString: {
      get() {
        return Array.isArray(this.item.categories) ? this.item.categories.join(', ') : ''
      },
      set(v) {
        this.item.categories = v
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      },
    },
  },
  watch: {
    testimony: {
      handler(newValue) {
        if (newValue && Object.keys(newValue).length > 0) {
          this.item = Object.assign(
            {
              id: null,
              name: '',
              phone_number: '',
              categories: [],
              link: null,
              description: '',
            },
            newValue
          )
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
      if (this.testimony && Object.keys(this.testimony).length > 0) {
        this.item = Object.assign({}, this.testimony)
      }
      this.$store.dispatch('validation/clearErrors')
    },
    close() {
      this.$emit('close')
    },
    save() {
      if (!this.isValid || this.loading) return
      this.$emit('save', Object.assign({}, this.item))
    },
  },
}
</script>

<style scoped></style>
