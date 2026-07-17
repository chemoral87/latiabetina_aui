<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <ProductForm :product="product" :loading="saving" permission="product-insert" title="Nuevo Producto"
          icon="mdi-package-variant" @save="saveProduct" @close="goBack" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'product-insert' },

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
      back: '/pos/product',
    })
  },
  methods: {
    goBack() {
      this.$router.push('/pos/product')
    },
    async saveProduct(payload) {
      try {
        this.saving = true
        if (payload.org_id && typeof payload.org_id === 'object') {
          payload.org_id = payload.org_id.id
        }
        const created = await this.$repository.Product.create(payload)
        // Update store with the new product
        const product = created?.data || created
        if (product) {
          this.$store.commit('products/ADD_PRODUCT', product)
        }
        this.$router.push('/pos/product')
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
