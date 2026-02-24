<template>
  <div>
    <!-- <div v-if="!events || events.length === 0" class="text-caption grey--text">No hay eventos disponibles</div> -->
    <v-card v-for="event in events" :key="event.id" class="mb-3 text-center" hover outlined style="cursor: pointer; border: 6px solid #87ceeb" @click="goToEvent(event.id)">
      <v-card-text v-if="event.auditorium_name" class="d-flex flex-column align-center">
        <v-icon large class="mb-2">mdi-theater</v-icon>
        <div>{{ event.auditorium_name }}</div>
      </v-card-text>
      <v-card-title v-if="event.event_date" class="justify-center">Evento {{ $moment(event.event_date).format("DD MMM YYYY") }}</v-card-title>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "DashboardConsolidacion",

  data() {
    return {
      response: {},
    }
  },

  computed: {
    events() {
      return this.response?.data || []
    },
  },

  async mounted() {
    const options = {
      sortBy: ["event_date"],
      sortDesc: [true],
      itemsPerPage: 10,
      date: this.$moment().format("YYYY-MM-DD HH:mm:ss"),
    }

    try {
      this.response = await this.$repository.AuditoriumEvent.index(options, { cacheMs: 500 })
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
