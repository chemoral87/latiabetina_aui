<template>
  <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition" offset-y
    min-width="auto">
    <template #activator="{ on, attrs }">
      <v-text-field v-model="formattedDate" :label="label" :prepend-inner-icon="prependIcon" readonly
        :required="required" :rules="rules" :error-messages="errorMessages" v-bind="attrs" v-on="on"
        @click:prepend-inner="on.click" :dense="dense" :outlined="outlined" :hide-details="hideDetails"
        :disabled="disabled" :clearable="clearable" />
    </template>
    <v-date-picker v-model="internalValue" @input="dateMenu = false" :no-title="noTitle" :scrollable="scrollable"
      :locale="locale">
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="clearDate">Limpiar</v-btn>
      <v-btn text color="primary" @click="setToday">Hoy</v-btn>
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

      // Use project's global filters if available ($moment usually registered in filters)
      if(this.$moment) {
        return this.$moment(this.value).format("DD/MM/YYYY");
      }

      // Fallback native formatting
      try {
        const [year, month, day] = this.value.split("-");
        if(!year || !month || !day) return this.value;
        return `${day}/${month}/${year}`;
      } catch(e) {
        return this.value;
      }
    },
  },
  methods: {
    clearDate() {
      this.internalValue = null;
      this.dateMenu = false;
    },
    setToday() {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - (offset * 60 * 1000));
      this.internalValue = localDate.toISOString().substr(0, 10);
      this.dateMenu = false;
    },
  },
}
</script>
