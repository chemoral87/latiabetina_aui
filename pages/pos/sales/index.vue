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
      back: '/pos',
    })
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
  },
}
</script>
