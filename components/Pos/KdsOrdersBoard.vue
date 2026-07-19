<template>
  <div>
    <!-- ── Loading ──────────────────────────────────────────────────── -->
    <div v-if="loading" class="kds-state kds-state--loading">
      <v-progress-circular indeterminate color="primary" size="56" />
    </div>

    <!-- ── Error ────────────────────────────────────────────────────── -->
    <div v-else-if="error" class="kds-state kds-state--error">
      <v-alert type="error" max-width="480">{{ error }}</v-alert>
    </div>

    <!-- ── Empty (all orders completed) ─────────────────────────────── -->
    <div v-else-if="activeOrders.length === 0" class="kds-state kds-state--empty">
      <v-icon size="72" color="success">mdi-check-circle-outline</v-icon>
      <div class="text-h6 mt-4 grey--text">Sin órdenes pendientes</div>
      <div class="text-body-2 grey--text mt-1">Todas las órdenes han sido completadas</div>
      <div class="mt-6">
        <v-btn outlined color="grey" @click="$emit('reload')">
          <v-icon left small>mdi-refresh</v-icon>
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- ── Orders board ─────────────────────────────────────────────── -->
    <template v-else>
      <!-- Header strip -->
      <v-row align="center" class="mb-4">
        <v-col cols="auto">
          <v-icon size="32" color="orange darken-2">mdi-chef-hat</v-icon>
        </v-col>
        <v-col>
          <div class="text-h5 font-weight-bold d-flex align-center" style="gap: 12px">
            Pantalla de Cocina
            <v-chip color="orange darken-2" dark small class="font-weight-bold">
              {{ activeOrders.length }} {{ activeOrders.length === 1 ? 'orden' : 'órdenes' }}
            </v-chip>
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex align-center" style="gap: 10px">
          <!-- Sound toggle -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon small
                v-bind="attrs"
                v-on="on"
                :color="soundEnabled ? 'orange darken-2' : 'grey'"
                @click="$emit('update:sound-enabled', !soundEnabled)"
              >
                <v-icon>{{ soundEnabled ? 'mdi-volume-high' : 'mdi-volume-off' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ soundEnabled ? 'Sonido activado' : 'Sonido desactivado' }}</span>
          </v-tooltip>

          <!-- Live indicator -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="d-flex align-center">
                <span
                  class="kds-live-dot"
                  :class="echoConnected ? 'kds-live-dot--on' : 'kds-live-dot--off'"
                />
              </span>
            </template>
            <span>{{ echoConnected ? 'Conectado' : 'Sin conexión en tiempo real' }}</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Incoming order banner -->
      <v-expand-transition>
        <v-alert
          v-if="incomingOrder"
          type="info"
          border="left"
          colored-border
          dense
          class="mb-4"
          dismissible
          @input="$emit('clear-incoming-order')"
        >
          <div class="d-flex align-center justify-space-between flex-wrap" style="gap: 8px">
            <span>
              <strong>Nueva orden recibida:</strong> {{ incomingOrder.number }}
              <span v-if="incomingOrder.customer_name"> — {{ incomingOrder.customer_name }}</span>
            </span>
            <v-btn x-small color="primary" @click="scrollToOrder(incomingOrder.id)">
              <v-icon left x-small>mdi-arrow-down</v-icon>
              Ver ahora
            </v-btn>
          </div>
        </v-alert>
      </v-expand-transition>

      <!-- Order cards grid -->
      <v-row>
        <v-col
          v-for="order in activeOrders"
          :key="order.id"
          :id="'pos-kds-order-' + order.id"
          cols="12" sm="6" md="4" lg="3" xl="2"
        >
          <v-card
            outlined
            class="kds-order-card"
            :class="{ 'kds-order-completed': allDoneForSale(order) }"
          >
            <div class="kds-order-header">
              <div class="kds-order-number">{{ order.number }}</div>
              <div class="kds-order-header-right">
                <div class="kds-elapsed" :title="formatSoldAt(order.sold_at)">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  {{ elapsedTime(order.sold_at) }}
                </div>
              </div>
            </div>

            <div v-if="order.customer_name" class="kds-customer px-3 pt-1 pb-0">
              <v-icon small color="grey darken-1">mdi-account</v-icon>
              <span class="kds-customer-name">{{ order.customer_name }}</span>
            </div>

            <v-divider class="mx-3 my-2" />

            <KdsItemsList
              :order="order"
              :done-map="doneMap"
              :is-item-completed="isItemCompleted"
              :status-title="statusTitle"
              @toggle-row-done="(saleId, itemId, rowIndex) => $emit('toggle-row-done', saleId, itemId, rowIndex)"
              @undo-row-done="(saleId, itemId, rowIndex) => $emit('undo-row-done', saleId, itemId, rowIndex)"
            />
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
export default {
  name: 'KdsOrdersBoard',

  components: {
    KdsItemsList: () => import('@/pages/pos/KdsItemsList.vue'),
  },

  props: {
    activeOrders: { type: Array, required: true },
    doneMap: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null },
    echoConnected: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },
    incomingOrder: { type: Object, default: null },
    isItemCompleted: { type: Function, required: true },
    statusTitle: { type: Function, required: true },
  },

  methods: {
    // ── Item / Order state helpers ────────────────────────────────────────

    rowKey(itemId, rowIndex) {
      return `${itemId}-${rowIndex}`
    },

    isRowDone(sale, itemId, rowIndex) {
      const item = sale.items?.find((i) => i.id === itemId)
      if (item?.completed_quantity > rowIndex) return true
      return !!this.doneMap[sale.id]?.[this.rowKey(itemId, rowIndex)]
    },

    getPreparationRows(sale) {
      const rows = []
      const items = sale.items?.filter((i) => i.product?.requires_preparation === true) || []
      items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          rows.push({ item, rowIndex: i })
        }
      })
      return rows
    },

    allDoneForSale(sale) {
      const rows = this.getPreparationRows(sale)
      return rows.length > 0 && rows.every((r) => this.isRowDone(sale, r.item.id, r.rowIndex))
    },

    // ── Elapsed time ──────────────────────────────────────────────────────

    elapsedTime(soldAt) {
      if (!soldAt) return '—'
      const diffMin = Math.floor((new Date() - new Date(soldAt)) / 60_000)
      if (diffMin < 1) return 'Ahora'
      if (diffMin < 60) return `${diffMin} min`
      return `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`
    },

    formatSoldAt(soldAt) {
      if (!soldAt) return ''
      return new Date(soldAt).toLocaleString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    },

    // ── Scroll ────────────────────────────────────────────────────────────

    scrollToOrder(orderId) {
      const el = document.getElementById('pos-kds-order-' + orderId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
  },
}
</script>

<style scoped>
/* ── Full-page background ── */
.kds-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* ── Live indicator dot ── */
.kds-live-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 4px;
}

.kds-live-dot--on {
  background: #4caf50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.25);
  animation: kds-pulse 2s infinite;
}

.kds-live-dot--off {
  background: #bdbdbd;
}

@keyframes kds-pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}

/* ── Order cards ── */
.kds-order-card {
  transition: box-shadow 0.2s, opacity 0.2s;
  overflow: hidden;
}

.kds-order-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12) !important;
}

.kds-order-card.kds-order-completed {
  border-color: #4caf50 !important;
  background: #f1f8e9;
}

/* ── Order header ── */
.kds-order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 12px 4px;
  gap: 8px;
}

.kds-order-number {
  font-size: 20px;
  font-weight: 800;
  color: #e65100;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.kds-order-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
}

.kds-elapsed {
  font-size: 11px;
  color: #757575;
  display: flex;
  align-items: center;
  gap: 2px;
  white-space: nowrap;
}

/* ── Customer ── */
.kds-customer {
  display: flex;
  align-items: center;
  gap: 6px;
}

.kds-customer-name {
  font-size: 14px;
  font-weight: 600;
  color: #37474f;
  letter-spacing: 0.2px;
}
</style>
