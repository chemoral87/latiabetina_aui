<template>
  <div>
    <div v-if="!events || events.length === 0" class="text-caption grey--text">No hay eventos disponibles</div>
    <v-card v-for="event in events" :key="event.id" class="mb-3" hover style="cursor: pointer" @click="goToEvent(event.id)">
      <v-card-title class="text-subtitle-1">
        {{ event.name || "Evento sin nombre" }}
      </v-card-title>
      <v-card-subtitle v-if="event.event_date">
        {{ $moment(event.event_date).format("DD MMM YYYY") }}
      </v-card-subtitle>
      <v-card-text v-if="event.auditorium_name">
        <v-icon small class="mr-1">mdi-seat</v-icon>
        {{ event.auditorium_name }}
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
export default {
  name: "DashboardConsolidacion",
  data() {
    return {
      response: {},
      options: {
        sortBy: ["event_date"],
        sortDesc: [true],
        itemsPerPage: 10,
      },
    }
  },
  computed: {
    events() {
      return this.response?.data || []
    },
  },
  async mounted() {
    this.options.date = this.$moment().format("YYYY-MM-DD HH:mm:ss")

    try {
      const response = await this.$repository.AuditoriumEvent?.index?.(this.options)
      this.response = response
      this.hasLoadedData = true
    } catch (error) {
      console.error("Error loading auditorium events:", error)
    }
  },
  methods: {
    goToEvent(eventId) {
      this.$router.push(`/auditorium-event/${eventId}/mark`)
    },
  },
}
</script>
