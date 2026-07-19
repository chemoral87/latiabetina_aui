<template>
  <v-row>      <v-col
        v-for="order in activeOrders"
        :id="'pos-kds-order-' + order.id"
        :key="order.id"
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

        <!-- Dismiss progress bar (20s countdown) -->
        <v-progress-linear
          v-if="orderTimers[order.id]"
          :value="orderTimers[order.id]?.progress || 0"
          height="4"
          color="success"
          absolute
          bottom
          class="kds-dismiss-progress"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const DISMISS_DELAY_MS = 20_000

export default {
  name: 'KdsOrderGrid',

  components: {
    KdsItemsList: () => import('@/pages/pos/KdsItemsList.vue'),
  },

  props: {
    activeOrders: { type: Array, required: true },
    doneMap: { type: Object, required: true },
    isItemCompleted: { type: Function, required: true },
    statusTitle: { type: Function, required: true },
  },

  data() {
    return {
      orderTimers: {},
    }
  },

  watch: {
    doneMap: {
      handler() {
        this.activeOrders.forEach((order) => {
          if (this.allDoneForSale(order)) {
            // All items done — start or keep the dismissal timer
            if (!this.orderTimers[order.id]) {
              this.startDismissTimer(order)
            }
          } else if (this.orderTimers[order.id]) {
            // Some item was undone — cancel the dismissal timer
            this.cancelDismissTimer(order.id)
          }
        })
      },
      deep: true,
    },
  },

  beforeDestroy() {
    Object.values(this.orderTimers).forEach((timer) => {
      clearInterval(timer.intervalId)
    })
  },

  methods: {
    // ── Item / Order state helpers ────────────────────────────────────────

    rowKey(itemId, rowIndex) {
      return `${itemId}-${rowIndex}`
    },

    isRowDone(sale, itemId, rowIndex) {
      // Local doneMap is the source of truth for UI actions (toggle/undo).
      // Only fall back to server-side completed_quantity if no local state.
      const doneEntry = this.doneMap[sale.id]?.[this.rowKey(itemId, rowIndex)]
      if (doneEntry !== undefined) return !!doneEntry

      const item = sale.items?.find((i) => i.id === itemId)
      if (item?.completed_quantity > rowIndex) return true
      return false
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

    // ── Dismiss timer ───────────────────────────────────────────────────

    startDismissTimer(order) {
      if (this.orderTimers[order.id]) return

      const startedAt = Date.now()
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startedAt
        const progress = Math.min(100, (elapsed / DISMISS_DELAY_MS) * 100)

        this.$set(this.orderTimers, order.id, {
          progress,
          startedAt,
          intervalId,
        })

        if (progress >= 100) {
          this._finishDismissTimer(order.id)
        }
      }, 100)

      this.$set(this.orderTimers, order.id, {
        progress: 0,
        startedAt,
        intervalId,
      })
    },

    cancelDismissTimer(orderId) {
      const timer = this.orderTimers[orderId]
      if (!timer) return
      clearInterval(timer.intervalId)
      this.$delete(this.orderTimers, orderId)
    },

    _finishDismissTimer(orderId) {
      const timer = this.orderTimers[orderId]
      if (timer) clearInterval(timer.intervalId)
      this.$delete(this.orderTimers, orderId)
      this.$emit('dismiss-order', orderId)
    },
  },
}
</script>

<style scoped>
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

/* ── Dismiss progress bar ── */
.kds-dismiss-progress {
  margin: 0;
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
