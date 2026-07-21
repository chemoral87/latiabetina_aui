<template>
  <v-form ref="form" v-model="valid" @submit.prevent="save">
    <!-- Section 1: Información básica -->
    <v-row dense>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-information-outline</v-icon>
            Información del producto
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col v-if="showOrgSelect" cols="12">
                <organization-select v-model="item.org_id" :permission="permission" outlined dense :disabled="loading" />
              </v-col>

              <v-col cols="12">
                <v-text-field v-model="item.name" label="Nombre" outlined dense :error-messages="errors.name" required />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field v-model="item.sku" label="SKU" outlined dense :error-messages="errors.sku" />
              </v-col>

              <v-col cols="12">
                <v-textarea v-model="item.description" label="Descripción" outlined dense rows="3" :error-messages="errors.description" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section 2: Precio, existencias e imagen -->
    <v-row dense class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-currency-usd</v-icon>
            Precio y existencias
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <!-- Left column: numeric fields -->
              <v-col cols="12" md="6">
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="item.price" label="Precio" type="number" placeholder="0" outlined dense :error-messages="errors.price" required class="no-spinners" />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field v-model="item.stock" label="Stock" type="number" placeholder="0" outlined dense :error-messages="errors.stock" required class="no-spinners" />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field v-model="item.order" label="Orden" type="number" placeholder="0" outlined dense :error-messages="errors.order" class="no-spinners" />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="d-flex align-center">
                      <v-icon small class="mr-2" color="grey darken-1">mdi-eye</v-icon>
                      <v-switch v-model="item.hidden" label="Ocultar producto" dense hide-details />
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="d-flex align-center">
                      <v-icon small class="mr-2" color="grey darken-1">mdi-chef-hat</v-icon>
                      <v-switch v-model="item.requires_preparation" label="Requiere preparar" dense hide-details />
                    </div>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Right column: image -->
              <v-col cols="12" md="6">
                <div class="text-caption font-weight-medium mb-1 grey--text text--darken-1">
                  <v-icon small class="mr-1">mdi-image-outline</v-icon>
                  Imagen del producto
                </div>
                <MyUploadimage v-model="item.image_file" label="Seleccionar imagen" :url.sync="item.image" :disabled="loading" @loading="imageLoading = true" @change="imageLoading = false" />

                <div v-if="previewImage || imageLoading" class="mt-2">
                  <MyPreviewImage :src="previewImage" :loading="imageLoading" loading-text="Procesando imagen..." />
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Section 4: Acciones -->
    <v-row dense class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-text class="d-flex justify-end pa-4 flex-wrap">
            <v-btn color="primary" outlined class="mr-2 mb-2 mb-sm-0" :disabled="loading || imageLoading" @click="close">
              <v-icon left>mdi-close</v-icon>
              Cancelar
            </v-btn>
            <v-btn color="primary" :loading="loading" :disabled="!isValid || imageLoading" @click="save">
              <v-icon left>mdi-content-save</v-icon>
              Guardar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
export default {
  name: "ProductForm",

  props: {
    product: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    permission: {
      type: String,
      default: "product-insert",
    },
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: "mdi-package-variant",
    },
  },

  data() {
    return {
      valid: true,
      imageLoading: false,
      item: {
        org_id: null,
        name: "",
        sku: "",
        description: "",
        hidden: false,
        requires_preparation: false,
        price: 0,
        stock: 0,
        order: 0,
        image: "",
        image_file: null,
      },
    }
  },

  computed: {
    previewImage() {
      if (this.item.image && typeof this.item.image === "string" && this.item.image.startsWith("data:")) {
        return this.item.image
      }
      return this.item.image_s3 || this.item.image || ""
    },

    isEditMode() {
      return !!this.item.id
    },

    formTitle() {
      if (this.title) {
        return this.title
      }
      return this.isEditMode ? "Editar producto" : "Nuevo producto"
    },

    errors() {
      const validationErrors = this.$store.getters["validation/errors"]
      return validationErrors ? { ...validationErrors } : {}
    },

    showOrgSelect() {
      const orgIds = this.$store.getters.permissions[this.permission]
      return Array.isArray(orgIds) && orgIds.length > 1
    },

    isValid() {
      return !!this.item.org_id && this.item.name && this.item.name.trim().length > 0 && !this.loading
    },
  },

  watch: {
    product: {
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
      if (this.product && Object.keys(this.product).length > 0) {
        this.item = Object.assign({}, this.product)
      }

      if (!this.item.org_id && !this.showOrgSelect) {
        const orgIds = this.$store.getters.permissions[this.permission]
        if (Array.isArray(orgIds) && orgIds.length === 1) {
          this.item.org_id = orgIds[0]
        }
      }

      this.$store.dispatch("validation/clearErrors")
    },

    close() {
      this.$emit("close")
    },

    save() {
      if (!this.isValid || this.loading) return

      const payload = {
        ...this.item,
        price: Number(this.item.price || 0),
        stock: Number(this.item.stock || 0),
        order: Number(this.item.order || 0),
      }

      this.$emit("save", payload)
    },
  },
}
</script>

<style scoped>
/* Remove number input spinners */
.no-spinners ::v-deep input[type="number"]::-webkit-outer-spin-button,
.no-spinners ::v-deep input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners ::v-deep input[type="number"] {
  -moz-appearance: textfield;
}
</style>
