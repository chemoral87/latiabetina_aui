<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <ProductForm
          :product="product"
          :loading="saving"
          permission="product-update"
          title="Editar artículo"
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
  meta: { permission: 'product-update' },
  components: {
    ProductForm,
  },
  async asyncData({ app, params }) {
    const product = await app.$repository.Product.show(params.id)
    return { product }
  },
  data() {
    return {
      saving: false,
      product: {},
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Editar artículo',
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
        await this.$repository.Product.update(this.product.id, payload)
        // Update store with the edited product
        const updated = { ...this.product, ...payload }
        this.$store.commit('products/UPDATE_PRODUCT', updated)
        this.$router.push('/pos/product')
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
