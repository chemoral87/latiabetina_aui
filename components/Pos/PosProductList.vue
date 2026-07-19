<template>
  <div id="pos-product-list">
    <!-- Header row -->
    <div class="pos-list-header d-flex align-center">
      <div class="pos-list-col-thumb"></div>
      <div class="pos-list-col-name text-caption font-weight-bold grey--text">Producto</div>
      <div class="pos-list-col-price text-caption font-weight-bold grey--text">Precio</div>
      <div class="pos-list-col-actions text-caption font-weight-bold grey--text text-center"></div>
    </div>

    <div v-for="product in products" :key="product.id"
      class="pos-list-item d-flex align-center"
      :class="{ 'pos-list-item--in-cart': cartQty(product.id) > 0 }">
      <!-- Thumbnail -->
      <div class="pos-list-col-thumb">
        <v-img :src="product.image_s3 || ''" width="44" height="44" contain class="pos-list-thumb grey lighten-4 rounded">
          <template #placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-icon color="grey lighten-2" size="22">mdi-package-variant</v-icon>
            </v-row>
          </template>
        </v-img>
      </div>
      <!-- Name -->
      <div class="pos-list-col-name">
        <div class="pos-list-name text-body-2 font-weight-bold">{{ product.name }}<v-icon v-if="product.requires_preparation" small class="ml-1 orange--text">mdi-chef-hat</v-icon></div>
        <div v-if="showStock" class="text-caption font-weight-medium" :class="stockColor(product.stock)">
          {{ product.stock === 0 ? 'Sin stock' : `Stock: ${product.stock}` }}
        </div>
        <div v-else-if="product.stock === 0" class="text-caption font-weight-medium error--text">
          Sin stock
        </div>
      </div>
      <!-- Price -->
      <div class="pos-list-col-price">
        <span class="primary--text font-weight-black">${{ formatPrice(product.price) }}</span>
      </div>
      <!-- Actions -->
      <div class="pos-list-col-actions">
        <div v-if="cartQty(product.id) === 0" class="pos-actions-single">
          <v-btn fab small depressed color="primary" class="pos-list-add-fab" @click="$emit('add', product)">
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
        </div>
        <div v-else class="pos-actions-group">
          <v-btn fab x-small outlined color="error" class="pos-list-btn-delete" @click="$emit('remove', product)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
          <v-btn fab small depressed color="error" @click="$emit('decrease', product)">
            <v-icon small>mdi-minus</v-icon>
          </v-btn>
          <span class="pos-list-qty font-weight-black">{{ cartQty(product.id) }}</span>
          <v-btn fab small depressed color="success" class="pos-list-plus" @click="$emit('add', product)">
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <div v-if="products.length === 0" class="text-center py-12">
      <v-icon color="grey lighten-1" size="56">mdi-package-variant-closed</v-icon>
      <div class="text-body-1 grey--text mt-2">Sin productos disponibles</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PosProductList',
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
.pos-list-header {
  padding: 4px 12px;
  margin-bottom: 4px;
}
.pos-list-item {
  padding: 6px 12px;
  margin-bottom: 6px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.15s, background 0.15s;
  min-height: 60px;
}
.pos-list-item--in-cart {
  border-color: #1976d2;
  border-width: 2px;
  background: #e3f2fd;
}
.pos-list-col-thumb {
  width: 52px;
  min-width: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pos-list-col-name {
  flex: 1;
  min-width: 0;
  padding: 0 8px;
}
.pos-list-col-price {
  width: 90px;
  min-width: 90px;
  text-align: right;
  padding: 0 8px;
  font-size: 0.9rem;
}
.pos-list-col-actions {
  width: 140px;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.pos-actions-single {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
.pos-list-add-fab {
  width: 38px !important;
  height: 38px !important;
}
.pos-actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  width: 100%;
}
.pos-list-btn-delete {
  width: 26px !important;
  height: 26px !important;
}
.pos-list-thumb {
  border-radius: 8px;
  background: #fafafa;
}
.pos-list-name {
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pos-list-qty {
  font-size: 1rem;
  min-width: 20px;
  text-align: center;
  color: #212121;
}
</style>
