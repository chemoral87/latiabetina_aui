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
        await this.$repository.Product.update(this.product.id, payload)
        this.$router.push('/pos/products')
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
