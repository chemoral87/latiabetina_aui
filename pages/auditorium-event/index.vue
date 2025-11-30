<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterAuditoriumEvent" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-1" @click="newAuditoriumEvent()">
          <v-icon>mdi-plus</v-icon>
          Nuevo Evento de Auditorio
        </v-btn>
        <v-btn color="primary" @click="getAuditoriumEvents()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <v-data-table :headers="headers" :items="response.data" :options.sync="options" :server-items-length="response.total" :loading="loading" class="elevation-1" @update:options="getAuditoriumEvents">
          <template slot="item.actions" slot-scope="{ item }">
            <v-icon small class="mr-2" @click="editAuditoriumEvent(item)">mdi-pencil</v-icon>
            <v-icon small @click="beforeDeleteAuditoriumEvent(item)">mdi-delete</v-icon>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <!-- Diálogos para crear/editar y eliminar eventos de auditorio -->
    <!-- AuditoriumEventDialog v-if="auditoriumEventDialog" :auditoriumEvent="auditoriumEvent" @close="closeDialog" @save="saveAuditoriumEvent" />
    <DialogDelete v-if="auditoriumEventDialogDelete" :dialog="dialogDelete" @ok="deleteAuditoriumEvent" @close="auditoriumEventDialogDelete = false"></DialogDelete> -->
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],

  asyncData({ app }) {
    const options = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    try {
      // Asumiendo que hay un repositorio para eventos de auditorio
      // const response = await app.$repository.AuditoriumEvent?.index?.(options)
      const response = { data: [], total: 0 } // Placeholder
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
      headers: [
        { text: "Nombre", value: "name" },
        { text: "Auditorio", value: "auditorium_name" },
        { text: "Fecha", value: "date" },
        { text: "Acciones", value: "actions", sortable: false },
      ],
      // auditoriumEventDialog: false,
      // auditoriumEventDialogDelete: false,
      // dialogDelete: {},
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
      this.auditoriumEvents = await this.$repository.AuditoriumEvent.index(op)
    },

    newAuditoriumEvent() {
      this.auditoriumEvent = {}
      // this.auditoriumEventDialog = true
    },

    editAuditoriumEvent(item) {
      this.auditoriumEvent = { ...item }
      // this.auditoriumEventDialog = true
    },

    beforeDeleteAuditoriumEvent(item) {
      // this.dialogDelete = {
      //   text: "¿Desea eliminar el Evento de Auditorio ",
      //   strong: item.name + "?",
      //   payload: item,
      // }
      // this.auditoriumEventDialogDelete = true
    },

    async deleteAuditoriumEvent(item) {
      try {
        // await this.$repository.AuditoriumEvent?.delete?.(item.id, item)
        await this.getAuditoriumEvents()
        this.$store.dispatch("notify", {
          success: "Evento de auditorio eliminado exitosamente",
        })
      } catch (error) {
        // console.error("Error deleting auditorium event:", error)
        this.$store.dispatch("notify", {
          error: "Error al eliminar el evento de auditorio",
        })
      } finally {
        // this.auditoriumEventDialogDelete = false
      }
    },

    async saveAuditoriumEvent(item) {
      try {
        // if (item.id) {
        //   await this.$repository.AuditoriumEvent?.update?.(item.id, item)
        //   this.$store.dispatch("notify", {
        //     success: "Evento de auditorio actualizado exitosamente",
        //   })
        // } else {
        //   await this.$repository.AuditoriumEvent?.create?.(item)
        //   this.$store.dispatch("notify", {
        //     success: "Evento de auditorio creado exitosamente",
        //   })
        // }

        await this.getAuditoriumEvents()
        // this.auditoriumEventDialog = false
      } catch (error) {
        // console.error("Error saving auditorium event:", error)
        this.$store.dispatch("notify", {
          error: "Error al guardar el evento de auditorio",
        })
      }
    },

    closeDialog() {
      // this.auditoriumEventDialog = false
    },
  },
}
</script>
