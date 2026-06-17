<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <ChurchEventForm :loading="saving" permission="church-event-insert" @close="close" @save="saveChurchEvent" />
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
      back: "/church-event",
    })
  },

  methods: {
    close() {
      this.$router.push('/church-event')
    },

    async saveChurchEvent(item) {
      const payload = { ...item }
      if (payload.org_id && typeof payload.org_id === 'object') {
        payload.org_id = payload.org_id.id
      }

      try {
        this.saving = true;
        await this.$repository.ChurchEvent.create(payload);
        this.$notify({ type: "success", text: "Evento creado exitosamente" });
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
