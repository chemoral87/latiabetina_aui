<template>
  <v-container fluid class="kds-page pa-3">
    <!-- Loading -->
    <div v-if="initialLoading" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-progress-circular indeterminate color="primary" size="56" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-alert type="error" max-width="480">{{ error }}</v-alert>
    </div>

    <!-- All done — empty state -->
    <div v-else-if="activeOrders.length === 0" class="d-flex flex-column justify-center align-center" style="min-height: 60vh">
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
            <v-chip
              color="orange darken-2"
              dark
              small
              class="font-weight-bold"
            >
              {{ activeOrders.length }} {{ activeOrders.length === 1 ? 'orden' : 'órdenes' }}
            </v-chip>

            <!-- Global mark-all-done button -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  v-if="activeOrders.length > 1"
                  x-small
                  fab
                  dark
                  color="success"
                  v-bind="attrs"
                  v-on="on"
                  @click="completeAllOrders"
                >
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
              <v-btn
                icon
                small
                v-bind="attrs"
                v-on="on"
                :color="soundEnabled ? 'orange darken-2' : 'grey'"
                @click="soundEnabled = !soundEnabled"
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
                <span class="kds-live-dot" :class="echoConnected ? 'kds-live-dot--on' : 'kds-live-dot--off'" />
              </span>
            </template>
            <span>{{ echoConnected ? 'Conectado' : 'Sin conexión en tiempo real' }}</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- ── Incoming order notification banner ────────────────────────── -->
      <v-expand-transition>
        <v-alert
          v-if="incomingOrder"
          type="info"
          border="left"
          colored-border
          dense
          class="mb-4"
          dismissible
          @input="incomingOrder = null"
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

      <!-- ── Order cards grid ──────────────────────────────────────────── -->
      <v-row>
        <v-col
          v-for="order in activeOrders"
          :key="order.id"
          :id="'order-' + order.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <v-card outlined class="kds-order-card" :class="{ 'kds-order-completed': allDoneForSale(order) }">
            <!-- Order header -->
            <div class="kds-order-header">
              <div class="kds-order-number">{{ order.number }}</div>
              <div class="kds-order-header-right">
                <v-chip
                  v-if="orgNames[order.org_id]"
                  x-small
                  outlined
                  color="grey"
                  class="kds-org-chip"
                >
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
            <div class="kds-items-list pa-3 pt-0">
              <div
                v-for="item in getPreparationItems(order)"
                :key="item.id"
                class="kds-item-row"
                :class="{ 'kds-item-row-done': isItemDone(order.id, item.id) }"
                @click="toggleDone(order.id, item.id)"
              >
                <!-- Thumbnail -->
                <div class="kds-item-thumb">
                  <v-img
                    v-if="item.product?.image_s3"
                    :src="item.product.image_s3"
                    height="36"
                    width="36"
                    class="rounded"
                  >
                    <template #placeholder>
                      <v-sheet height="36" width="36" color="grey lighten-3" class="d-flex align-center justify-center rounded">
                        <v-icon x-small color="grey lighten-1">mdi-food</v-icon>
                      </v-sheet>
                    </template>
                  </v-img>
                  <v-sheet v-else height="36" width="36" color="grey lighten-3" class="d-flex align-center justify-center rounded">
                    <v-icon x-small color="grey lighten-1">mdi-food</v-icon>
                  </v-sheet>
                </div>

                <!-- Name & qty -->
                <div class="kds-item-info">
                  <div class="kds-item-name">{{ item.product?.name }}</div>
                  <div v-if="item.product?.description" class="kds-item-desc">{{ item.product.description }}</div>
                </div>

                <v-chip
                  small
                  :color="isItemDone(order.id, item.id) ? 'success' : 'orange darken-2'"
                  dark
                  class="font-weight-bold kds-item-qty"
                >
                  <v-icon v-if="isItemDone(order.id, item.id)" x-small class="mr-1">mdi-check</v-icon>
                  x{{ item.quantity }}
                </v-chip>
              </div>
            </div>

            <!-- Footer actions -->
            <v-divider class="mx-3" />
            <v-card-actions class="pa-3">
              <v-btn
                block
                small
                :color="allDoneForSale(order) ? 'success' : 'orange darken-2'"
                :dark="allDoneForSale(order)"
                :outlined="!allDoneForSale(order)"
                @click="allDoneForSale(order) ? dismissOrder(order.id) : markAllDone(order)"
              >
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

  middleware: ['authenticated', 'permission'],
  meta: { permission: 'pos-kds' },

  data() {
    return {
      // All sales loaded from daily endpoint (with preparation items only)
      orders: [],
      initialLoading: false,
      error: null,

      // Per-order, per-item done state: { saleId: { itemId: true } }
      doneMap: {},
      // Dismissed order IDs (hidden from view)
      dismissedIds: new Set(),

      // Real-time — one channel handle per subscribed org
      echoChannels: {},   // { orgId: channelInstance }
      echoConnected: false,
      incomingOrder: null,

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
      back: '/pos',
    })

    // Subscribe to real-time channels immediately (don't wait for data load).
    // Org IDs come from the user's pos-kds permission so the board receives
    // broadcasts even when it opens with no active orders.
    this.setupRealtimeListeners()

    // Load today's orders with preparation items
    this.loadActiveOrders()

    // Update elapsed times every 30 seconds
    this.elapsedInterval = setInterval(() => this.$forceUpdate(), 30_000)

    // Mobile reconnect: reload when the tab regains visibility
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
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
    // ── Data loading ──────────────────────────────────────────────────────

    async loadActiveOrders() {
      try {
        this.initialLoading = true
        this.error = null

        const today = new Date().toISOString().slice(0, 10)
        const response = await this.$repository.Sale.daily(today)

        // response is { data: [sale, sale, ...] }
        const allSales = response?.data || response || []

        // Keep only sales with at least one item that requires preparation
        const prepSales = allSales.filter((sale) =>
          sale.items?.some((item) => item.product?.requires_preparation === true)
        )

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

        // Leave first to clear any stale listener from a previous visit
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

      // Reflect the current Pusher connection state in the indicator
      const state = this.$echo?.connector?.pusher?.connection?.state
      if (state) this.echoConnected = state === 'connected'
    },

    handleIncomingSale(data) {
      if (this.soundEnabled) {
        this.playNotificationSound()
      }

      this.$notify({
        type: 'info',
        message: `Nueva orden: ${data.number}${data.customer_name ? ' — ' + data.customer_name : ''}`,
      })

      // Only show orders that have preparation items
      const hasPrepItems = data.items?.some((i) => i.product?.requires_preparation === true)
      if (!hasPrepItems) return

      // Avoid duplicates
      if (this.orders.some((o) => o.id === data.id)) return

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
      const el = document.getElementById('order-' + orderId)
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

    getPreparationItems(sale) {
      return sale.items?.filter((item) => item.product?.requires_preparation === true) || []
    },

    isItemDone(saleId, itemId) {
      return !!this.doneMap[saleId]?.[itemId]
    },

    toggleDone(saleId, itemId) {
      const current = this.doneMap[saleId]?.[itemId] || false
      this.$set(this.doneMap, saleId, {
        ...(this.doneMap[saleId] || {}),
        [itemId]: !current,
      })
    },

    allDoneForSale(sale) {
      const items = this.getPreparationItems(sale)
      return items.length > 0 && items.every((item) => this.isItemDone(sale.id, item.id))
    },

    markAllDone(sale) {
      const items = this.getPreparationItems(sale)
      const map = { ...(this.doneMap[sale.id] || {}) }
      items.forEach((item) => { map[item.id] = true })
      this.$set(this.doneMap, sale.id, map)
    },

    dismissOrder(saleId) {
      this.dismissedIds = new Set([...this.dismissedIds, saleId])
      this.$nextTick(() => {
        if (this.activeOrders.length > 0) {
          this.scrollToOrder(this.activeOrders[0].id)
        }
      })
    },

    completeAllOrders() {
      if (this.completingAll || this.activeOrders.length === 0) return
      this.completingAll = true

      const orders = this.activeOrders
      orders.forEach((order) => {
        const items = this.getPreparationItems(order)
        const map = { ...(this.doneMap[order.id] || {}) }
        items.forEach((item) => { map[item.id] = true })
        this.$set(this.doneMap, order.id, map)
      })

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
  0%   { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70%  { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
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

/* ── Items list ── */
.kds-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kds-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.kds-item-row:hover {
  background: #fff3e0;
}

.kds-item-row-done {
  opacity: 0.6;
  background: #e8f5e9 !important;
}

.kds-item-row-done:hover {
  background: #c8e6c9 !important;
}

.kds-item-thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
}

.kds-item-info {
  flex: 1;
  min-width: 0;
}

.kds-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.kds-item-desc {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kds-item-qty {
  flex-shrink: 0;
  min-width: 44px;
  justify-content: center;
  font-size: 12px;
}
</style>
