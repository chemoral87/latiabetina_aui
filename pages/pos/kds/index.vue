<template>
  <v-container id="pos-kds-page" fluid class="kds-page pa-3">
    <KdsOrdersBoard
      :active-orders="activeOrders"
      :done-map="doneMap"
      :loading="initialLoading"
      :error="error"
      :echo-connected="echoConnected"
      :sound-enabled="soundEnabled"
      :is-item-completed="isItemCompleted"
      :status-title="statusTitle"
      @reload="loadActiveOrders"
      @update:sound-enabled="soundEnabled = $event"
      @dismiss-order="dismissOrder"
      @toggle-row-done="toggleRowDone"
      @undo-row-done="undoRowDone"
    />
  </v-container>
</template>

<script>
import { createRealtimeListeners } from '~/utils/realtime'

export default {
  name: 'KdsPage',

  components: {
    KdsOrdersBoard: () => import('@/components/Pos/KdsOrdersBoard.vue'),
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
      // Dismissed order IDs (hidden from view) — plain object for Vue 2 reactivity
      dismissedIds: {},
      // Real-time
      echoConnected: false,
      kdsInitialized: false,  // guard against double-init on hard refresh

      // UI
      soundEnabled: true,
      elapsedInterval: null,


    }
  },

  computed: {
    /** Non-dismissed orders that have preparation items, sorted oldest-first */
    activeOrders() {
      return this.orders
        .filter((o) => !this.dismissedIds[o.id])
        .sort((a, b) => new Date(a.sold_at || a.created_at) - new Date(b.sold_at || b.created_at))
    },
  },

  created() {
    this.setupRealtimeListeners()
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
    // Clean up Echo subscriptions managed by createRealtimeListeners
    if (this._realtimeCleanup) this._realtimeCleanup()

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

      } catch (err) {
        this.error = 'No se pudieron cargar las órdenes.'
        this.$handleError?.(err)
      } finally {
        this.initialLoading = false
      }
    },

    // ── Real-time ─────────────────────────────────────────────────────────

    setupRealtimeListeners() {
      const orgIds = this.$store.getters.permissions['pos-kds'] ?? []

      const channelConfigs = orgIds.map((orgId) => ({
        name: `pos.kds.${orgId}`,
        events: {
          '.sale.created': (data) => this.handleIncomingSale(data),
        },
      }))

      this._realtimeCleanup = createRealtimeListeners(this.$echo, channelConfigs, {
        onConnected: () => { this.echoConnected = true },
        onDisconnected: () => { this.echoConnected = false },
        onError: () => { this.echoConnected = false },
      }, this._realtimeCleanup)
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

      this.orders = [...this.orders, data]
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

    // ── Item / Order state ────────────────────────────────────────────────

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

    rowKey(itemId, rowIndex) {
      return `${itemId}-${rowIndex}`
    },

    isRowDone(saleId, itemId, rowIndex) {
      const sale = this.orders.find((o) => o.id === saleId)
      const item = sale?.items?.find((i) => i.id === itemId)
      if (item?.completed_quantity > rowIndex) return true
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

    dismissOrder(orderId) {
      // Items were already individually completed via toggleRowDone.
      // Just hide the order from the KDS board.
      this.dismissedIds = { ...this.dismissedIds, [orderId]: true }
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
</style>
