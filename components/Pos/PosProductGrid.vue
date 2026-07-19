<template>
  <v-row id="pos-product-grid" dense>
    <v-col v-for="product in products" :key="product.id" cols="6" sm="4" md="3">
      <v-card outlined class="pos-product-card d-flex flex-column"
        :class="{ 'pos-product-card--in-cart': cartQty(product.id) > 0 }">

        <v-img :src="product.image_s3 || ''" height="100px" contain class="grey lighten-4 flex-shrink-0">
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
            <div class="pos-name text-body-2 font-weight-bold">{{ product.name }}<v-icon v-if="product.requires_preparation" small class="ml-1 orange--text">mdi-chef-hat</v-icon></div>
            <div class="pos-price primary--text font-weight-black">${{ formatPrice(product.price) }}</div>
          </div>
          <div v-if="showStock" class="text-caption font-weight-medium" :class="stockColor(product.stock)">
            {{ product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}` }}
          </div>
          <div v-else-if="product.stock === 0" class="text-caption font-weight-medium error--text">
            Sin stock
          </div>
        </div>

        <div class="pos-card-controls">
          <PosProductControls
            :quantity="cartQty(product.id)"
            @add="$emit('add', product)"
            @decrease="$emit('decrease', product)"
            @remove="$emit('remove', product)"
          />
        </div>
      </v-card>
    </v-col>

    <v-col v-if="products.length === 0" cols="12" class="text-center py-12">
      <v-icon color="grey lighten-1" size="56">mdi-package-variant-closed</v-icon>
      <div class="text-body-1 grey--text mt-2">Sin productos disponibles</div>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'PosProductGrid',

  components: {
    PosProductControls: () => import('@/components/Pos/PosProductControls.vue'),
  },

  props: {
    products: { type: Array, required: true },
    cart: { type: Array, required: true },
    showStock: { type: Boolean, default: false },
  },
  methods: {
    cartQty(productId) {
      return this.cart.find((i) => i.product.id === productId)?.quantity ?? 0
    },
    formatPrice(val) {
      const num = parseFloat(val)
      if (isNaN(num)) return val
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    stockColor(stock) {
      if (stock === 0) return 'error--text'
      if (stock < 5) return 'warning--text'
      return 'grey--text'
    },
  },
}
</script>

<style scoped>
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
</style>
