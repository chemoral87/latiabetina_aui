<template>
  <v-container fluid class="kds-page pa-3">
    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-progress-circular indeterminate color="primary" size="56" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="d-flex justify-center align-center" style="min-height: 60vh">
      <v-alert type="error" max-width="480">{{ error }}</v-alert>
    </div>

    <!-- No preparation items -->
    <div v-else-if="preparationItems.length === 0" class="d-flex flex-column justify-center align-center" style="min-height: 60vh">
      <v-icon size="72" color="success">mdi-check-circle-outline</v-icon>
      <div class="text-h6 mt-4 grey--text">Sin artículos para preparar</div>
      <v-btn class="mt-6" color="primary" @click="goToPos">
        <v-icon left>mdi-point-of-sale</v-icon>
        Volver al POS
      </v-btn>
    </div>

    <!-- Order card -->
    <template v-else>
      <!-- Header strip -->
      <v-row align="center" class="mb-4">
        <v-col cols="auto">
          <v-icon size="32" color="orange darken-2">mdi-chef-hat</v-icon>
        </v-col>
        <v-col>
          <div class="text-h5 font-weight-bold">
            Orden <span class="orange--text text--darken-2">{{ sale.number }}</span>
          </div>
          <div v-if="sale.customer_name" class="text-body-2 grey--text">
            <v-icon small>mdi-account</v-icon> {{ sale.customer_name }}
          </div>
        </v-col>
        <v-col cols="auto" class="d-flex align-center" style="gap: 8px">
          <!-- Real-time indicator -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="d-flex align-center">
                <span class="kds-live-dot" :class="echoConnected ? 'kds-live-dot--on' : 'kds-live-dot--off'" />
              </span>
            </template>
            <span>{{ echoConnected ? 'Escuchando nuevas órdenes' : 'Sin conexión en tiempo real' }}</span>
          </v-tooltip>

          <v-chip color="orange darken-2" dark class="font-weight-bold text-uppercase">
            <v-icon left>mdi-clock-outline</v-icon>
            En preparación
          </v-chip>
        </v-col>
      </v-row>

      <!-- Incoming order notification banner -->
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
            <v-btn small color="primary" @click="switchToOrder(incomingOrder)">
              <v-icon left small>mdi-swap-horizontal</v-icon>
              Ver esta orden
            </v-btn>
          </div>
        </v-alert>
      </v-expand-transition>

      <!-- Items grid -->
      <v-row>
        <v-col
          v-for="item in preparationItems"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            outlined
            class="kds-item-card"
            :class="{ 'kds-item-done': item.done }"
            @click="toggleDone(item)"
          >
            <!-- Product image -->
            <v-img
              v-if="item.product.image_s3"
              :src="item.product.image_s3"
              height="140"
              class="kds-item-img"
            >
              <template #placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey lighten-2" />
                </v-row>
              </template>
            </v-img>
            <v-sheet v-else height="140" color="grey lighten-4" class="d-flex align-center justify-center">
              <v-icon size="56" color="grey lighten-1">mdi-food</v-icon>
            </v-sheet>

            <v-card-text class="pb-2" style="position: relative">
              <!-- Done badge -->
              <div class="kds-done-badge" v-if="item.done">
                <v-icon color="white" size="36">mdi-check-bold</v-icon>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div class="text-subtitle-1 font-weight-bold kds-item-name">{{ item.product.name }}</div>
                <v-chip color="orange darken-2" dark small class="font-weight-bold ml-2">
                  x{{ item.quantity }}
                </v-chip>
              </div>

              <div v-if="item.product.description" class="text-caption grey--text mt-1 kds-item-desc">
                {{ item.product.description }}
              </div>
            </v-card-text>

            <v-card-actions class="pt-0 px-3 pb-3">
              <v-btn
                block
                :color="item.done ? 'success' : 'orange darken-2'"
                :outlined="!item.done"
                :dark="item.done"
                small
                @click.stop="toggleDone(item)"
              >
                <v-icon left small>{{ item.done ? 'mdi-check-circle' : 'mdi-silverware' }}</v-icon>
                {{ item.done ? 'Listo' : 'Marcar listo' }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Footer actions -->
      <v-row class="mt-6" justify="center">
        <v-col cols="12" sm="auto">
          <v-btn
            large
            block
            color="success"
            :disabled="!allDone"
            @click="goToPos"
          >
            <v-icon left>mdi-check-all</v-icon>
            Todos listos — Volver al POS
          </v-btn>
        </v-col>
        <v-col cols="12" sm="auto">
          <v-btn large block outlined color="primary" @click="goToPos">
            <v-icon left>mdi-point-of-sale</v-icon>
            Ir al POS
          </v-btn>
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
      sale: null,
      loading: false,
      error: null,
      // Local done-state per item (keyed by sale_item id)
      doneMap: {},
      // Real-time
      echoChannel: null,
      echoConnected: false,
      // Incoming order notification (from broadcast)
      incomingOrder: null,
    }
  },

  computed: {
    /** Only items whose product requires preparation */
    preparationItems() {
      if (!this.sale?.items) return []
      return this.sale.items
        .filter((item) => item.product?.requires_preparation === true)
        .map((item) => ({
          ...item,
          done: !!this.doneMap[item.id],
        }))
    },

    allDone() {
      return this.preparationItems.length > 0 && this.preparationItems.every((i) => i.done)
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', {
      title: 'Pantalla de Cocina',
      icon: 'mdi-chef-hat',
      back: '/pos',
    })

    const saleId = this.$route.query.sale_id
    if (saleId) {
      this.loadSale(saleId)
    } else {
      this.error = 'No se especificó una orden.'
    }
  },

  beforeDestroy() {
    this.teardownRealtimeListeners()
  },

  methods: {
    // ── Data ────────────────────────────────────────────────────────────────

    async loadSale(id) {
      try {
        this.loading = true
        this.sale = await this.$repository.Sale.show(id)
        // Once we know the org, subscribe to its KDS channel
        if (this.sale?.org_id) {
          this.setupRealtimeListeners(this.sale.org_id)
        }
      } catch (err) {
        this.error = 'No se pudo cargar la orden.'
        this.$handleError?.(err)
      } finally {
        this.loading = false
      }
    },

    // ── Real-time ────────────────────────────────────────────────────────────

    setupRealtimeListeners(orgId) {
      if (!this.$echo || !orgId) return

      const channelName = `pos.kds.${orgId}`
      this.echoChannel = this.$echo.channel(channelName)

      // Track connection state
      this.$echo.connector.pusher.connection.bind('connected', () => {
        this.echoConnected = true
      })
      this.$echo.connector.pusher.connection.bind('disconnected', () => {
        this.echoConnected = false
      })
      this.$echo.connector.pusher.connection.bind('unavailable', () => {
        this.echoConnected = false
      })

      // Reflect current state right away
      const socketState = this.$echo.connector.pusher.connection.state
      this.echoConnected = socketState === 'connected'

      // Listen for new sales that contain preparation items
      this.echoChannel.listen('.sale.created', (data) => {
        this.handleIncomingSale(data)
      })
    },

    teardownRealtimeListeners() {
      if (this.echoChannel && this.sale?.org_id) {
        this.$echo.leave(`pos.kds.${this.sale.org_id}`)
        this.echoChannel = null
      }
    },

    /**
     * A new sale arrived via WebSocket.
     * - If no sale is currently displayed → show it directly.
     * - If a sale is already being worked on → show a notification banner.
     */
    handleIncomingSale(data) {
      // data shape matches SaleCreated::broadcastWith():
      // { id, number, org_id, customer_name, items: [{ id, quantity, product: { ... } }] }

      // Notify with a snackbar so the cook gets an audio-visual cue
      this.$notify({
        type: 'info',
        message: `Nueva orden: ${data.number}${data.customer_name ? ' — ' + data.customer_name : ''}`,
      })

      if (!this.sale) {
        // No current order — load and display directly
        this.loadSale(data.id)
      } else {
        // Busy with current order — show the banner
        this.incomingOrder = data
      }
    },

    /** Switch the display to the incoming order */
    switchToOrder(order) {
      this.incomingOrder = null
      this.doneMap = {}
      this.loadSale(order.id)
      // Update the URL so the page is shareable / refreshable
      this.$router.replace(`/pos/kds?sale_id=${order.id}`)
    },

    // ── UI ───────────────────────────────────────────────────────────────────

    toggleDone(item) {
      this.$set(this.doneMap, item.id, !this.doneMap[item.id])
    },

    goToPos() {
      this.$router.push('/pos')
    },
  },
}
</script>

<style scoped>
.kds-page {
  min-height: 100vh;
  background-color: #fafafa;
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

/* ── Item cards ── */
.kds-item-card {
  cursor: pointer;
  transition: box-shadow 0.2s, opacity 0.2s;
  overflow: hidden;
}

.kds-item-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12) !important;
}

.kds-item-card.kds-item-done {
  opacity: 0.65;
}

.kds-item-card.kds-item-done .kds-item-img {
  filter: grayscale(60%);
}

.kds-done-badge {
  position: absolute;
  top: -36px; /* overlaps the image edge */
  right: 8px;
  background: #4caf50;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.kds-item-name {
  line-height: 1.2;
}

.kds-item-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
