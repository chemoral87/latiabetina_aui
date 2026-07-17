<template>
  <div id="pos-footer" ref="posFooter" class="pos-footer">
    <!-- Toggle bar -->
    <div id="pos-footer-toggle-bar" class="pos-footer-toggle-bar" @click="$emit('toggle-cart')">
      <div class="d-flex align-center">
        <v-icon small class="mr-1" color="primary">mdi-cart</v-icon>
        <span class="font-weight-bold">
          {{ cartItemCount }} artículo(s)
        </span>
        <v-chip v-if="cart.length > 0" x-small color="primary" dark class="ml-2 font-weight-bold">
          ${{ formatPrice(total) }}
        </v-chip>
      </div>
      <v-icon small :color="showCart ? 'primary' : 'grey'">
        {{ showCart ? 'mdi-chevron-down' : 'mdi-chevron-up' }}
      </v-icon>
    </div>

    <!-- Cart table (collapsible) -->
    <div id="pos-cart-panel" v-show="showCart" class="pos-cart-panel">
      <div v-if="cart.length === 0" class="text-caption grey--text pa-2 text-center">
        Sin artículos en el carrito
      </div>
      <table id="pos-cart-table" v-else class="pos-cart-table">
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
                <v-btn fab x-small depressed color="error" dark @click="$emit('change-qty', { index, delta: -1 })">
                  <v-icon x-small>mdi-minus</v-icon>
                </v-btn>
                <span class="font-weight-bold">{{ item.quantity }}</span>
                <v-btn fab x-small depressed color="success" dark @click="$emit('change-qty', { index, delta: 1 })">
                  <v-icon x-small>mdi-plus</v-icon>
                </v-btn>
              </div>
            </td>
            <td class="pos-ct-total primary--text font-weight-bold">
              ${{ formatPrice((item.product.price * item.quantity).toFixed(2)) }}
            </td>
            <td class="pos-ct-del">
              <v-btn fab x-small outlined color="error" @click="$emit('remove-cart-item', index)">
                <v-icon small color="error" class="font-weight-black">mdi-close</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Fields + cobrar -->
    <div id="pos-footer-bottom" class="pos-footer-bottom">
      <div id="pos-footer-fields-row" class="pos-footer-fields-row">
        <v-text-field :value="customerName" label="Cliente" outlined dense hide-details class="pos-field"
          @input="$emit('update:customerName', $event)" />
        <v-select :value="paymentMethod" :items="paymentMethods" label="Método de pago" outlined dense hide-details
          class="pos-field" @input="$emit('update:paymentMethod', $event)" />
      </div>
      <div id="pos-footer-action-row" class="pos-footer-action-row">
        <div id="pos-total-block" class="pos-total-block">
          <div class="text-h5 font-weight-black primary--text">${{ formatPrice(total) }}</div>
        </div>
        <v-btn color="primary" x-large block :loading="saving" :disabled="cart.length === 0" id="pos-cobrar-btn"
          class="pos-cobrar-btn" @click="$emit('checkout')">
          <v-icon left>mdi-cash-register</v-icon>
          Cobrar
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PosCartFooter',
  props: {
    cart: { type: Array, required: true },
    showCart: { type: Boolean, required: true },
    customerName: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    paymentMethods: { type: Array, required: true },
    saving: { type: Boolean, default: false },
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
  methods: {
    formatPrice(val) {
      const num = parseFloat(val)
      if (isNaN(num)) return val
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
  },
}
</script>

<style scoped>
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
.pos-footer-toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  user-select: none;
  background: #fafafa;
  font-size: 0.88rem;
}
.pos-footer-toggle-bar:active {
  background: #f0f0f0;
}
.pos-cart-panel {
  max-height: 220px;
  overflow-y: auto;
  border-bottom: 1px solid #f0f0f0;
}
.pos-cart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.pos-cart-table thead tr {
  background: #f5f5f5;
}
.pos-cart-table th {
  padding: 6px 10px;
  font-weight: 700;
  color: #555;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.pos-cart-table tbody tr:nth-child(even) {
  background: #fafafa;
}
.pos-cart-table td {
  padding: 6px 10px;
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
  width: 40px;
}
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
