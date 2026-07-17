<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="8" offset-md="2">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-4">
            <v-icon left color="warning" large>mdi-pencil</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">Editar venta {{ sale.number }}</div>
              <div class="text-caption grey--text">Modifique los datos del cliente y las cantidades de los artículos</div>
            </div>
          </div>

          <v-divider class="mb-4" />

          <!-- Customer info -->
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.customer_name" label="Cliente" prepend-icon="mdi-account" dense outlined
                hide-details />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field v-model="form.customer_phone" label="Teléfono" prepend-icon="mdi-phone" dense outlined
                hide-details />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Items -->
          <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <v-icon small class="mr-1">mdi-cart</v-icon>
            Artículos
          </div>

          <v-simple-table dense>
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-center" style="width: 120px;">Cantidad</th>
                <th class="text-right" style="width: 130px;">Precio unitario</th>
                <th class="text-right" style="width: 130px;">Total</th>
                <th class="text-center" style="width: 40px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="item.id || item.product_id">
                <td>
                  <div class="font-weight-medium">{{ item.product?.name || '—' }}</div>
                </td>
                <td class="text-center">
                  <v-text-field v-model.number="item.quantity" type="number" min="0" dense hide-details
                    @input="recalculateItem(index)" @wheel.prevent class="quantity-input"
                    style="max-width: 80px; margin: 0 auto;" />
                </td>
                <td class="text-right">${{ Number(item.unit_price).toLocaleString() }}</td>
                <td class="text-right font-weight-medium">${{ Number(item.total_price).toLocaleString() }}</td>
                <td class="text-center pa-1">
                  <v-btn icon color="error" x-small @click="removeItem(index)">
                    <v-icon small>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold grey--text">Subtotal</td>
                <td class="text-right">${{ subtotal.toLocaleString() }}</td>
                <td></td>
              </tr>
              <tr v-if="parseFloat(sale.discount) > 0">
                <td colspan="3" class="text-right font-weight-bold grey--text">Descuento</td>
                <td class="text-right error--text">-${{ Number(sale.discount).toLocaleString() }}</td>
                <td></td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-h6 font-weight-black primary--text">Total</td>
                <td class="text-right text-h6 font-weight-black primary--text">
                  ${{ (subtotal - Number(sale.discount)).toLocaleString() }}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </v-simple-table>

          <v-divider class="my-4" />

          <!-- Product selector grid -->
          <div class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <v-icon small class="mr-1">mdi-plus-circle</v-icon>
            Agregar producto
          </div>

          <div v-if="loadingProducts" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" size="36" />
          </div>

          <v-row v-else dense>
            <v-col
              v-for="product in availableProducts"
              :key="product.id"
              cols="4" sm="3" md="3"
            >
              <v-card
                outlined
                class="add-product-card"
                @click="addProduct(product)"
              >
                <v-img
                  :src="product.image_s3 || ''"
                  height="80px"
                  contain
                  class="grey lighten-4"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-icon color="grey lighten-1" size="28">mdi-package-variant</v-icon>
                    </v-row>
                  </template>
                </v-img>
                <div class="pa-2">
                  <div class="text-caption font-weight-bold text-truncate">{{ product.name }}</div>
                  <div class="text-body-2 primary--text font-weight-black">${{ product.price }}</div>
                  <div class="text-caption grey--text mt-1">Click para agregar</div>
                </div>
              </v-card>
            </v-col>
            <v-col v-if="availableProducts.length === 0" cols="12" class="text-center py-4">
              <v-icon color="grey lighten-1" size="40">mdi-package-variant-closed</v-icon>
              <div class="text-caption grey--text mt-1">Todos los productos ya están en la lista</div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Actions -->
          <div class="d-flex justify-end gap-2">
            <v-btn outlined color="grey" class="mr-2" @click="goBack" :disabled="saving">
              <v-icon left small>mdi-arrow-left</v-icon>
              Cancelar
            </v-btn>
            <v-btn color="warning" :loading="saving" @click="saveSale">
              <v-icon left small>mdi-content-save</v-icon>
              Guardar cambios
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },

  async asyncData({ app, params, error }) {
    try {
      const sale = await app.$repository.Sale.show(params.id)
      const form = {
        customer_name: sale.customer_name || '',
        customer_phone: sale.customer_phone || '',
        items: (sale.items || []).map((item) => ({
          id: item.id,
          product_id: item.product_id,
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
      }
      return { sale, form }
    } catch (e) {
      error({ statusCode: e.response?.status || 500, message: 'Error al cargar la venta' })
    }
  },

  data() {
    return {
      sale: {},
      form: {
        customer_name: '',
        customer_phone: '',
        items: [],
      },
      saving: false,
    }
  },

  computed: {
    subtotal() {
      return this.form.items.reduce((sum, item) => sum + Number(item.total_price), 0)
    },

    allProducts() {
      return this.$store.getters['products/allProducts']
    },

    /** Products not yet added to the items list, and visible (not hidden) */
    availableProducts() {
      const addedIds = new Set(this.form.items.map(i => i.product_id))
      return this.allProducts.filter(p => !p.hidden && !addedIds.has(p.id))
    },

    loadingProducts() {
      return this.$store.getters['products/loading']
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Editar venta',
      icon: 'mdi-pencil',
      back: '/pos/sales',
    })
    // Load products into store only if empty (skip if already populated by another page)
    if (this.allProducts.length === 0) {
      this.$store.dispatch('products/fetchProducts')
    }
  },

  methods: {
    recalculateItem(index) {
      const item = this.form.items[index]
      item.quantity = Math.max(0, Math.floor(item.quantity))
      item.total_price = round(item.unit_price * item.quantity, 2)
      // Force reactivity
      this.form.items = [...this.form.items]
    },

    addProduct(product) {
      if (!product) return
      // Prevent adding duplicates
      const exists = this.form.items.find(i => i.product_id === product.id)
      if (exists) {
        exists.quantity += 1
        this.recalculateItem(this.form.items.indexOf(exists))
        return
      }
      this.form.items.push({
        product_id: product.id,
        product,
        quantity: 1,
        unit_price: product.price,
        total_price: product.price,
      })
      this.form.items = [...this.form.items]
    },

    async saveSale() {
      try {
        this.saving = true

        const payload = {
          customer_name: this.form.customer_name,
          customer_phone: this.form.customer_phone,
          items: this.form.items.map((item) => ({
            ...(item.id ? { id: item.id } : {}),
            product_id: item.product_id,
            quantity: item.quantity,
          })),
        }

        await this.$repository.Sale.update(this.sale.id, payload)

        this.$router.push('/pos/sales')
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.saving = false
      }
    },

    removeItem(index) {
      this.form.items.splice(index, 1)
      this.form.items = [...this.form.items]
    },

    goBack() {
      this.$router.push('/pos/sales')
    },
  },
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}
</script>

<style scoped>
/* Ocultar flechas up/down del input type="number" */
.quantity-input ::v-deep ::-webkit-inner-spin-button,
.quantity-input ::v-deep ::-webkit-outer-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}
.quantity-input ::v-deep input[type="number"] {
  -moz-appearance: textfield !important;
}

/* Product card grid */
.add-product-card {
  border-radius: 8px !important;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: border-color 0.15s, transform 0.12s;
}
.add-product-card:hover {
  border-color: #1976d2 !important;
  transform: translateY(-2px);
}
.add-product-card:active {
  transform: translateY(0);
}

</style>
