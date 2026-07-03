<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <div v-if="loadingItem" class="text-center pa-5">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <ChurchEventForm v-else :churchEvent="churchEvent" :loading="saving" permission="church-event-update"
          @close="close" @save="saveChurchEvent" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated", "permission"],
  meta: { permission: "church-event-index" },

  async asyncData({ app, params, error }) {
    try {
      const dbItem = await app.$repository.ChurchEvent.show(params.id)
      return {
        churchEvent: dbItem,
        loadingItem: false
      }
    } catch (e) {
      error({ statusCode: 404, message: "Evento no encontrado" })
      return { churchEvent: null, loadingItem: false }
    }
  },

  data() {
    return {
      saving: false,
      loadingItem: true,
      churchEvent: {},
    }
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

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Evento de Iglesia",
      icon: "mdi-calendar-edit",
      back: this.backRoute,
    })
  },

  methods: {
    close() {
      this.$router.push(this.backRoute)
    },

    async saveChurchEvent(item) {
      const payload = { ...item }
      delete payload.org_id

      try {
        this.saving = true;
        await this.$repository.ChurchEvent.update(payload.id, payload);

        this.$router.push(this.backRoute)
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        } else {
          console.error(error)
        }
      } finally {
        this.saving = false;
      }
    }
  }
}
</script>
