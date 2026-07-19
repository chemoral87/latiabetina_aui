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

      <KdsOrderGrid
        :active-orders="activeOrders"
        :done-map="doneMap"
        :is-item-completed="isItemCompleted"
        :status-title="statusTitle"
        @toggle-row-done="(saleId, itemId, rowIndex) => $emit('toggle-row-done', saleId, itemId, rowIndex)"
        @undo-row-done="(saleId, itemId, rowIndex) => $emit('undo-row-done', saleId, itemId, rowIndex)"
        @dismiss-order="(orderId) => $emit('dismiss-order', orderId)"
      />
    </template>
  </div>
</template>

<script>
export default {
  name: 'KdsOrdersBoard',

  components: {
    KdsOrderGrid: () => import('@/components/Pos/KdsOrderGrid.vue'),
  },

  props: {
    activeOrders: { type: Array, required: true },
    doneMap: { type: Object, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: null },
    echoConnected: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true },

    isItemCompleted: { type: Function, required: true },
    statusTitle: { type: Function, required: true },
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
</style>
