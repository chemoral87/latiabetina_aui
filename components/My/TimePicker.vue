<template>
  <v-menu
    ref="timeMenu"
    v-model="timeMenu"
    :close-on-content-click="false"
    transition="scale-transition"
    offset-y
    :nudge-width="200"
    :disabled="disabled"
  >
    <template #activator="{ on, attrs }">
      <v-text-field
        :value="displayValue"
        :label="label"
        prepend-inner-icon="mdi-clock-outline"
        readonly
        :error-messages="errorMessages"
        :disabled="disabled"
        :dense="dense"
        :outlined="outlined"
        :hide-details="hideDetails"
        v-bind="attrs"
        v-on="on"
        @click:prepend-inner="on.click"
      />
    </template>

    <v-card min-width="220">
      <v-row no-gutters>
        <!-- Hours column -->
        <v-col cols="4" class="tp-col">
          <div
            v-for="h in hours"
            :key="h"
            class="tp-item"
            :class="{ 'tp-item--selected': selectedHour === h }"
            @click="selectedHour = h"
          >
            {{ h }}
          </div>
        </v-col>

        <!-- Minutes column -->
        <v-col cols="4" class="tp-col">
          <div
            v-for="m in minutes"
            :key="m"
            class="tp-item"
            :class="{ 'tp-item--selected': selectedMinute === m }"
            @click="selectedMinute = m"
          >
            {{ m }}
          </div>
        </v-col>

        <!-- AM/PM column -->
        <v-col cols="4" class="tp-col">
          <div
            v-for="p in periods"
            :key="p"
            class="tp-item"
            :class="{ 'tp-item--selected': selectedPeriod === p }"
            @click="selectedPeriod = p"
          >
            {{ p }}
          </div>
        </v-col>
      </v-row>

      <v-card-actions class="pt-0 pb-2 px-2">
        <v-spacer />
        <v-btn text small color="primary" @click="clearTime">Limpiar</v-btn>
        <v-btn text small color="primary" @click="confirmTime">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  name: "MyTimePicker",

  props: {
    value: { type: String, default: null },
    label: { type: String, default: "Hora" },
    errorMessages: { type: [String, Array], default: () => [] },
    disabled: { type: Boolean, default: false },
    dense: { type: Boolean, default: false },
    outlined: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
  },

  data() {
    return {
      timeMenu: false,
      selectedHour: "09",
      selectedMinute: "00",
      selectedPeriod: "AM",
      hours: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
      minutes: ["00", "30"],
      periods: ["AM", "PM"],
    }
  },

  computed: {
    displayValue() {
      if (!this.value) return ""
      // value is stored as HH:mm (24h), display as hh:mm AM/PM
      const [hStr, mStr] = this.value.split(":")
      if (!hStr || !mStr) return this.value
      const h24 = parseInt(hStr, 10)
      const period = h24 >= 12 ? "PM" : "AM"
      let h12 = h24 % 12
      if (h12 === 0) h12 = 12
      return `${String(h12).padStart(2, "0")}:${mStr} ${period}`
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (!val) return
        const [hStr, mStr] = val.split(":")
        if (!hStr || !mStr) return
        const h24 = parseInt(hStr, 10)
        const period = h24 >= 12 ? "PM" : "AM"
        let h12 = h24 % 12
        if (h12 === 0) h12 = 12
        this.selectedHour = String(h12).padStart(2, "0")
        this.selectedMinute = mStr === "30" ? "30" : "00"
        this.selectedPeriod = period
      },
    },

    timeMenu(val) {
      if (val && !this.value) {
        // default to current hour when opening without a value
        const now = new Date()
        let h = now.getHours()
        const period = h >= 12 ? "PM" : "AM"
        h = h % 12
        if (h === 0) h = 12
        this.selectedHour = String(h).padStart(2, "0")
        this.selectedMinute = "00"
        this.selectedPeriod = period
      }
    },
  },

  methods: {
    confirmTime() {
      let h24 = parseInt(this.selectedHour, 10)
      if (this.selectedPeriod === "AM" && h24 === 12) {
        h24 = 0
      } else if (this.selectedPeriod === "PM" && h24 !== 12) {
        h24 += 12
      }
      const time24 = `${String(h24).padStart(2, "0")}:${this.selectedMinute}`
      this.$emit("input", time24)
      this.timeMenu = false
    },

    clearTime() {
      this.$emit("input", null)
      this.timeMenu = false
    },
  },
}
</script>

<style scoped>
.tp-col {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
}
.tp-col:last-child {
  border-right: none;
}
.tp-item {
  padding: 10px 0;
  text-align: center;
  cursor: pointer;
  font-size: 0.95rem;
  user-select: none;
  border-radius: 4px;
  margin: 2px 4px;
  transition: background-color 0.15s;
}
.tp-item:hover {
  background-color: rgba(25, 118, 210, 0.12);
}
.tp-item--selected {
  background-color: #1976d2;
  color: #fff;
  font-weight: 600;
}
</style>
