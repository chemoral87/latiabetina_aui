<template>
  <v-container fluid class="cash-close-page px-4 pt-4 pb-16">
    <!-- Header -->
    <div class="d-flex align-center mb-4">
      <v-icon left color="primary" class="mr-2">mdi-cash-register</v-icon>
      <span class="text-h6 font-weight-black">Cierre de Caja</span>
    </div>

    <!-- Date filter -->
    <v-row class="mb-4" dense>
      <v-col cols="12" sm="6" md="4">
        <v-menu v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y>
          <template #activator="{ on, attrs }">
            <v-text-field v-model="dateLabel" label="Fecha" prepend-icon="mdi-calendar" readonly outlined dense
              hide-details v-bind="attrs" v-on="on" />
          </template>
          <v-date-picker v-model="selectedDate" @input="dateMenu = false; fetchSales()" />
        </v-menu>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" />
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <v-row dense class="mb-4">
        <v-col cols="12" sm="4">
          <v-card outlined class="cash-close-card cash-close-card--cash">
            <div class="d-flex align-center mb-2">
              <v-icon color="green darken-1" class="mr-2">mdi-cash</v-icon>
              <span class="text-subtitle-2 font-weight-bold">Efectivo</span>
            </div>
            <div class="cash-close-card-amount green--text text--darken-1 font-weight-black">
              ${{ formatPrice(summary.cash) }}
            </div>
            <div class="text-caption grey--text mt-1">{{ summary.cashCount }} venta(s)</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card outlined class="cash-close-card cash-close-card--card">
            <div class="d-flex align-center mb-2">
              <v-icon color="blue darken-1" class="mr-2">mdi-credit-card</v-icon>
              <span class="text-subtitle-2 font-weight-bold">Tarjeta</span>
            </div>
            <div class="cash-close-card-amount blue--text text--darken-1 font-weight-black">
              ${{ formatPrice(summary.card) }}
            </div>
            <div class="text-caption grey--text mt-1">{{ summary.cardCount }} venta(s)</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card outlined class="cash-close-card cash-close-card--transfer">
            <div class="d-flex align-center mb-2">
              <v-icon color="purple darken-1" class="mr-2">mdi-bank-transfer</v-icon>
              <span class="text-subtitle-2 font-weight-bold">Transferencia</span>
            </div>
            <div class="cash-close-card-amount purple--text text--darken-1 font-weight-black">
              ${{ formatPrice(summary.transfer) }}
            </div>
            <div class="text-caption grey--text mt-1">{{ summary.transferCount }} venta(s)</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Total row -->
      <v-card outlined class="cash-close-total-card mb-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption grey--text">Total del día</div>
            <div class="text-h4 font-weight-black primary--text">${{ formatPrice(summary.total) }}</div>
          </div>
          <v-chip color="primary" dark large class="font-weight-bold">
            {{ summary.totalCount }} venta(s)
          </v-chip>
        </div>
      </v-card>

      <!-- Sales list -->
      <div class="text-subtitle-1 font-weight-bold mb-2">Detalle de ventas</div>
      <v-card outlined>
        <v-simple-table dense>
          <thead>
            <tr>
              <th class="text-left">Venta</th>
              <th class="text-left">Cliente</th>
              <th class="text-center">Método</th>
              <th class="text-right">Total</th>
              <th class="text-right">Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id">
              <td class="font-weight-bold">{{ sale.number }}</td>
              <td>{{ sale.customer_name || '—' }}</td>
              <td class="text-center">
                <v-chip x-small :color="paymentColor(sale.payment_method)" dark>
                  {{ paymentLabel(sale.payment_method) }}
                </v-chip>
              </td>
              <td class="text-right font-weight-bold primary--text">
                ${{ formatPrice(sale.total) }}
              </td>
              <td class="text-right grey--text">
                {{ formatTime(sale.sold_at) }}
              </td>
            </tr>
            <tr v-if="sales.length === 0">
              <td colspan="5" class="text-center py-6 grey--text">
                Sin ventas en esta fecha
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </template>
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },

  data() {
    return {
      sales: [],
      loading: false,
      selectedDate: new Date().toISOString().slice(0, 10),
      dateMenu: false,
    }
  },

  computed: {
    dateLabel() {
      if (!this.selectedDate) return ''
      const [y, m, d] = this.selectedDate.split('-')
      return `${d}/${m}/${y}`
    },
    summary() {
      const cash = this.sales
        .filter(s => s.payment_method === 'cash')
        .reduce((acc, s) => acc + parseFloat(s.total), 0)
      const card = this.sales
        .filter(s => s.payment_method === 'card')
        .reduce((acc, s) => acc + parseFloat(s.total), 0)
      const transfer = this.sales
        .filter(s => s.payment_method === 'transfer')
        .reduce((acc, s) => acc + parseFloat(s.total), 0)

      return {
        cash: cash.toFixed(2),
        cashCount: this.sales.filter(s => s.payment_method === 'cash').length,
        card: card.toFixed(2),
        cardCount: this.sales.filter(s => s.payment_method === 'card').length,
        transfer: transfer.toFixed(2),
        transferCount: this.sales.filter(s => s.payment_method === 'transfer').length,
        total: (cash + card + transfer).toFixed(2),
        totalCount: this.sales.length,
      }
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Cierre de Caja',
      icon: 'mdi-cash-register',
    })
    this.fetchSales()
  },

  methods: {
    async fetchSales() {
      this.loading = true
      try {
        const orgIds = this.$store.getters.permissions['sale-index']
        const orgId = Array.isArray(orgIds) && orgIds.length === 1 ? orgIds[0] : ''
        const params = {
          filter: '',
          org_id: orgId || '',
        }
        // Fetch all sales (we'll filter client-side by date)
        const res = await this.$repository.Sale.index(params)
        const allSales = res?.data || []

        // Filter by selected date
        this.sales = allSales.filter(s => {
          const saleDate = s.sold_at ? s.sold_at.slice(0, 10) : s.created_at?.slice(0, 10)
          return saleDate === this.selectedDate
        })
      } catch (error) {
        this.$handleError?.(error)
      } finally {
        this.loading = false
      }
    },

    formatPrice(val) {
      const num = parseFloat(val)
      if (isNaN(num)) return val
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    formatTime(datetime) {
      if (!datetime) return '—'
      const d = new Date(datetime)
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    },

    paymentLabel(method) {
      const labels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' }
      return labels[method] || method
    },

    paymentColor(method) {
      const colors = { cash: 'green', card: 'blue', transfer: 'purple' }
      return colors[method] || 'grey'
    },
  },
}
</script>

<style scoped>
.cash-close-page {
  max-width: 900px;
}
.cash-close-card {
  border-radius: 12px !important;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.cash-close-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.cash-close-card--cash {
  border-left: 4px solid #43a047;
}
.cash-close-card--card {
  border-left: 4px solid #1565c0;
}
.cash-close-card--transfer {
  border-left: 4px solid #7b1fa2;
}
.cash-close-card-amount {
  font-size: 1.6rem;
  line-height: 1.2;
}
.cash-close-total-card {
  border-radius: 12px !important;
  padding: 16px 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
}
</style>
