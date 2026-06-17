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

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Evento de Iglesia",
      icon: "mdi-calendar-edit",
      back: "/church-event",
    })
  },

  methods: {
    close() {
      this.$router.push('/church-event')
    },

    async saveChurchEvent(item) {
      const payload = { ...item }
      delete payload.org_id

      try {
        this.saving = true;
        await this.$repository.ChurchEvent.update(payload.id, payload);
        this.$notify({ type: "success", text: "Evento actualizado exitosamente" });
        this.$router.push('/church-event')
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
