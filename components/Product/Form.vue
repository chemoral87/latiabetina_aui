<template>
  <v-card outlined class="pa-4">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">{{ icon }}</v-icon>
      <span class="text-h5">{{ formTitle }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="form" v-model="valid" @submit.prevent="save">
        <v-row dense>
          <v-col cols="12" md="6" v-if="showOrgSelect">
            <organization-select
              v-model="item.org_id"
              :permission="permission"
              outlined
              dense
              :disabled="loading"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="item.name"
              label="Nombre"
              outlined
              dense
              :error-messages="errors.name"
              required
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="item.sku"
              label="SKU"
              outlined
              dense
              :error-messages="errors.sku"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="item.price"
              label="Precio"
              type="number"
              placeholder="0"
              outlined
              dense
              :error-messages="errors.price"
              required
              class="no-spinners"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="item.stock"
              label="Stock"
              type="number"
              placeholder="0"
              outlined
              dense
              :error-messages="errors.stock"
              required
              class="no-spinners"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="item.order"
              label="Orden"
              type="number"
              placeholder="0"
              outlined
              dense
              :error-messages="errors.order"
              class="no-spinners"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-textarea
              v-model="item.description"
              label="Descripción"
              outlined
              dense
              rows="3"
              :error-messages="errors.description"
            />
          </v-col>

          <v-col cols="12" md="4">
            <MyUploadimage
              v-model="item.image_file"
              label="Imagen del producto"
              :url.sync="item.image"
              :disabled="loading"
              @loading="imageLoading = true"
              @change="imageLoading = false"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-switch v-model="item.hidden" label="Ocultar producto" dense />
          </v-col>

          <v-col cols="12" md="2">
            <v-switch v-model="item.requires_preparation" label="Requiere preparar" dense />
          </v-col>
        </v-row>

        <v-row v-if="previewImage || imageLoading">
          <v-col cols="12">
            <MyPreviewImage
              :src="previewImage"
              :loading="imageLoading"
              loading-text="Procesando imagen..."
            />
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
  name: 'ProductForm',

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
      default: 'product-insert',
    },
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: 'mdi-package-variant',
    },
  },

  data() {
    return {
      valid: true,
      imageLoading: false,
      item: {
        org_id: null,
        name: '',
        sku: '',
        description: '',
        hidden: false,
        requires_preparation: false,
        price: 0,
        stock: 0,
        order: 0,
        image: '',
        image_file: null,
      },
    }
  },

  computed: {
    previewImage() {
      if (this.item.image && typeof this.item.image === 'string' && this.item.image.startsWith('data:')) {
        return this.item.image
      }
      return this.item.image_s3 || this.item.image || ''
    },

    isEditMode() {
      return !!this.item.id
    },

    formTitle() {
      if (this.title) {
        return this.title
      }
      return this.isEditMode ? 'Editar producto' : 'Nuevo producto'
    },

    errors() {
      const validationErrors = this.$store.getters['validation/errors']
      return validationErrors ? { ...validationErrors } : {}
    },

    showOrgSelect() {
      const orgIds = this.$store.getters.permissions[this.permission]
      return Array.isArray(orgIds) && orgIds.length > 1
    },

    isValid() {
      return (
        !!this.item.org_id &&
        this.item.name &&
        this.item.name.trim().length > 0 &&
        !this.loading
      )
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

      this.$store.dispatch('validation/clearErrors')
    },

    close() {
      this.$emit('close')
    },

    save() {
      if (!this.isValid || this.loading) return

      const payload = {
        ...this.item,
        price: Number(this.item.price || 0),
        stock: Number(this.item.stock || 0),
        order: Number(this.item.order || 0),
      }

      this.$emit('save', payload)
    },
  },
}
</script>

<style scoped>
/* Remove number input spinners */
.no-spinners ::v-deep input[type='number']::-webkit-outer-spin-button,
.no-spinners ::v-deep input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinners ::v-deep input[type='number'] {
  -moz-appearance: textfield;
}
</style>
