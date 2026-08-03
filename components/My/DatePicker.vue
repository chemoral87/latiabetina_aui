<template>
  <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
    min-width="auto">
    <template #activator="{ on, attrs }">
      <v-text-field id="tf-my-datep-formatteddate-1" ref="inputField" v-model="formattedDate" :label="label" :prepend-inner-icon="prependIcon" readonly
        :required="required" :rules="rules" :error-messages="errorMessages" v-bind="attrs" v-on="on"
        @click:prepend-inner="on.click" :dense="dense" :outlined="outlined" :hide-details="hideDetails"
        :disabled="disabled" :clearable="clearable" />
    </template>
    <v-date-picker v-model="internalValue" @input="onDateSelected" :no-title="noTitle" :scrollable="scrollable"
      :locale="locale" :weekday-format="weekdayFormat" first-day-of-week="1">
      <v-spacer></v-spacer>
      <v-btn color="primary" outlined class="mr-2" id="btn-my-datepicker-clear" @click="clearDate">
        <v-icon left>mdi-close</v-icon>
        Limpiar
      </v-btn>
      <v-btn color="primary" id="btn-my-datepicker-today" @click="setToday">
        <v-icon left>mdi-calendar-today</v-icon>
        Hoy
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
export default {
  name: "MyDatePicker",
  props: {
    value: { type: String, default: null },
    label: { type: String, default: "Fecha" },
    prependIcon: { type: String, default: "mdi-calendar" },
    required: { type: Boolean, default: false },
    rules: { type: Array, default: () => [] },
    errorMessages: { type: [String, Array], default: () => [] },
    dense: { type: Boolean, default: false },
    outlined: { type: Boolean, default: false },
    hideDetails: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    noTitle: { type: Boolean, default: true },
    scrollable: { type: Boolean, default: true },
    locale: { type: String, default: "es-mx" },
  },
  data() {
    return {
      dateMenu: false,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    formattedDate() {
      if(!this.value) return "";

      try {
        const [year, month, day] = this.value.split("-");
        if(!year || !month || !day) return this.value;
        const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
        return `${day}/${monthNames[parseInt(month, 10) - 1]}/${year}`;
      } catch(e) {
        return this.value;
      }
    },
  },
  methods: {
    weekdayFormat(date) {
      const weekdays = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"]
      return weekdays[new Date(date + "T00:00:00").getDay()]
    },
    onDateSelected() {
      this.dateMenu = false
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.focus()
        }
      })
    },
    clearDate() {
      this.internalValue = null
      this.dateMenu = false
      this.$nextTick(() => {
        if (this.$refs.inputField) {
          this.$refs.inputField.focus()
        }
      })
    },
    setToday() {
      const now = new Date()
      const offset = now.getTimezoneOffset()
      const localDate = new Date(now.getTime() - (offset * 60 * 1000))
      this.internalValue = localDate.toISOString().substr(0, 10)
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
