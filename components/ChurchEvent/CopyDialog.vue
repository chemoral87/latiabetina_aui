<template>
  <v-dialog :value="true" persistent max-width="420px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-content-copy</v-icon>
        <span class="text-h5">Copiar Evento</span>
        <v-spacer />
        <v-btn icon :disabled="loading" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="mb-2 grey--text text--darken-1">
          Selecciona las fechas en las que deseas copiar
          <strong>{{ churchEvent.name }}</strong>:
        </p>

        <v-date-picker
          v-model="selectedDates"
          multiple
          full-width
          locale="es"
          :disabled="loading"
          :events="eventDateArray"
          event-color="#fb8c00"
          :allowed-dates="isAllowedDate"
        />

        <div v-if="selectedDates.length" class="mt-2">
          <v-chip
            v-for="date in sortedDates"
            :key="date"
            small
            class="mr-1 mb-1"
            close
            :disabled="loading"
            @click:close="removeDate(date)"
          >
            {{ date | moment("DD MMM YYYY") }}
          </v-chip>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!selectedDates.length" @click="copy">
          <v-icon left small>mdi-content-copy</v-icon>
          Copiar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ChurchEventCopyDialog",

  props: {
    churchEvent: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      selectedDates: [],
    }
  },

  computed: {
    sortedDates() {
      return [...this.selectedDates].sort()
    },

    eventDateArray() {
      return this.churchEvent.event_date ? [this.churchEvent.event_date] : []
    },
  },

  methods: {
    isAllowedDate(date) {
      return date !== this.churchEvent.event_date
    },

    removeDate(date) {
      this.selectedDates = this.selectedDates.filter((d) => d !== date)
    },

    close() {
      this.$emit("close")
    },

    copy() {
      if (!this.selectedDates.length || this.loading) return

      this.$emit("copy", {
        churchEvent: this.churchEvent,
        dates: this.sortedDates,
      })
    },
  },
}
</script>

<style scoped>
::v-deep .v-date-picker-table .v-event {
  border: 2px solid #fb8c00 !important;
  background-color: transparent !important;
}
</style>
