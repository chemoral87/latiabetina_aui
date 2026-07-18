<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filtro de búsqueda -->
      <v-col cols="12" md="2">
        <v-text-field v-model="filterSale" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar venta..."
          dense />
      </v-col>

      <!-- Botones de acción -->
      <v-col cols="12" md="3">
        <v-btn color="primary" :loading="loading" @click="refreshSales">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
        <v-btn color="secondary" class="ml-2" to="/pos">
          <v-icon left>mdi-point-of-sale</v-icon>
          Ir al POS
        </v-btn>
      </v-col>

      <!-- Tabla de ventas -->
      <v-col cols="12">
        <SaleTable :options="options" :response="response" :loading="loading" @sorting="handleSorting"
          @view="viewDetail" @edit="editSale" @delete="beforeDeleteSale" />
      </v-col>
    </v-row>

    <!-- Diálogo de confirmación de eliminación -->
    <DialogDelete v-if="saleDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteSale"
      @close="saleDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from 'lodash-es'

export default {
  components: {
    SaleTable: () => import('@/components/Sale/Table.vue'),
    DialogDelete: () => import('@/components/Dialog/Delete.vue'),
  },

  middleware: ['authenticated', 'permission'],
  meta: { permission: 'sale-index' },

  async asyncData({ app, error }) {
    const options = {
      page: 1,
      sortBy: ['created_at'],
      sortDesc: [true],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.Sale.index(options)
      return { response, options }
    } catch (e) {
      error({ statusCode: e.response?.status || 500, message: 'Error al cargar ventas' })
      return {
        response: { data: [], total: 0 },
        options,
      }
    }
  },

  data() {
    return {
      filterSale: '',
      response: { data: [], total: 0 },
      options: {
        page: 1,
        sortBy: ['created_at'],
        sortDesc: [true],
        itemsPerPage: 10,
      },
      saleDialogDelete: false,
      dialogDelete: {},
      loading: false,
      deleting: false,
      skipFilterWatch: false,
      // Real-time listeners for sale updates
      echoChannels: {}, // { orgId: channelInstance }
      echoConnected: false,
    }
  },

  computed: {
    hasSales() {
      return this.response?.data?.length > 0
    },
  },

  watch: {
    filterSale: {
      handler: debounce(function (value) {
        if (this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Ventas',
      icon: 'mdi-receipt-text',

    })

    // Set up real-time listeners for sale updates
    this.setupRealtimeListeners()
  },

  beforeDestroy() {
    // Leave all subscribed Echo channels
    Object.keys(this.echoChannels).forEach((orgId) => {
      if (this.$echo) {
        this.$echo.leave(`pos.sales.${orgId}`)
      }
    })
    this.echoChannels = {}
  },

  methods: {
    async handleFilterChange(value) {
      await this.loadSales({ filter: value || '', page: 1 })
    },

    async loadSales(overrides = {}) {
      try {
        this.loading = true

        const requestOptions = {
          ...this.options,
          ...overrides,
        }

        if (this.filterSale && !Object.prototype.hasOwnProperty.call(overrides, 'filter')) {
          requestOptions.filter = this.filterSale
        }

        this.response = await this.$repository.Sale.index(requestOptions)
        this.options = requestOptions
      } catch (error) {
        this.$handleError(error)
      } finally {
        this.loading = false
      }
    },

    async refreshSales() {
      await this.loadSales()
    },

    async handleSorting(options) {
      this.options = options
      await this.loadSales()
    },

    viewDetail(item) {
      this.$router.push(`/pos/sales/${item.id}`)
    },

    editSale(item) {
      this.$router.push(`/pos/sales/${item.id}/edit`)
    },

    beforeDeleteSale(item) {
      this.dialogDelete = {
        text: 'Desea eliminar la venta',
        strong: item.number,
        payload: item,
      }
      this.saleDialogDelete = true
    },

    async deleteSale() {
      const item = this.dialogDelete.payload
      try {
        this.deleting = true
        await this.$repository.Sale.delete(item.id)

        this.skipFilterWatch = true
        this.filterSale = ''
        await this.loadSales({ page: 1, filter: '' })

        this.saleDialogDelete = false
      } catch (error) {
        this.$handleError(error)
      } finally {
        this.deleting = false
      }
    },

    /**
     * Subscribe to pos.sales.{orgId} channel for real-time sale updates.
     * Listens for sale.completed events from the KDS and updates the list.
     */
    setupRealtimeListeners() {
      if (!this.$echo) return

      // Get all org IDs the user has sale-index access to
      const orgIds = this.$store.getters.permissions['sale-index'] ?? []

      orgIds.forEach((orgId) => {
        if (this.echoChannels[orgId]) return // already subscribed

        const channelName = `pos.sales.${orgId}`

        // Leave first to clear any stale handler
        this.$echo.leave(channelName)

        const channel = this.$echo.channel(channelName)

        channel
          .subscribed(() => { this.echoConnected = true })
          .error(() => { this.echoConnected = false })
          .listen('.sale.completed', (data) => {
            this.handleSaleCompleted(data)
          })

        this.$set(this.echoChannels, orgId, channel)
      })

      const state = this.$echo?.connector?.pusher?.connection?.state
      if (state) this.echoConnected = state === 'connected'
    },

    /**
     * Handle sale.completed event from KDS.
     * Updates the status of the completed order in the current list.
     */
    handleSaleCompleted(data) {
      // Find and update the sale in the response
      const saleIndex = this.response.data.findIndex((s) => s.id === data.id)
      if (saleIndex !== -1) {
        this.$set(this.response.data[saleIndex], 'status', data.status)
      }
    },
  },
}
</script>
