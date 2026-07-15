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
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in form.items" :key="item.id || item.product_id">
                <td>
                  <div class="font-weight-medium">{{ item.product?.name || '—' }}</div>
                </td>
                <td class="text-center">
                  <v-text-field v-model.number="item.quantity" type="number" min="1" dense hide-details
                    @input="recalculateItem(index)" style="max-width: 80px; margin: 0 auto;" />
                </td>
                <td class="text-right">${{ Number(item.unit_price).toLocaleString() }}</td>
                <td class="text-right font-weight-medium">${{ Number(item.total_price).toLocaleString() }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold grey--text">Subtotal</td>
                <td class="text-right">${{ subtotal.toLocaleString() }}</td>
              </tr>
              <tr v-if="parseFloat(sale.discount) > 0">
                <td colspan="3" class="text-right font-weight-bold grey--text">Descuento</td>
                <td class="text-right error--text">-${{ Number(sale.discount).toLocaleString() }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-h6 font-weight-black primary--text">Total</td>
                <td class="text-right text-h6 font-weight-black primary--text">
                  ${{ (subtotal - Number(sale.discount)).toLocaleString() }}
                </td>
              </tr>
            </tfoot>
          </v-simple-table>

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
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Editar venta',
      icon: 'mdi-pencil',
      back: '/pos/sales',
    })
  },

  methods: {
    recalculateItem(index) {
      const item = this.form.items[index]
      if (item.quantity < 1) item.quantity = 1
      item.total_price = round(item.unit_price * item.quantity, 2)
      // Force reactivity
      this.form.items = [...this.form.items]
    },

    async saveSale() {
      try {
        this.saving = true

        const payload = {
          customer_name: this.form.customer_name,
          customer_phone: this.form.customer_phone,
          items: this.form.items.map((item) => ({
            id: item.id,
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

    goBack() {
      this.$router.push('/pos/sales')
    },
  },
}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals)
}
</script>
