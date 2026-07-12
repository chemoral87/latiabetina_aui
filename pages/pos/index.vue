<template>
  <v-container fluid class="pos-page px-2 pt-2" :style="{ paddingBottom: footerHeight + 'px' }">

    <!-- Loading -->
    <div v-if="loadingProducts" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Product grid -->
    <v-row v-else dense>
      <v-col v-for="product in products" :key="product.id" cols="6" sm="4" md="3">
        <v-card outlined class="pos-product-card d-flex flex-column"
          :class="{ 'pos-product-card--in-cart': cartQty(product.id) > 0 }">

          <v-img :src="product.image_s3 || ''" height="140px" contain class="grey lighten-4 flex-shrink-0">
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-icon color="grey lighten-2" size="40">mdi-package-variant</v-icon>
              </v-row>
            </template>
            <v-chip v-if="cartQty(product.id) > 0" color="primary" dark small class="pos-cart-badge font-weight-bold">
              {{ cartQty(product.id) }}
            </v-chip>
          </v-img>

          <div class="px-2 pt-2 flex-grow-1">
            <div class="pos-info-row">
              <div class="pos-name text-body-2 font-weight-bold">{{ product.name }}</div>
              <div class="pos-price primary--text font-weight-black">${{ product.price }}</div>
            </div>
            <div v-if="product.stock < 5" class="text-caption font-weight-medium"
              :class="product.stock > 0 ? 'warning--text' : 'error--text'">
              {{ product.stock === 0 ? 'Sin stock' : `Solo ${product.stock} restantes` }}
            </div>
          </div>

          <div class="pos-card-controls">
            <v-btn v-if="cartQty(product.id) === 0" block depressed color="primary" class="pos-add-btn"
              :disabled="product.stock === 0" @click="addToCart(product)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <div v-else class="pos-qty-row">
              <v-btn fab small depressed color="error" class="pos-qty-btn" @click="decreaseCart(product)">
                <v-icon>mdi-minus</v-icon>
              </v-btn>
              <span class="pos-qty-number">{{ cartQty(product.id) }}</span>
              <v-btn fab small depressed color="success" class="pos-qty-btn" @click="addToCart(product)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn fab x-small outlined color="error" class="pos-qty-btn-delete" @click="removeProduct(product)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col v-if="products.length === 0" cols="12" class="text-center py-12">
        <v-icon color="grey lighten-1" size="56">mdi-package-variant-closed</v-icon>
        <div class="text-body-1 grey--text mt-2">Sin productos disponibles</div>
      </v-col>
    </v-row>

    <!-- ── Floating footer ── -->
    <div ref="posFooter" class="pos-footer">

      <!-- Toggle bar -->
      <div class="pos-footer-toggle-bar" @click="showCart = !showCart">
        <div class="d-flex align-center">
          <v-icon small class="mr-1" color="primary">mdi-cart</v-icon>
          <span class="text-caption font-weight-bold">
            {{ cartItemCount }} artículo(s)
          </span>
          <v-chip v-if="cart.length > 0" x-small color="primary" dark class="ml-2 font-weight-bold">
            ${{ total }}
          </v-chip>
        </div>
        <v-icon small :color="showCart ? 'primary' : 'grey'">
          {{ showCart ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
        </v-icon>
      </div>

      <!-- Cart table (collapsible) -->
      <div v-show="showCart" class="pos-cart-panel">
        <div v-if="cart.length === 0" class="text-caption grey--text pa-2 text-center">
          Sin artículos en el carrito
        </div>
        <table v-else class="pos-cart-table">
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th class="text-center">Cant.</th>
              <th class="text-right">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in cart" :key="item.product.id">
              <td class="pos-ct-name">{{ item.product.name }}</td>
              <td class="pos-ct-qty">
                <div class="d-flex align-center justify-center" style="gap:4px">
                  <v-btn icon x-small @click="changeQuantity(index, -1)">
                    <v-icon x-small>mdi-minus</v-icon>
                  </v-btn>
                  <span class="font-weight-bold">{{ item.quantity }}</span>
                  <v-btn icon x-small @click="changeQuantity(index, 1)">
                    <v-icon x-small>mdi-plus</v-icon>
                  </v-btn>
                </div>
              </td>
              <td class="pos-ct-total primary--text font-weight-bold">
                ${{ (item.product.price * item.quantity).toFixed(2) }}
              </td>
              <td class="pos-ct-del">
                <v-btn icon x-small @click="removeFromCart(index)">
                  <v-icon x-small color="error">mdi-close</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Fields + cobrar -->
      <div class="pos-footer-bottom">
        <div class="pos-footer-fields-row">
          <v-text-field v-model="customerName" label="Cliente" outlined dense hide-details class="pos-field" />
          <v-select v-model="paymentMethod" :items="paymentMethods" label="Método de pago" outlined dense hide-details
            class="pos-field" />
        </div>
        <div class="pos-footer-action-row">
          <div class="pos-total-block">
            <div class="text-caption grey--text">{{ cartItemCount }} artículo(s)</div>
            <div class="text-h5 font-weight-black primary--text">${{ total }}</div>
          </div>
          <v-btn color="primary" x-large block :loading="saving" :disabled="cart.length === 0" class="pos-cobrar-btn"
            @click="registerSale">
            <v-icon left>mdi-cash-register</v-icon>
            Cobrar
          </v-btn>
        </div>
      </div>

    </div>

  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },

  data() {
    return {
      products: [],
      loadingProducts: false,
      cart: [],
      showCart: false,
      customerName: '',
      paymentMethod: 'cash',
      paymentMethods: [
        { text: 'Efectivo', value: 'cash' },
        { text: 'Tarjeta', value: 'card' },
        { text: 'Transferencia', value: 'transfer' },
      ],
      saving: false,
      footerHeight: 160,
    }
  },

  computed: {
    total() {
      return this.cart
        .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
        .toFixed(2)
    },
    cartItemCount() {
      return this.cart.reduce((acc, item) => acc + item.quantity, 0)
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Punto de Venta',
      icon: 'mdi-point-of-sale',
    })
    this.loadProducts()
    this.$nextTick(() => {
      const footer = this.$refs.posFooter
      if (footer && typeof ResizeObserver !== 'undefined') {
        this.footerObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            this.footerHeight = entry.contentRect.height + 8
          }
        })
        this.footerObserver.observe(footer)
        this.footerHeight = footer.offsetHeight + 8
      }
    })
  },

  beforeDestroy() {
    if (this.footerObserver) {
      this.footerObserver.disconnect()
    }
  },

  methods: {
    async loadProducts() {
      this.loadingProducts = true
      try {
        const response = await this.$repository.Product.pos(null, { cacheMs: 500 })
        this.products = response?.data || []
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.loadingProducts = false
      }
    },

    cartQty(productId) {
      return this.cart.find((i) => i.product.id === productId)?.quantity ?? 0
    },

    addToCart(product) {
      const existing = this.cart.find((i) => i.product.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.cart.push({ product, quantity: 1 })
      }
    },

    decreaseCart(product) {
      const index = this.cart.findIndex((i) => i.product.id === product.id)
      if (index === -1) return
      if (this.cart[index].quantity <= 1) {
        this.cart.splice(index, 1)
      } else {
        this.cart[index].quantity -= 1
      }
    },

    removeProduct(product) {
      const index = this.cart.findIndex((i) => i.product.id === product.id)
      if (index !== -1) this.cart.splice(index, 1)
    },

    changeQuantity(index, delta) {
      const item = this.cart[index]
      if (!item) return
      const next = item.quantity + delta
      if (next <= 0) this.cart.splice(index, 1)
      else item.quantity = next
    },

    removeFromCart(index) {
      this.cart.splice(index, 1)
    },

    async registerSale() {
      if (this.cart.length === 0) return
      const orgId = this.cart[0]?.product?.org_id
      if (!orgId) return
      try {
        this.saving = true
        await this.$repository.Sale.create({
          org_id: orgId,
          customer_name: this.customerName || null,
          customer_phone: null,
          payment_method: this.paymentMethod,
          discount: 0,
          items: this.cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
        })
        this.cart = []
        this.customerName = ''
        this.paymentMethod = 'cash'
        this.showCart = false

        // this.loadProducts()
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.pos-page {
  padding-bottom: 16px;
}

/* ── Product card ── */
.pos-product-card {
  border-radius: 10px !important;
  overflow: hidden;
  transition: border-color 0.15s;
}

.pos-product-card--in-cart {
  border-color: #1976d2 !important;
  border-width: 2px !important;
}

.pos-cart-badge {
  position: absolute;
  top: 6px;
  right: 6px;
}

.pos-info-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px;
}

.pos-name {
  flex: 1;
  min-width: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pos-price {
  flex-shrink: 0;
  font-size: 0.95rem;
}

.pos-card-controls {
  padding: 8px;
}

.pos-add-btn {
  height: 44px !important;
  font-size: 1.1rem;
  border-radius: 8px !important;
}

.pos-qty-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pos-qty-btn {
  width: 38px !important;
  height: 38px !important;
}

.pos-qty-number {
  font-size: 1.4rem;
  font-weight: 900;
  min-width: 28px;
  text-align: center;
  color: #212121;
}

.pos-qty-btn-delete {
  width: 26px !important;
  height: 26px !important;
  margin-left: 2px;
}

/* ── Fixed footer ── */
.pos-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: #fff;
  border-top: 2px solid #e0e0e0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.13);
}

/* Toggle bar */
.pos-footer-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  user-select: none;
  background: #fafafa;
}

.pos-footer-toggle-bar:active {
  background: #f0f0f0;
}

/* Cart table panel */
.pos-cart-panel {
  max-height: 220px;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
}

.pos-cart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.pos-cart-table thead tr {
  background: #f5f5f5;
}

.pos-cart-table th {
  padding: 4px 8px;
  font-weight: 700;
  color: #555;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.pos-cart-table tbody tr:nth-child(even) {
  background: #fafafa;
}

.pos-cart-table td {
  padding: 4px 8px;
  vertical-align: middle;
}

.pos-ct-name {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pos-ct-qty {
  white-space: nowrap;
}

.pos-ct-total {
  text-align: right;
  white-space: nowrap;
}

.pos-ct-del {
  text-align: center;
  width: 28px;
}

/* Footer bottom */
.pos-footer-bottom {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pos-footer-fields-row {
  display: flex;
  gap: 8px;
}

.pos-field {
  flex: 1;
  min-width: 0;
}

.pos-footer-action-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pos-total-block {
  flex-shrink: 0;
  line-height: 1.1;
}

.pos-cobrar-btn {
  flex: 1;
  height: 52px !important;
  font-size: 1.1rem !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  letter-spacing: 0.03em !important;
}
</style>
