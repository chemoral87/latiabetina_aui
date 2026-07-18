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
          <div v-if="showStock && product.stock < 5" class="text-caption font-weight-medium green--text">
            {{ product.stock === 0 ? 'Sin stock' : `Solo ${product.stock} restantes` }}
          </div>
          <div v-else-if="!showStock && product.stock === 0" class="text-caption font-weight-medium error--text">
            Sin stock
          </div>
        </div>

        <div class="pos-card-controls">
          <v-btn v-if="cartQty(product.id) === 0" block depressed color="primary" class="pos-add-btn"
            @click="$emit('add', product)">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          <div v-else class="pos-qty-row">
            <v-btn fab small depressed color="error" class="pos-qty-btn" @click="$emit('decrease', product)">
              <v-icon>mdi-minus</v-icon>
            </v-btn>
            <span class="pos-qty-number">{{ cartQty(product.id) }}</span>
            <v-btn fab small depressed color="success" class="pos-qty-btn" @click="$emit('add', product)">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn fab x-small outlined color="error" class="ml-2 pos-qty-btn-delete" @click="$emit('remove', product)">
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
</template>

<script>
export default {
  name: 'PosProductGrid',
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
</style>
