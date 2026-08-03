<template>
  <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y min-width="auto">
    <template #activator="{ on, attrs }">
      <v-text-field id="tf-my-dater-label-1"
        ref="inputField"
        :value="dateRangeText"
        :label="label"
        :placeholder="placeholder"
        :prepend-inner-icon="prependIcon"
        readonly
        clearable
        :hide-details="hideDetails"
        :dense="dense"
        :outlined="outlined"
        :disabled="disabled"
        :error-messages="errorMessages"
        v-bind="attrs"
        v-on="on"
        @click:prepend-inner="on.click"
        @click:clear="clearRange"
      />
    </template>

    <v-date-picker v-model="pendingValue" range :no-title="noTitle" :scrollable="scrollable" :locale="locale"
      :weekday-format="weekdayFormat" first-day-of-week="1">
      <v-spacer />
      <v-btn color="primary" outlined class="mr-2" id="btn-my-daterange-clear" @click="clearRange">
        <v-icon left>mdi-close</v-icon>
        Limpiar
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "MyDateRange",

  props: {
    value: { type: Array, default: () => [] },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "Rango de fechas" },
    prependIcon: { type: String, default: "mdi-calendar" },
    dense: { type: Boolean, default: true },
    outlined: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    noTitle: { type: Boolean, default: true },
    scrollable: { type: Boolean, default: true },
    locale: { type: String, default: "es-mx" },
    errorMessages: { type: [String, Array], default: () => [] },
    separator: { type: String, default: " ~ " },
  },

  data() {
    return {
      dateMenu: false,
      pendingValue: [],
      pendingSyncDone: false,
    }
  },

  computed: {
    dateRangeText() {
      if (!this.value || this.value.length === 0) return ""
      const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
      const format = (d) => {
        const [year, month, day] = d.split("-")
        if (!year || !month || !day) return d
        return `${day}/${monthNames[parseInt(month, 10) - 1]}/${year}`
      }
      return [...this.value].sort().map(format).join(this.separator)
    },
  },

  watch: {
    dateMenu(open) {
      if (open) {
        this.pendingValue = Array.isArray(this.value) ? [...this.value] : []
        this.pendingSyncDone = false
        this.$nextTick(() => { this.pendingSyncDone = true })
      }
    },
    pendingValue(val) {
      if (this.pendingSyncDone && Array.isArray(val) && val.length === 2) {
        this.confirm()
      }
    },
  },

  methods: {
    weekdayFormat(date) {
      const weekdays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
      return weekdays[new Date(date + "T00:00:00").getDay()]
    },
    confirm() {
      const sorted = Array.isArray(this.pendingValue) ? [...this.pendingValue].sort() : []
      this.$emit("input", sorted)
      this.dateMenu = false
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.focus()
        }
      })
    },

    clearRange() {
      this.pendingValue = []
      this.$emit("input", [])
      this.dateMenu = false
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.focus()
        }
      })
    },
  },
}
</script>
