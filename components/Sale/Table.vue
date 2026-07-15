<template>
  <v-data-table :headers="headers" :items="items" :options.sync="optionsTable" dense :server-items-length="total"
    :loading="loading" :must-sort="true" mobile-breakpoint="0" class="elevation-1">
    <!-- Columna de total -->
    <template #[`item.total`]="{ item }">
      <span class="font-weight-medium">${{ Number(item.total).toLocaleString() }}</span>
    </template>

    <!-- Columna de fecha -->
    <template #[`item.created_at`]="{ item }">
      <span>{{ formatDate(item.created_at) }}</span>
    </template>

    <!-- Columna de método de pago -->
    <template #[`item.payment_method`]="{ item }">
      <v-chip small :color="paymentMethodColor(item.payment_method)" text-color="white" class="font-weight-medium">
        {{ paymentMethodLabel(item.payment_method) }}
      </v-chip>
    </template>

    <!-- Columna de estado -->
    <template #[`item.status`]="{ item }">
      <v-chip small :color="statusColor(item.status)" dark class="font-weight-medium">
        {{ statusLabel(item.status) }}
      </v-chip>
    </template>

    <!-- Columna de acciones -->
    <template #[`item.actions`]="{ item }">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="primary" fab x-small class="mr-1" v-bind="attrs" v-on="on" @click="viewDetail(item)">
            <v-icon small>mdi-eye</v-icon>
          </v-btn>
        </template>
        <span>Ver detalle</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="warning" fab x-small class="mr-1" v-bind="attrs" v-on="on" @click="editSale(item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Editar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="error" fab x-small v-bind="attrs" v-on="on" @click="deleteSale(item)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Eliminar</span>
      </v-tooltip>
    </template>

    <!-- Estado vacío -->
    <template #no-data>
      <div class="text-center pa-4">
        <v-icon color="grey lighten-1">mdi-receipt-text</v-icon>
        <span class="text-body-1 grey--text">No se encontraron ventas</span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'SaleTable',

  props: {
    response: {
      type: Object,
      default: () => ({ data: null, total: 0 }),
    },
    options: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      optionsTable: {},
      headers: [
        {
          text: 'Número',
          align: 'start',
          value: 'number',
        },
        {
          text: 'Cliente',
          value: 'customer_name',
        },
        {
          text: 'Teléfono',
          value: 'customer_phone',
        },
        {
          text: 'Pago',
          value: 'payment_method',
          sortable: false,
        },
        {
          text: 'Estado',
          value: 'status',
          sortable: false,
        },
        {
          text: 'Total',
          value: 'total',
          align: 'end',
        },
        {
          text: 'Fecha',
          value: 'created_at',
        },
        {
          text: 'Acciones',
          value: 'actions',
          sortable: false,
          align: 'center',
          width: '180px',
        },
      ],
      isFirstWatch: true,
    }
  },

  computed: {
    total() {
      return this.response && this.response.total ? this.response.total : 0
    },

    items() {
      return this.response && this.response.data ? this.response.data : []
    },
  },

  watch: {
    options: {
      handler(newOptions) {
        if (newOptions) {
          this.optionsTable = Object.assign({}, newOptions)
        }
      },
      immediate: true,
      deep: true,
    },

    optionsTable: {
      handler(newValue, oldValue) {
        // Evitar el primer watch (cuando se inicializa)
        if (this.isFirstWatch) {
          this.isFirstWatch = false
          return
        }

        // Solo emitir si realmente cambió algo relevante
        if (this.hasOptionsChanged(newValue, oldValue)) {
          this.$emit('sorting', newValue)
        }
      },
      deep: true,
    },
  },

  methods: {
    hasOptionsChanged(newVal, oldVal) {
      if (!oldVal) return true

      // Comparar solo las propiedades relevantes
      const relevantProps = ['page', 'itemsPerPage', 'sortBy', 'sortDesc']

      return relevantProps.some((prop) => {
        if (Array.isArray(newVal[prop]) && Array.isArray(oldVal[prop])) {
          return JSON.stringify(newVal[prop]) !== JSON.stringify(oldVal[prop])
        }
        return newVal[prop] !== oldVal[prop]
      })
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    paymentMethodLabel(method) {
      const labels = {
        cash: 'Efectivo',
        card: 'Tarjeta',
        transfer: 'Transferencia',
      }
      return labels[method] || method || '—'
    },

    paymentMethodColor(method) {
      const colors = {
        cash: 'success',
        card: 'primary',
        transfer: 'info',
      }
      return colors[method] || 'grey'
    },

    statusLabel(status) {
      const labels = {
        completed: 'Completada',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
        pending: 'Pendiente',
      }
      return labels[status] || status || '—'
    },

    statusColor(status) {
      const colors = {
        completed: 'success',
        cancelled: 'error',
        refunded: 'warning',
        pending: 'orange',
      }
      return colors[status] || 'grey'
    },

    viewDetail(item) {
      this.$emit('view', item)
    },

    editSale(item) {
      this.$emit('edit', item)
    },

    deleteSale(item) {
      this.$emit('delete', item)
    },
  },
}
</script>
