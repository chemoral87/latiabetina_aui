<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="8" offset-md="2">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-4">
            <v-icon left color="primary" large>mdi-receipt-text</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ sale.number }}</div>
              <div class="text-caption grey--text">{{ sale.created_at | moment('LL') }}</div>
            </div>
            <v-spacer />
            <v-chip
              :color="statusColor"
              dark
              small
              class="font-weight-bold"
            >
              {{ statusLabel }}
            </v-chip>
          </div>

          <v-divider class="mb-4" />

          <!-- Sale info -->
          <v-row dense>
            <v-col cols="6" sm="3">
              <div class="text-caption grey--text">Cliente</div>
              <div class="text-body-2 font-weight-medium">{{ sale.customer_name || '—' }}</div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption grey--text">Teléfono</div>
              <div class="text-body-2 font-weight-medium">{{ sale.customer_phone || '—' }}</div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption grey--text">Método de pago</div>
              <div class="text-body-2 font-weight-medium">{{ paymentMethodLabel }}</div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-caption grey--text">Vendido el</div>
              <div class="text-body-2 font-weight-medium">{{ sale.sold_at | moment('LLL') }}</div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <!-- Items table -->
          <div class="text-subtitle-2 font-weight-bold mb-2">Artículos</div>
          <v-simple-table dense>
            <thead>
              <tr>
                <th class="text-left">Producto</th>
                <th class="text-center">Cant.</th>
                <th class="text-right">Precio unitario</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in sale.items || []" :key="item.product_id">
                <td>{{ item.product?.name || '—' }}</td>
                <td class="text-center">{{ item.quantity }}</td>
                <td class="text-right">${{ item.unit_price }}</td>
                <td class="text-right font-weight-bold">${{ item.total_price }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right font-weight-bold grey--text">Subtotal</td>
                <td class="text-right">${{ sale.subtotal }}</td>
              </tr>
              <tr v-if="parseFloat(sale.discount) > 0">
                <td colspan="3" class="text-right font-weight-bold grey--text">Descuento</td>
                <td class="text-right error--text">-${{ sale.discount }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right text-h6 font-weight-black primary--text">Total</td>
                <td class="text-right text-h6 font-weight-black primary--text">${{ sale.total }}</td>
              </tr>
            </tfoot>
          </v-simple-table>

          <v-divider class="my-4" />

          <div class="d-flex justify-end">
            <v-btn outlined color="grey" @click="goBack">
              <v-icon left small>mdi-arrow-left</v-icon>
              Regresar
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
  async asyncData({ app, params }) {
    const sale = await app.$repository.Sale.show(params.id)
    return { sale }
  },
  data() {
    return {
      sale: {},
    }
  },
  computed: {
    statusColor() {
      const colors = {
        completed: 'success',
        cancelled: 'error',
        refunded: 'warning',
        pending: 'orange',
        PRE: 'deep-orange',
        COM: 'success',
        PEN: 'orange',
        CAN: 'error',
        REF: 'warning',
      }
      return colors[this.sale.status] || colors[this.sale.status?.toLowerCase()] || 'grey'
    },
    statusLabel() {
      const labels = {
        completed: 'Completada',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
        pending: 'Pendiente',
        PRE: 'Preparando',
        COM: 'Completada',
        PEN: 'Pendiente',
        CAN: 'Cancelada',
        REF: 'Reembolsada',
      }
      return labels[this.sale.status] || labels[this.sale.status?.toLowerCase()] || this.sale.status
    },
    paymentMethodLabel() {
      const labels = {
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia',
      }
      return labels[this.sale.payment_method] || this.sale.payment_method || '—'
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Detalle de venta',
      icon: 'mdi-receipt-text',
      back: '/pos/sales',
    })
  },
  methods: {
    goBack() {
      this.$router.push('/pos/sales')
    },
  },
}
</script>
