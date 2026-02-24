<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterAuditoriumEvent" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>
      <v-col cols="12" md="auto">
        <v-btn color="primary" class="mr-1" @click="newAuditoriumEvent()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" @click="getAuditoriumEvents()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <AuditoriumEventTable :response="response" :options="options" @sorting="getAuditoriumEvents" @edit="editAuditoriumEvent" @mark="markAuditoriumEvent" @delete="beforeDeleteAuditoriumEvent" />
      </v-col>
    </v-row>
    <!-- Diálogos para crear/editar y eliminar eventos de auditorio -->
    <AuditoriumEventDialog v-model="auditoriumEventDialog" :auditorium-event="auditoriumEvent" @close="closeDialog" @save="saveAuditoriumEvent" />
    <DialogDelete v-if="auditoriumEventDialogDelete" :dialog="dialogDelete" @ok="deleteAuditoriumEvent" @close="auditoriumEventDialogDelete = false"></DialogDelete>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ app }) {
    const options = {
      sortBy: ["event_date"],
      sortDesc: [true],
      itemsPerPage: 10,
    }

    try {
      // Asumiendo que hay un repositorio para eventos de auditorio
      const response = await app.$repository.AuditoriumEvent?.index?.(options)

      return { response, options }
    } catch (error) {
      // console.error("Error loading auditorium events:", error)
      return { response: { data: [], total: 0 }, options }
    }
  },

  data() {
    return {
      filterAuditoriumEvent: "",
      auditoriumEvents: [],
      auditoriumEvent: {},
      response: { data: [], total: 0 },
      options: {},
      loading: false,
      auditoriumEventDialog: false,
      auditoriumEventDialogDelete: false,
      dialogDelete: {},
    }
  },

  computed: {
    currentUser() {
      return this.$auth.user || {}
    },
  },

  watch: {
    async filterAuditoriumEvent(value) {
      const me = this
      this.$store.dispatch("hideNextLoading")
      const op = Object.assign(me.options, {
        filter: value,
        page: 1,
        itemsPerPage: 10,
      })
      me.auditoriumEvents = await me.$repository.AuditoriumEvent.index(op)
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Eventos de Auditorio",
      icon: "mdi-theater",
    })
  },

  methods: {
    async getAuditoriumEvents(options) {
      if (options) {
        this.options = options
      }
      const op = Object.assign({}, this.options)
      this.response = await this.$repository.AuditoriumEvent.index(op)
    },

    newAuditoriumEvent() {
      this.auditoriumEvent = {}
      this.auditoriumEventDialog = true
    },

    editAuditoriumEvent(item) {
      this.auditoriumEvent = { ...item }
      this.auditoriumEventDialog = true
    },
    markAuditoriumEvent(item) {
      this.$router.push({ path: `/auditorium-event/${item.id}/mark` })
    },

    beforeDeleteAuditoriumEvent(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Evento de Auditorio ",
        strong: item.auditorium_name,
        payload: item,
      }
      this.auditoriumEventDialogDelete = true
    },

    async deleteAuditoriumEvent(item) {
      try {
        await this.$repository.AuditoriumEvent.delete(item.id)

        await this.getAuditoriumEvents()
      } catch (error) {
        console.error("Error deleting auditorium event:", error)
    
      } finally {
        this.auditoriumEventDialogDelete = false
      }
    },

    async saveAuditoriumEvent(item) {
      try {
        if (this.$repository?.AuditoriumEvent) {
          if (item.id) {
            await this.$repository.AuditoriumEvent.update(item.id, item)
       
          } else {
            await this.$repository.AuditoriumEvent.create(item)
       
          }
        }

        await this.getAuditoriumEvents()
        this.auditoriumEventDialog = false
      } catch (error) {
        console.error("Error saving auditorium event:", error)
  
      }
    },

    closeDialog() {
      this.auditoriumEventDialog = false
    },
  },
}
</script>
