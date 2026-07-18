<template>
  <v-container id="pos-kds-page" fluid class="kds-page pa-3">
    <!-- Loading -->
    <div v-if="initialLoading" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-progress-circular indeterminate color="primary" size="56" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-alert type="error" max-width="480">{{ error }}</v-alert>
    </div>

    <!-- All done — empty state -->
    <div v-else-if="activeOrders.length === 0" class="d-flex flex-column justify-center align-center"
      style="min-height: 60vh">
      <v-icon size="72" color="success">mdi-check-circle-outline</v-icon>
      <div class="text-h6 mt-4 grey--text">Sin órdenes pendientes</div>
      <div class="text-body-2 grey--text mt-1">Todas las órdenes han sido completadas</div>
      <div class="mt-6">
        <v-btn outlined color="grey" @click="loadActiveOrders">
          <v-icon left small>mdi-refresh</v-icon>
          Recargar
        </v-btn>
      </div>
    </div>

    <!-- Orders board -->
    <template v-else>
      <!-- ── Header strip ──────────────────────────────────────────────── -->
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

            <!-- Global mark-all-done button -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn id="pos-kds-complete-all-button" v-if="activeOrders.length > 1" x-small fab dark color="success"
                  v-bind="attrs" v-on="on" @click="completeAllOrders">
                  <v-icon>mdi-check-all</v-icon>
                </v-btn>
              </template>
              <span>Marcar todo listo y completar todas las órdenes</span>
            </v-tooltip>
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex align-center" style="gap: 10px">
          <!-- Sound toggle -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon small v-bind="attrs" v-on="on" :color="soundEnabled ? 'orange darken-2' : 'grey'"
                @click="soundEnabled = !soundEnabled">
                <v-icon>{{ soundEnabled ? 'mdi-volume-high' : 'mdi-volume-off' }}</v-icon>
              </v-btn>
            </template>
            <span>{{ soundEnabled ? 'Sonido activado' : 'Sonido desactivado' }}</span>
          </v-tooltip>

          <!-- Live indicator -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="d-flex align-center">
                <span class="kds-live-dot" :class="echoConnected ? 'kds-live-dot--on' : 'kds-live-dot--off'" />
              </span>
            </template>
            <span>{{ echoConnected ? 'Conectado' : 'Sin conexión en tiempo real' }}</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- ── Incoming order notification banner ────────────────────────── -->
      <v-expand-transition>
        <v-alert v-if="incomingOrder" type="info" border="left" colored-border dense class="mb-4" dismissible
          @input="incomingOrder = null">
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

      <!-- ── Order cards grid ──────────────────────────────────────────── -->
      <v-row>
        <v-col v-for="order in activeOrders" :key="order.id" :id="'pos-kds-order-' + order.id" cols="12" sm="6" md="4"
          lg="3" xl="2">
          <v-card outlined class="kds-order-card" :class="{ 'kds-order-completed': allDoneForSale(order) }">
            <!-- Order header -->
            <div class="kds-order-header">
              <div class="kds-order-number">{{ order.number }}</div>
              <div class="kds-order-header-right">
                <v-chip v-if="orgNames[order.org_id]" x-small outlined color="grey" class="kds-org-chip">
                  {{ orgNames[order.org_id] }}
                </v-chip>
                <div class="kds-elapsed" :title="formatSoldAt(order.sold_at)">
                  <v-icon x-small>mdi-clock-outline</v-icon>
                  {{ elapsedTime(order.sold_at) }}
                </div>
              </div>
            </div>

            <!-- Customer name -->
            <div v-if="order.customer_name" class="kds-customer px-3 pt-1 pb-0">
              <v-icon x-small color="grey">mdi-account</v-icon>
              <span class="text-caption grey--text">{{ order.customer_name }}</span>
            </div>

            <v-divider class="mx-3 my-2" />

            <!-- Items list -->
            <KdsItemsList :order="order" :done-map="doneMap" :is-item-completed="isItemCompleted"
              :status-title="statusTitle" @toggle-row-done="toggleRowDone" @undo-row-done="undoRowDone" />

            <!-- Footer actions -->
            <v-divider class="mx-3" />
            <v-card-actions class="pa-3">
              <v-btn block small :color="allDoneForSale(order) ? 'success' : 'orange darken-2'"
                :dark="allDoneForSale(order)" :outlined="!allDoneForSale(order)" :loading="completingOrder === order.id"
                @click="allDoneForSale(order) ? dismissOrder(order) : markAllDone(order)">
                <v-icon left small>{{ allDoneForSale(order) ? 'mdi-check-circle' : 'mdi-check-all' }}</v-icon>
                {{ allDoneForSale(order) ? 'Completar orden' : 'Marcar todo listo' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
export default {
  name: 'KdsPage',

  components: {
    KdsItemsList: () => import('@/pages/pos/KdsItemsList.vue'),
  },

  middleware: ['authenticated', 'permission'],
  meta: { permission: 'pos-kds' },

  data() {
    return {
      // All sales loaded from daily endpoint (with preparation items only)
      orders: [],
      initialLoading: false,
      error: null,

      // Per-order, per-item done state: { saleId: { `itemId-rowIndex`: true } }
      doneMap: {},
      // Dismissed order IDs (hidden from view)
      dismissedIds: new Set(),
      // ID of the order currently being completed via API
      completingOrder: null,

      // Real-time — one channel handle per subscribed org
      echoChannels: {},   // { orgId: channelInstance }
      echoConnected: false,
      incomingOrder: null,
      kdsInitialized: false,  // guard against double-init on hard refresh

      // UI
      soundEnabled: true,
      elapsedInterval: null,
      completingAll: false,

      // Cache org names from loaded orders
      orgNames: {},
    }
  },

  computed: {
    /** Non-dismissed orders that have preparation items, sorted oldest-first */
    activeOrders() {
      return this.orders
        .filter((o) => !this.dismissedIds.has(o.id))
        .sort((a, b) => new Date(a.sold_at || a.created_at) - new Date(b.sold_at || b.created_at))
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Pantalla de Cocina',
      icon: 'mdi-chef-hat',

    })

    this.initKds()
  },

  beforeDestroy() {
    // Leave all subscribed Echo channels
    Object.keys(this.echoChannels).forEach((orgId) => {
      this.$echo.leave(`pos.kds.${orgId}`)
    })
    this.echoChannels = {}

    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval)
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
  },

  methods: {
    // ── Init (deferred until auth is ready) ───────────────────────────────

    initKds() {
      if (this.kdsInitialized) return
      this.kdsInitialized = true

      this.setupRealtimeListeners()
      this.loadActiveOrders()
      this.elapsedInterval = setInterval(() => this.$forceUpdate(), 30_000)
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
    },

    // ── Data loading ──────────────────────────────────────────────────────

    async loadActiveOrders() {
      try {
        this.initialLoading = true
        this.error = null

        // Fetch all sales currently in 'preparing' status (no date constraint).
        // This is the source of truth for what the kitchen still needs to make.
        const response = await this.$repository.Sale.preparing()
        const prepSales = response?.data || response || []

        this.orders = prepSales

        // Cache org names for the org chip
        prepSales.forEach((sale) => this.cacheOrgName(sale))
      } catch (err) {
        this.error = 'No se pudieron cargar las órdenes.'
        this.$handleError?.(err)
      } finally {
        this.initialLoading = false
      }
    },

    // ── Real-time ─────────────────────────────────────────────────────────

    /**
     * Subscribe to pos.kds.{orgId} for every org the user has pos-kds access to.
     * Mirrors the auditorium pattern: called once in mounted(), one channel per org,
     * cleaned up in beforeDestroy().
     */
    setupRealtimeListeners() {
      if (!this.$echo) return

      const orgIds = this.$store.getters.permissions['pos-kds'] ?? []

      orgIds.forEach((orgId) => {
        if (this.echoChannels[orgId]) return // already subscribed

        const channelName = `pos.kds.${orgId}`

        // Leave first to clear any stale handler from a previous visit
        this.$echo.leave(channelName)

        const channel = this.$echo.channel(channelName)

        channel
          .subscribed(() => { this.echoConnected = true })
          .error(() => { this.echoConnected = false })
          .listen('.sale.created', (data) => {
            this.handleIncomingSale(data)
          })

        this.$set(this.echoChannels, orgId, channel)
      })

      const state = this.$echo?.connector?.pusher?.connection?.state
      if (state) this.echoConnected = state === 'connected'
    },

    handleIncomingSale(data) {
      // Only show orders that have preparation items
      const hasPrepItems = data.items?.some((i) => i.product?.requires_preparation === true)
      if (!hasPrepItems) return

      // Avoid duplicates — all side effects gated here
      if (this.orders.some((o) => o.id === data.id)) return

      if (this.soundEnabled) {
        this.playNotificationSound()
      }

      this.$notify({
        type: 'info',
        message: `Nueva orden: ${data.number}${data.customer_name ? ' — ' + data.customer_name : ''}`,
      })

      this.cacheOrgName(data)
      this.orders = [...this.orders, data]
      this.incomingOrder = data

      this.$nextTick(() => this.scrollToOrder(data.id))
    },

    /**
     * Mobile reconnect: when the tab becomes visible again, reload the daily
     * sales so any orders missed while the screen was off are picked up.
     * Mirrors the auditorium handleVisibilityChange pattern.
     */
    async handleVisibilityChange() {
      if (document.hidden || !this.$uaParser?.isMobile?.()) return

      try {
        await this.loadActiveOrders()
      } catch (_) {
        // Silent — loadActiveOrders handles its own error state
      }
    },

    scrollToOrder(orderId) {
      const el = document.getElementById('pos-kds-order-' + orderId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },

    // ── Org name cache ─────────────────────────────────────────────────────

    cacheOrgName(sale) {
      if (!sale.org_id) return
      const orgName =
        sale.organization?.name ||
        this.orgNames[sale.org_id] ||
        `Org #${sale.org_id}`
      this.$set(this.orgNames, sale.org_id, orgName)
    },

    // ── Item / Order state ────────────────────────────────────────────────

    /**
     * Expand each preparation item into N individual rows (one per unit).
     * e.g. { product: 'cocinar', quantity: 2 } → two rows
     */
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

    getPreparationItems(sale) {
      return sale.items?.filter((item) => item.product?.requires_preparation === true) || []
    },

    rowKey(itemId, rowIndex) {
      return `${itemId}-${rowIndex}`
    },

    isRowDone(saleId, itemId, rowIndex) {
      const sale = this.orders.find((o) => o.id === saleId)
      const item = sale?.items?.find((i) => i.id === itemId)
      if (item?.completed_quantity > rowIndex) {
        return true
      }

      return !!this.doneMap[saleId]?.[this.rowKey(itemId, rowIndex)]
    },

    isItemCompleted(item) {
      return item?.completed_quantity >= item?.quantity
    },

    preparationStatusLabel(code) {
      const labels = {
        PEN: 'Pendiente',
        REA: 'Listo',
        COM: 'Completada',
      }
      return labels[code] || code || '—'
    },

    statusTitle(item) {
      if (!item?.preparation_status) return ''
      return `${this.preparationStatusLabel(item.preparation_status)} ${item.preparation_status}`
    },

    getPreparationRowsForItem(sale, itemId) {
      return this.getPreparationRows(sale).filter((r) => r.item.id === itemId)
    },

    markRowDone(saleId, itemId, rowIndex) {
      const map = { ...(this.doneMap[saleId] || {}) }
      map[this.rowKey(itemId, rowIndex)] = true
      this.$set(this.doneMap, saleId, map)
    },

    async toggleRowDone(saleId, itemId, rowIndex) {
      if (this.isRowDone(saleId, itemId, rowIndex)) return

      const sale = this.orders.find((o) => o.id === saleId)
      if (!sale) return

      const key = this.rowKey(itemId, rowIndex)
      this.markRowDone(saleId, itemId, rowIndex)

      try {
        const response = await this.$repository.Sale.updateItem(saleId, itemId, 'COM')
        const updatedItem = response?.data
        if (updatedItem) {
          const itemIndex = sale.items.findIndex((i) => i.id === itemId)
          if (itemIndex !== -1) {
            this.$set(sale.items, itemIndex, updatedItem)
          }
        }
      } catch (err) {
        this.$handleError?.(err)
        const map = { ...(this.doneMap[saleId] || {}) }
        map[key] = false
        this.$set(this.doneMap, saleId, map)
      }
    },

    async undoRowDone(saleId, itemId, rowIndex) {
      const sale = this.orders.find((o) => o.id === saleId)
      if (!sale) return

      const key = this.rowKey(itemId, rowIndex)
      const map = { ...(this.doneMap[saleId] || {}) }
      map[key] = false
      this.$set(this.doneMap, saleId, map)

      try {
        const response = await this.$repository.Sale.updateItem(saleId, itemId, 'PEN')
        const updatedItem = response?.data
        if (updatedItem) {
          const itemIndex = sale.items.findIndex((i) => i.id === itemId)
          if (itemIndex !== -1) {
            this.$set(sale.items, itemIndex, updatedItem)
          }
        }
      } catch (err) {
        this.$handleError?.(err)
        this.$set(map, key, true)
        this.$set(this.doneMap, saleId, map)
      }
    },

    allDoneForSale(sale) {
      const rows = this.getPreparationRows(sale)
      return rows.length > 0 && rows.every((r) => this.isRowDone(sale.id, r.item.id, r.rowIndex))
    },

    markAllDone(sale) {
      return this.dismissOrder(sale)
    },

    async dismissOrder(order) {
      this.completingOrder = order.id
      try {
        await this.$repository.Sale.complete(order.id)
      } catch (err) {
        this.$handleError?.(err)
      } finally {
        this.completingOrder = null
      }
      this.dismissedIds = new Set([...this.dismissedIds, order.id])
      this.$nextTick(() => {
        if (this.activeOrders.length > 0) {
          this.scrollToOrder(this.activeOrders[0].id)
        }
      })
    },

    async completeAllOrders() {
      if (this.completingAll || this.activeOrders.length === 0) return
      this.completingAll = true

      const orders = this.activeOrders

      // Mark all rows done locally
      orders.forEach((order) => {
        const rows = this.getPreparationRows(order)
        const map = { ...(this.doneMap[order.id] || {}) }
        rows.forEach((r) => { map[this.rowKey(r.item.id, r.rowIndex)] = true })
        this.$set(this.doneMap, order.id, map)
      })

      // Complete all orders via API
      await Promise.allSettled(orders.map((o) => this.$repository.Sale.complete(o.id)))

      this.dismissedIds = new Set([...this.dismissedIds, ...orders.map((o) => o.id)])

      this.playNotificationSound()
      this.$notify({ type: 'success', message: 'Todas las órdenes han sido completadas.' })

      setTimeout(() => { this.completingAll = false }, 2000)
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
        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit',
      })
    },

    // ── Audio ─────────────────────────────────────────────────────────────

    async playNotificationSound() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        await ctx.resume()

        const masterGain = ctx.createGain()
        masterGain.connect(ctx.destination)
        masterGain.gain.setValueAtTime(0.3, ctx.currentTime)
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7)

        const note = (freq, start, dur) => {
          const osc = ctx.createOscillator()
          const g = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
          g.gain.setValueAtTime(0, ctx.currentTime + start)
          g.gain.linearRampToValueAtTime(1, ctx.currentTime + start + 0.02)
          g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur)
          osc.connect(g).connect(masterGain)
          osc.start(ctx.currentTime + start)
          osc.stop(ctx.currentTime + start + dur)
        }

        note(698, 0, 0.12)    // F5
        note(1047, 0.13, 0.2) // C6

        setTimeout(() => ctx.close(), 1000)
      } catch (_) {
        // Audio not supported
      }
    },
  },
}
</script>

<style scoped>
.kds-page {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
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

.kds-org-chip {
  font-size: 10px;
  height: 20px !important;
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
  gap: 4px;
}
</style>
