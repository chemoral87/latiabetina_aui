<template>
  <v-dialog v-model="localVisible" max-width="700" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon left color="info">mdi-history</v-icon>
        Historial de asientos
        <v-spacer />
        <v-btn icon @click="localVisible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text style="max-height: 60vh; padding: 0">
        <div v-if="historyLoading" class="d-flex justify-center align-center pa-8">
          <v-progress-circular indeterminate color="info" />
        </div>

        <v-simple-table v-else-if="seatTransitions.length" dense>
          <template #default>
            <thead>
              <tr>
                <th colspan="2" style="padding: 6px 16px 4px">
                  <div class="d-flex align-center" style="gap: 8px">
                    <v-select
v-model="historyIconFilter" :items="historyFilterOptions" label="Filtrar por estado"
                      dense outlined hide-details clearable flat style="max-width: 220px; font-size: 11px"
                      class="history-filter-select">
                      <template #selection="{ item }">
                        <v-icon x-small :color="item.color" class="mr-2">{{ item.mdi }}</v-icon>
                        <span style="font-size: 11px">{{ item.text }}</span>
                      </template>
                      <template #item="{ item }">
                        <v-icon x-small :color="item.color" class="mr-2">{{ item.mdi }}</v-icon>
                        <span style="font-size: 11px">{{ item.text }}</span>
                      </template>
                    </v-select>
                  </div>
                </th>
              </tr>
              <tr>
                <th>Seat</th>
                <th>Transiciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="seat in filteredSeatTransitions" :key="seat.id">
                <td class="text-caption" style="white-space: nowrap; font-family: monospace">
                  {{ seat.label }}
                </td>
                <td>
                  <div class="d-flex align-center flex-wrap" style="gap: 0px; row-gap: 6px">
                    <div v-for="(step, si) in seat.transitions" :key="`t-${seat.id}-${si}`" style="display: contents">
                      <div
class="d-flex align-center" :style="{
                        gap: '1px',
                        border: '1.5px solid ' + step.color,
                        borderRadius: '4px',
                        padding: '2px 2px',
                        background: 'transparent',
                        marginRight: '2px'
                      }" :title="`${getHistoryUser(step.createdBy).name}\n${getHistoryUser(step.createdBy).email}`">
                        <v-icon :color="step.color" style="margin-top: -2px">{{ step.mdi }}</v-icon>
                        <div class="d-flex flex-column">
                          <span style="line-height: 1; font-weight: 700; color: #333; font-size: 8px">
                            {{ getHistoryUser(step.createdBy).first_name }}
                            <br>
                            {{ getHistoryUser(step.createdBy).last_name }}
                          </span>
                          <span class="grey--text" style="font-size: 7px;">
                            {{ step.time }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <div v-else class="pa-6 text-center grey--text">
          <v-icon large>mdi-clipboard-text-off-outline</v-icon>
          <div class="mt-2">Sin historial disponible</div>
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="localVisible = false">Cerrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { STATUS_CONFIG } from "~/constants/auditorium"

export default {
  name: "AuditoriumSeatsHistory",
  props: {
    value: { type: Boolean, default: false },
    historyLoading: { type: Boolean, default: false },
    historyLog: { type: Array, default: () => [] },
    historyUsers: { type: Array, default: () => [] },
  },
  data() {
    return {
      historyIconFilter: null,
    }
  },
  computed: {
    localVisible: {
      get() { return this.value },
      set(val) { this.$emit('input', val) },
    },

    filteredSeatTransitions() {
      if (!this.historyIconFilter) return this.seatTransitions
      return this.seatTransitions.filter((seat) =>
        seat.transitions.some((step) => step.status === this.historyIconFilter)
      )
    },

    seatTransitions() {
      const map = {}
      this.historyLog.forEach((entry) => {
        const seats = entry.seat_ids || []
        const cfg = STATUS_CONFIG[entry.status] || {}
        const step = {
          status: entry.status,
          color: cfg.color || '#ffeb3b',
          mdi: cfg.mdi || 'mdi-circle',
          label: cfg.label || entry.status || '—',
          date: new Date(entry.created_at).toLocaleString(),
          time: new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdBy: entry.created_by,
        }
        seats.forEach((seatId) => {
          if (!map[seatId]) map[seatId] = []
          map[seatId].push(step)
        })
      })
      return Object.keys(map).sort().map((id) => ({ id, label: this.formatSeatId(id), transitions: map[id] }))
    },

    activeStatusConfig() {
      return Object.keys(STATUS_CONFIG)
        .filter(key => STATUS_CONFIG[key].active !== false)
        .reduce((acc, key) => {
          acc[key] = STATUS_CONFIG[key]
          return acc
        }, {})
    },

    historyFilterConfig() {
      const config = { ...this.activeStatusConfig }
      delete config.e
      return config
    },

    historyFilterOptions() {
      return Object.keys(this.historyFilterConfig).map((key) => ({
        value: key,
        text: this.historyFilterConfig[key].label,
        mdi: this.historyFilterConfig[key].mdi,
        color: this.historyFilterConfig[key].color,
      }))
    },
  },
  watch: {
    value(val) {
      if (val) this.historyIconFilter = null
    },
  },
  methods: {
    formatSeatId(seatId) {
      if (!seatId) return seatId
      const parts = seatId.split('-')
      if (parts.length < 4) return seatId
      const row = parts[parts.length - 2]
      const col = parseInt(parts[parts.length - 1], 10)
      if (isNaN(col)) return seatId
      const letter = String.fromCharCode(64 + col)
      return `${row}${letter}`
    },

    getHistoryUser(createdBy) {
      const user = this.historyUsers.find((u) => u.id === createdBy)
      if (!user) return { name: `#${createdBy}`, first_name: `#${createdBy}`, last_name: '', email: '' }
      return {
        name: `${user.name} ${user.last_name}`,
        first_name: user.name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      }
    },
  },
}
</script>
