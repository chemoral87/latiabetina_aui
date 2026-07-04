<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card outlined class="pa-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">Nuevo artículo</div>
          <v-form ref="form" v-model="valid">
            <v-row dense>
              <v-col cols="12" md="6" v-if="showOrgSelect">
                <organization-select v-model="product.org_id" permission="product-insert" hide-one outlined dense required />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="product.name" label="Nombre" outlined dense required />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="product.sku" label="SKU" outlined dense />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="product.price" label="Precio" type="number" outlined dense required />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="product.stock" label="Stock" type="number" outlined dense required />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="product.description" label="Descripción" outlined dense rows="3" />
              </v-col>
            </v-row>
          </v-form>

          <div class="d-flex justify-end">
            <v-btn text @click="goBack">Cancelar</v-btn>
            <v-btn color="primary" class="ml-2" :loading="saving" @click="saveProduct">Guardar</v-btn>
          </div>
        </v-card>
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
      valid: true,
      saving: false,
      organizations: [],
      product: {
        org_id: null,
        name: '',
        sku: '',
        description: '',
        price: 0,
        stock: 0,
      },
    }
  },
  computed: {
    showOrgSelect() {
      const orgIds = this.$store.getters.permissions['product-insert']
      return Array.isArray(orgIds) && orgIds.length > 1
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Nuevo artículo',
      icon: 'mdi-package-variant',
      back: '/pos',
    })
    this.initializeForm()
    this.loadOrganizations()
  },
  methods: {
    initializeForm() {
      if (!this.product.org_id && !this.showOrgSelect) {
        const orgIds = this.$store.getters.permissions['product-insert']
        if (Array.isArray(orgIds) && orgIds.length === 1) {
          this.product.org_id = orgIds[0]
        }
      }
    },
    async loadOrganizations() {
      try {
        const response = await this.$repository.Organization.index({ itemsPerPage: -1 })
        this.organizations = response?.data || []
      } catch (error) {
        this.$handleError?.(error)
      }
    },
    goBack() {
      this.$router.push('/pos')
    },
    async saveProduct() {
      if (!this.product.org_id || !this.product.name) {
        return
      }

      try {
        this.saving = true
        await this.$repository.Product.create({
          ...this.product,
          price: Number(this.product.price || 0),
          stock: Number(this.product.stock || 0),
        })
        this.$router.push('/pos')
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
