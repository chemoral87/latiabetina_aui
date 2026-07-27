<template>
  <v-dialog id="dlg-testi-dialo-1" :value="true" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">mdi-comment-text-outline</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small id="btn-testimony-dialog-close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-row dense>
            <v-col cols="12">
              <organization-select v-model="item.org_id" permission="testimony-index" hide-one outlined
                prepend-inner-icon="mdi-domain" :disabled="loading || isEditMode" :rules="[$vrules.required]" />
            </v-col>
            <v-col cols="12">
              <v-text-field id="tf-testi-dialo-item-name-1" v-model="item.name" label="Nombre" prepend-inner-icon="mdi-account-outline"
                :error-messages="errors.name" :disabled="loading" required autofocus @keyup.enter="save" />
            </v-col>
            <v-col cols="12">
              <v-text-field id="tf-testi-dialo-item-phone_number-2" v-model="item.phone_number" label="Teléfono" prepend-inner-icon="mdi-phone"
                :error-messages="errors.phone_number" :disabled="loading" />
            </v-col>
            <v-col cols="12">
              <v-text-field id="tf-testi-dialo-categoriesstring-3" v-model="categoriesString" label="Categorías (coma separadas)"
                prepend-inner-icon="mdi-tag-multiple-outline" :disabled="loading" />
            </v-col>
            <v-col cols="12">
              <v-text-field id="tf-testi-dialo-item-link-4" v-model="item.link" label="Enlace" prepend-inner-icon="mdi-link"
                :disabled="loading" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="item.description" label="Descripción" rows="4"
                prepend-inner-icon="mdi-text-box-outline" :error-messages="errors.description"
                :disabled="loading" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" :disabled="loading" id="btn-testimony-dialog-cancel" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!isValid" id="btn-testimony-dialog-save" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "TestimonyDialog",
  props: {
    testimony: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      item: {
        id: null,
        name: "",
        phone_number: "",
        categories: [],
        link: null,
        description: "",
        org_id: null,
      },
    }
  },
  computed: {
    isEditMode() {
      return !!this.item.id
    },
    formTitle() {
      return this.isEditMode ? "Editar Testimonio" : "Nuevo Testimonio"
    },
    errors() {
      const validationErrors = this.$store.getters["validation/errors"]
      return validationErrors || {}
    },
    isValid() {
      return this.item.name && this.item.name.trim().length > 0 && this.item.org_id
    },
    categoriesString: {
      get() {
        return Array.isArray(this.item.categories) ? this.item.categories.join(", ") : ""
      },
      set(v) {
        this.item.categories = v
          .split(",")
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
              name: "",
              phone_number: "",
              categories: [],
              link: null,
              description: "",
              org_id: null,
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
