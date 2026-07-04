<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <ChurchEventForm :loading="saving" :initial-event-date="$route.query.event_date || null"
          permission="church-event-insert" @close="close" @save="saveChurchEvent" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated", "permission"],
  meta: { permission: "church-event-index" },

  data() {
    return {
      saving: false,
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Nuevo Evento de Iglesia",
      icon: "mdi-calendar-plus",
      back: this.backRoute,
    })
  },

  computed: {
    backRoute() {
      if (this.$route.query.from === 'calendar') {
        const q = {}
        if (this.$route.query.cal_year) q.cal_year = this.$route.query.cal_year
        if (this.$route.query.cal_month !== undefined) q.cal_month = this.$route.query.cal_month
        return { path: '/church-event/calendar', query: q }
      }
      return '/church-event'
    },
  },

  methods: {
    close() {
      this.$router.push(this.backRoute)
    },

    async saveChurchEvent(item) {
      const payload = { ...item }
      if (payload.org_id && typeof payload.org_id === 'object') {
        payload.org_id = payload.org_id.id
      }

      try {
        this.saving = true;
        await this.$repository.ChurchEvent.create(payload);

        this.$router.push(this.backRoute)
      } catch (error) {

      } finally {
        this.saving = false;
      }
    }
  }
}
</script>
