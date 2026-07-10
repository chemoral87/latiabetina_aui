<template>
  <v-dialog :value="true" persistent max-width="560px">
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
          Elige cómo deseas copiar <strong>{{ churchEvent.name }}</strong>:
        </p>

        <v-btn-toggle v-model="mode" mandatory dense class="mb-4">
          <v-btn value="dates" small>Por calendario</v-btn>
          <v-btn value="recurrence" small>Por rango y días</v-btn>
        </v-btn-toggle>

        <template v-if="mode === 'dates'">
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
        </template>

        <template v-else>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="startDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="recurrence.start_date"
                    label="Fecha inicial"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="recurrence.start_date" locale="es" @input="startDateMenu = false" />
              </v-menu>
            </v-col>
            <v-col cols="12" sm="6">
              <v-menu
                v-model="endDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template #activator="{ on, attrs }">
                  <v-text-field
                    v-model="recurrence.end_date"
                    label="Fecha final"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>
                <v-date-picker v-model="recurrence.end_date" locale="es" @input="endDateMenu = false" />
              </v-menu>
            </v-col>
          </v-row>

          <label class="caption grey--text text--darken-1">Días de la semana</label>
          <v-chip-group v-model="recurrence.days_of_week" multiple column>
            <v-chip
              v-for="(day, index) in weekDays"
              :key="day"
              filter
              outlined
              :value="index"
            >
              {{ day }}
            </v-chip>
          </v-chip-group>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!canCopy" @click="copy">
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
      mode: 'dates',
      selectedDates: [],
      recurrence: {
        start_date: null,
        end_date: null,
        days_of_week: [],
      },
      startDateMenu: false,
      endDateMenu: false,
      weekDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    }
  },

  computed: {
    sortedDates() {
      return [...this.selectedDates].sort()
    },

    eventDateArray() {
      return this.churchEvent.event_date ? [this.churchEvent.event_date] : []
    },

    canCopy() {
      if (this.mode === 'dates') {
        return this.selectedDates.length > 0
      }

      return !!this.recurrence.start_date && !!this.recurrence.end_date && this.recurrence.days_of_week.length > 0
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
      if (this.loading) return

      if (this.mode === 'dates') {
        if (!this.selectedDates.length) return

        this.$emit("copy", {
          churchEvent: this.churchEvent,
          dates: this.sortedDates,
        })
        return
      }

      if (!this.canCopy) return

      this.$emit("copy", {
        churchEvent: this.churchEvent,
        recurrence: {
          start_date: this.recurrence.start_date,
          end_date: this.recurrence.end_date,
          days_of_week: this.recurrence.days_of_week,
        },
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
