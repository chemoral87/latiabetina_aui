<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">{{ iconTitle }}</v-icon>
      <span class="text-h5">{{ formTitle }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="form" @submit.prevent="save">


        <v-row>
          <v-col cols="12" md="3">
            <organization-select v-model="item.org_id" hide-one :permission="permission" outlined
              :rules="[$vrules.required]" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="item.name" label="Nombre Evento" :error-messages="errors.name" :disabled="loading"
              required autofocus @keyup.enter="save" />
          </v-col>
          <v-col cols="12" md="3">
            <v-textarea v-model="item.description" label="Descripción" :error-messages="errors.description"
              :disabled="loading" rows="1" />
          </v-col>

          <v-col cols="12" md="3">
            <MyDatePicker v-model="item.start_date" label="Fecha Publicación" :error-messages="errors.start_date"
              :disabled="loading" required />
          </v-col>
          <v-col cols="12" md="3">
            <MyDatePicker v-model="item.end_date" label="Fecha Evento" :error-messages="errors.end_date"
              :disabled="loading" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="item.time_start" label="Hora" type="time" :error-messages="errors.time_start"
              :disabled="loading" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="item.location" label="Lugar" :error-messages="errors.location" :disabled="loading" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" md="6">
            <MyUploadimage v-model="item.image_file" label="Imagen del evento" :url.sync="item.url_image"
              :disabled="loading" @loading="imageLoading = true" @change="imageLoading = false" />
          </v-col>
        </v-row>

        <v-row v-if="item.url_image || imageLoading">
          <v-col cols="12">
            <v-expand-transition>
              <div v-if="imageLoading" class="image-loading-wrapper">
                <v-progress-circular indeterminate color="primary" size="48" />
                <span class="ml-3 grey--text text--darken-1">Procesando imagen…</span>
              </div>
              <v-img v-else :src="previewImage" max-height="200" contain />
            </v-expand-transition>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" text :disabled="loading || imageLoading" @click="close">Cancelar</v-btn>
      <v-btn color="primary" :loading="loading" :disabled="!isValid || imageLoading" @click="save">Guardar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "ChurchEventForm",

  props: {
    churchEvent: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    permission: {
      type: String,
      default: "church-event-index",
    },
  },

  data() {
    return {
      imageLoading: false,
      item: {
        name: "",
        org_id: null,
        description: "",
        start_date: "",
        end_date: "",
        time_start: "",
        location: "",
        url_image: "",
        image_file: null,
      },
    }
  },

  computed: {
    previewImage() {
      if(this.item.url_image && typeof this.item.url_image === 'string' && this.item.url_image.startsWith('data:')) {
        return this.item.url_image
      }
      return this.item.url_image_s3
    },

    isEditMode() {
      return !!this.item.id
    },

    iconTitle() {
      return this.isEditMode ? "mdi-pencil" : "mdi-plus"
    },

    formTitle() {
      return this.isEditMode ? "Editar" : "Nuevo"
    },

    errors() {
      const validationErrors = this.$store.getters["validation/errors"]
      return validationErrors || {}
    },

    isValid() {
      return this.item.name && this.item.name.trim().length > 0 && this.item.start_date && this.item.org_id
    },
  },

  watch: {
    churchEvent: {
      handler(newValue) {
        if(newValue && Object.keys(newValue).length > 0) {
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
      if(this.churchEvent && Object.keys(this.churchEvent).length > 0) {
        this.item = Object.assign({}, this.churchEvent)
      }
      this.$store.dispatch("validation/clearErrors")
    },

    close() {
      this.$emit("close")
    },

    save() {
      if(!this.isValid || this.loading) return

      this.$emit("save", Object.assign({}, this.item))
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
