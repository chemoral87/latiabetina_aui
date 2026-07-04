<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-card outlined class="pa-3">
          <div class="text-subtitle-1 font-weight-bold mb-3">Ventas</div>
          <v-data-table :headers="headers" :items="sales" :items-per-page="10" class="elevation-0" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },
  data() {
    return {
      sales: [],
      headers: [
        { text: 'Número', value: 'number' },
        { text: 'Cliente', value: 'customer_name' },
        { text: 'Total', value: 'total' },
        { text: 'Fecha', value: 'created_at' },
      ],
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Ventas',
      icon: 'mdi-receipt-text',
      back: '/pos',
    })
    this.loadSales()
  },
  methods: {
    async loadSales() {
      try {
        const response = await this.$repository.Sale.index({ itemsPerPage: 100 })
        this.sales = response?.data || []
      } catch (error) {
        this.$handleError?.(error)
      }
    },
  },
}
</script>
