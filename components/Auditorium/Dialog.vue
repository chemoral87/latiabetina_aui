<template>
  <v-dialog :value="true" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">mdi-seat</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-row dense>
            <v-col v-if="!isEditMode" cols="12">
              <organization-select v-model="item.org_id" class="mb-2" hide-details :permission="'auditorium-index'" hide-one outlined :rules="[$vrules.required]" dense />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="item.name" dense label="Nombre" :error-messages="errors.name" :disabled="loading" required autofocus @keyup.enter="save" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" :disabled="loading" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!isValid" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AuditoriumDialog",

  props: {
    auditorium: {
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
        org_id: null,
      },
    }
  },

  computed: {
    isEditMode() {
      return !!this.item.id
    },

    formTitle() {
      return this.isEditMode ? "Editar Auditorio" : "Nuevo Auditorio"
    },

    errors() {
      const validationErrors = this.$store?.getters?.["validation/errors"]
      return validationErrors || {}
    },

    isValid() {
      if (!(this.item.name && this.item.name.trim().length > 0)) return false
      return this.isEditMode || !!this.item.org_id
    },
  },

  watch: {
    auditorium: {
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
    this.$store?.dispatch?.("validation/clearErrors")
  },

  methods: {
    initializeForm() {
      if (this.auditorium && Object.keys(this.auditorium).length > 0) {
        this.item = Object.assign({}, this.auditorium)
      }
    },

    close() {
      this.$emit("close")
    },

    save() {
      if (!this.isValid || this.loading) return
      const payload = Object.assign({}, this.item)
      if (this.isEditMode) {
        delete payload.org_id
      }
      this.$emit("save", payload)
    },
  },
}
</script>
