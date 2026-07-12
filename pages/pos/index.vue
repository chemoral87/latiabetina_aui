<template>
  <v-container fluid class="pos-page pa-2">

    <!-- Loading -->
    <div v-if="loadingProducts" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <!-- Product grid: 2 cols on mobile, 3 on sm, 4 on md+ -->
    <v-row v-else dense>
      <v-col v-for="product in products" :key="product.id" cols="6" sm="4" md="3">
        <v-card outlined class="pos-product-card d-flex flex-column"
          :class="{ 'pos-product-card--in-cart': cartQty(product.id) > 0 }">
          <!-- Image -->
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

          <!-- Info -->
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

          <!-- Controls -->
          <div class="pos-card-controls">
            <!-- Not in cart yet -->
            <v-btn v-if="cartQty(product.id) === 0" block depressed color="primary" class="pos-add-btn"
              :disabled="product.stock === 0" @click="addToCart(product)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>

            <!-- Already in cart -->
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
    <div class="pos-footer">
      <div class="pos-footer-top">
        <!-- Cart chips -->
        <div class="pos-footer-cart">
          <div v-for="(item, index) in cart" :key="item.product.id" class="pos-chip">
            <span class="pos-chip-name">{{ item.product.name }}</span>
            <span class="pos-chip-qty">×{{ item.quantity }}</span>
            <span class="pos-chip-price">${{ (item.product.price * item.quantity).toFixed(2) }}</span>
            <v-btn icon x-small class="ml-1" @click="removeFromCart(index)">
              <v-icon x-small color="error">mdi-close</v-icon>
            </v-btn>
          </div>
          <span v-if="cart.length === 0" class="text-caption grey--text">Sin artículos</span>
        </div>
      </div>

      <div class="pos-footer-bottom">
        <!-- Row 1: fields -->
        <div class="pos-footer-fields-row">
          <v-text-field v-model="customerName" label="Cliente" outlined dense hide-details class="pos-field" />
          <v-select v-model="paymentMethod" :items="paymentMethods" label="Método de pago" outlined dense hide-details
            class="pos-field" />
        </div>
        <!-- Row 2: total + cobrar -->
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
      customerName: '',
      paymentMethod: 'cash',
      paymentMethods: [
        { text: 'Efectivo', value: 'cash' },
        { text: 'Tarjeta', value: 'card' },
        { text: 'Transferencia', value: 'transfer' },
      ],
      saving: false,
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
  },

  methods: {
    async loadProducts() {
      this.loadingProducts = true
      try {
        const response = await this.$repository.Product.pos()
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

<style scoped>
/* Leave room for the fixed footer */
.pos-page {
  padding-bottom: 185px;
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

/* Controls area at the bottom of each card */
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

.pos-remove-btn {
  margin: 0 -2px;
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

/* Cart chips row */
.pos-footer-top {
  padding: 4px 12px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 34px;
  display: flex;
  align-items: center;
  overflow-x: auto;
  gap: 6px;
  flex-wrap: nowrap;
}

.pos-footer-cart {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  align-items: center;
}

.pos-chip {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #e3f2fd;
  border-radius: 20px;
  padding: 3px 8px;
  white-space: nowrap;
  font-size: 0.78rem;
}

.pos-chip-name {
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pos-chip-qty {
  color: #1976d2;
  font-weight: 700;
}

.pos-chip-price {
  color: #555;
}

/* Bottom action row */
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
