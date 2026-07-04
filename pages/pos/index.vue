<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-3">
          <div class="text-subtitle-1 font-weight-bold mb-3">Catálogo</div>
          <v-select
            v-model="selectedOrg"
            :items="organizations"
            item-text="name"
            item-value="id"
            label="Organización"
            outlined
            dense
            return-object
            @change="loadProducts"
          />
          <v-text-field v-model="filterProduct" label="Buscar artículo" append-icon="mdi-magnify" clearable dense outlined @input="loadProducts" />
          <div v-if="loadingProducts" class="text-center py-3">
            <v-progress-circular indeterminate color="primary" size="24" />
          </div>
          <v-list dense v-else>
            <v-list-item v-for="product in productsList" :key="product.id">
              <v-list-item-content>
                <v-list-item-title>{{ product.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ product.sku }} · stock {{ product.stock }} · ${{ product.price }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon color="primary" @click="addToCart(product)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined class="pa-3">
          <div class="text-subtitle-1 font-weight-bold mb-3">Venta</div>
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field v-model="customerName" label="Cliente" outlined dense />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="customerPhone" label="Teléfono" outlined dense />
            </v-col>
            <v-col cols="12" md="6">
              <v-select v-model="paymentMethod" :items="paymentMethods" label="Método" outlined dense />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="discount" label="Descuento" type="number" outlined dense />
            </v-col>
          </v-row>

          <v-simple-table dense>
            <thead>
              <tr>
                <th>Artículo</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio</th>
                <th class="text-right">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in cart" :key="item.product.id">
                <td>{{ item.product.name }}</td>
                <td class="text-center">
                  <v-btn icon x-small @click="changeQuantity(index, -1)"><v-icon>mdi-minus</v-icon></v-btn>
                  {{ item.quantity }}
                  <v-btn icon x-small @click="changeQuantity(index, 1)"><v-icon>mdi-plus</v-icon></v-btn>
                </td>
                <td class="text-right">${{ item.product.price }}</td>
                <td class="text-right">${{ item.product.price * item.quantity }}</td>
                <td class="text-right">
                  <v-btn icon small @click="removeFromCart(index)"><v-icon>mdi-delete</v-icon></v-btn>
                </td>
              </tr>
              <tr v-if="cart.length === 0">
                <td colspan="5" class="text-center py-4">No hay artículos agregados</td>
              </tr>
            </tbody>
          </v-simple-table>

          <v-divider class="my-3" />
          <div class="d-flex justify-space-between text-subtitle-1 font-weight-bold">
            <span>Subtotal</span>
            <span>${{ subtotal }}</span>
          </div>
          <div class="d-flex justify-space-between text-subtitle-1">
            <span>Descuento</span>
            <span>${{ discountValue }}</span>
          </div>
          <div class="d-flex justify-space-between text-h6 font-weight-bold mt-2">
            <span>Total</span>
            <span>${{ total }}</span>
          </div>

          <v-row class="mt-4" dense>
            <v-col cols="12" md="6">
              <v-btn color="primary" block large :loading="saving" :disabled="cart.length === 0 || !selectedOrg" @click="registerSale">
                Registrar venta
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-btn color="secondary" block large outlined @click="goToNewProduct">
                Nuevo artículo
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },
  data() {
    return {
      organizations: [],
      selectedOrg: null,
      products: [],
      filterProduct: '',
      loadingProducts: false,
      cart: [],
      customerName: '',
      customerPhone: '',
      paymentMethod: 'cash',
      paymentMethods: ['cash', 'card', 'transfer'],
      discount: 0,
      saving: false,
    }
  },
  computed: {
    productsList() {
      return this.products?.data || this.products || []
    },
    subtotal() {
      return this.cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
    },
    discountValue() {
      return Number(this.discount || 0).toFixed(2)
    },
    total() {
      return (Number(this.subtotal) - Number(this.discount || 0)).toFixed(2)
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Punto de Venta',
      icon: 'mdi-point-of-sale',
    })
    this.loadOrganizations()
  },
  methods: {
    async loadOrganizations() {
      try {
        const response = await this.$repository.Organization.index({ itemsPerPage: -1 })
        this.organizations = response?.data || []
      } catch (error) {
        this.$handleError?.(error)
      }
    },
    async loadProducts() {
      if (!this.selectedOrg?.id) {
        this.products = []
        return
      }

      this.loadingProducts = true
      try {
        const params = { org_id: this.selectedOrg.id, itemsPerPage: 100 }
        if (this.filterProduct) {
          params.filter = this.filterProduct
        }
        this.products = await this.$repository.Product.index(params)
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.loadingProducts = false
      }
    },
    addToCart(product) {
      const existing = this.cart.find((item) => item.product.id === product.id)
      if (existing) {
        existing.quantity += 1
        return
      }
      this.cart.push({ product, quantity: 1 })
    },
    changeQuantity(index, delta) {
      const item = this.cart[index]
      if (!item) return
      item.quantity = Math.max(1, item.quantity + delta)
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    goToNewProduct() {
      this.$router.push('/pos/new')
    },
    async registerSale() {
      if (!this.selectedOrg?.id) {
        return
      }

      try {
        this.saving = true
        const payload = {
          org_id: this.selectedOrg.id,
          customer_name: this.customerName || null,
          customer_phone: this.customerPhone || null,
          payment_method: this.paymentMethod,
          discount: Number(this.discount || 0),
          items: this.cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        }

        await this.$repository.Sale.create(payload)
        this.cart = []
        this.customerName = ''
        this.customerPhone = ''
        this.paymentMethod = 'cash'
        this.discount = 0
        this.$notify?.({ type: 'success', text: 'Venta registrada' })
        this.loadProducts()
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
