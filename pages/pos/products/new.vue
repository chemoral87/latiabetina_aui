<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <ProductForm
          :product="product"
          :loading="saving"
          permission="product-insert"
          title="Nuevo Producto"
          icon="mdi-package-variant"
          @save="saveProduct"
          @close="goBack"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ProductForm from '@/components/Product/Form.vue'

export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'product-insert' },
  components: {
    ProductForm,
  },
  data() {
    return {
      saving: false,
      product: {
        org_id: null,
        name: '',
        sku: '',
        description: '',
        hidden: false,
        requires_preparation: false,
        price: 0,
        stock: 0,
        image: '',
        image_file: null,
      },
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Nuevo Producto',
      icon: 'mdi-package-variant',
      back: '/pos/products',
    })
  },
  methods: {
    goBack() {
      this.$router.push('/pos/products')
    },
    async saveProduct(payload) {
      try {
        this.saving = true
        if (payload.org_id && typeof payload.org_id === 'object') {
          payload.org_id = payload.org_id.id
        }
        await this.$repository.Product.create(payload)
        this.$router.push('/pos/products')
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        }
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
