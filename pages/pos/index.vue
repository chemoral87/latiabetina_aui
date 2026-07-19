<template>
  <v-container fluid id="pos-page" class="pos-page px-2 pt-2" :style="{ paddingBottom: footerHeight + 'px' }">

    <!-- Loading -->
    <div id="pos-loading" v-if="loadingProducts" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- View toggle + Product grid/list -->
    <div v-else>
      <div id="pos-view-toggle" class="pos-view-toggle mb-2">
        <v-btn-toggle v-model="viewMode" mandatory dense color="primary" background-color="grey lighten-3">
          <v-btn small value="grid" icon><v-icon>mdi-view-grid</v-icon></v-btn>
          <v-btn small value="list" icon><v-icon>mdi-view-list</v-icon></v-btn>
        </v-btn-toggle>
        <v-tooltip top>
          <template #activator="{ on }">
            <v-btn small icon class="ml-2 pos-stock-toggle" :color="showStock ? 'blue' : 'blue darken-3'" v-on="on"
              @click="showStock = !showStock">
              <v-icon>{{ showStock ? 'mdi-package-variant' : 'mdi-package-variant-closed' }}</v-icon>
            </v-btn>
          </template>
          <span>{{ showStock ? 'Ocultar stock' : 'Mostrar stock' }}</span>
        </v-tooltip>
      </div>

      <!-- GRID VIEW -->
      <div id="pos-grid-view" v-if="viewMode === 'grid'">
        <PosProductGrid :products="products" :cart="cart" :show-stock="showStock" @add="addToCart"
          @decrease="decreaseCart" @remove="removeProduct" />
      </div>

      <!-- LIST VIEW -->
      <div id="pos-list-view" v-if="viewMode === 'list'">
        <PosProductList :products="products" :cart="cart" :show-stock="showStock" @add="addToCart"
          @decrease="decreaseCart" @remove="removeProduct" />
      </div>

      <!-- Footer -->
      <PosCartFooter ref="posFooterEl" :cart="cart" :show-cart="showCart" :customer-name="customerName"
        :payment-method="paymentMethod" :payment-methods="paymentMethods" :saving="saving"
        @toggle-cart="showCart = !showCart" @change-qty="changeQuantity($event.index, $event.delta)"
        @remove-cart-item="removeFromCart" @update:customerName="customerName = $event"
        @update:paymentMethod="paymentMethod = $event" @checkout="registerSale" />

    </div><!-- /v-else -->

  </v-container>
</template>

<script>
import PosProductGrid from '@/components/Pos/PosProductGrid.vue'
import PosProductList from '@/components/Pos/PosProductList.vue'
import PosCartFooter from '@/components/Pos/PosCartFooter.vue'

export default {
  name: 'PosPage',
  components: { PosProductGrid, PosProductList, PosCartFooter },
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },

  data() {
    return {
      cart: JSON.parse(localStorage.getItem('pos-cart') || '[]'),
      showCart: false,
      customerName: localStorage.getItem('pos-customer-name') || '',
      paymentMethod: localStorage.getItem('pos-payment-method') || 'cash',
      paymentMethods: [
        { text: 'Efectivo', value: 'cash' },
        { text: 'Tarjeta', value: 'card' },
        { text: 'Transferencia', value: 'transfer' },
      ],
      saving: false,
      footerHeight: 160,
      viewMode: localStorage.getItem('pos-view-mode') || 'grid',
      showStock: localStorage.getItem('pos-show-stock') === 'true',
    }
  },

  watch: {
    viewMode(val) {
      localStorage.setItem('pos-view-mode', val)
    },
    showStock(val) {
      localStorage.setItem('pos-show-stock', val)
    },
    customerName(val) {
      localStorage.setItem('pos-customer-name', val)
    },
    paymentMethod(val) {
      localStorage.setItem('pos-payment-method', val)
    },
    cart: {
      deep: true,
      handler(val) {
        localStorage.setItem('pos-cart', JSON.stringify(val))
      },
    },
  },

  computed: {
    products() {
      return this.$store.getters['products/allProducts']
    },
    loadingProducts() {
      return this.$store.getters['products/loading']
    },
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
    // Load products into store only if empty (skip if already populated)
    if (this.products.length === 0) {
      this.$store.dispatch('products/fetchProducts')
    }
    this.$nextTick(() => {
      const footer = this.$refs.posFooterEl?.$el || this.$refs.posFooterEl
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
        this.showCart = false
        localStorage.removeItem('pos-cart')

        // Refresh product stock from server (silent — don't hide products)
        await this.$store.dispatch('products/fetchProducts', {
          skipLoading: true,
          apiOptions: { cacheMs: 0 }
        })
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

/* ── View toggle ── */
.pos-view-toggle {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-right: 4px;
}

.pos-stock-toggle {
  transition: color 0.2s;
}
</style>
