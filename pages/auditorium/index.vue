<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterAuditorium" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-1" @click="newAuditorium()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" @click="getAuditoriums()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <AuditoriumTable :options="options" :response="response" @sorting="getAuditoriums" @edit="editAuditorium" @delete="beforeDeleteAuditorium" @layout="goToLayout" />
      </v-col>
    </v-row>
    <AuditoriumDialog v-if="auditoriumDialog" :auditorium="auditorium" :orgs="userOrgs" @close="closeDialog" @save="saveAuditorium" />
    <DialogDelete v-if="auditoriumDialogDelete" :dialog="dialogDelete" @ok="deleteAuditorium" @close="auditoriumDialogDelete = false"></DialogDelete>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ app }) {
    const options = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.Auditorium?.index?.(options)
      return { response, options }
    } catch (error) {
      console.error("Error loading auditoriums:", error)
      return { response: { data: [] }, options }
    }
  },

  data() {
    return {
      filterAuditorium: "",
      auditorium: {},
      response: { data: [] },
      options: {},
      auditoriumDialog: false,
      auditoriumDialogDelete: false,
      dialogDelete: {},
    }
  },

  computed: {
    currentUser() {
      return this.$auth.user || {}
    },

    userOrgs() {
      return this.currentUser.orgs || []
    },
  },

  watch: {
    async filterAuditorium(value) {
      const options = {
        ...this.options,
        filter: value,
        page: 1,
        itemsPerPage: 10,
      }

      try {
        this.response = (await this.$repository.Auditorium?.index?.(options)) || { data: [] }
      } catch (error) {
        console.error("Error filtering auditoriums:", error)
        this.response = { data: [] }
      }
    },
  },

  mounted() {
    // Configurar navbar directamente sin mixin
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Auditorios",
      icon: "mdi-seat",
    })
  },

  methods: {
    async getAuditoriums(options) {
      if (options) {
        this.options = options
      }

      try {
        this.response = (await this.$repository.Auditorium?.index?.(this.options)) || { data: [] }
      } catch (error) {
        console.error("Error loading auditoriums:", error)
        this.response = { data: [] }
        this.$store.dispatch("notify", {
          error: "Error al cargar los auditorios",
        })
      }
    },

    newAuditorium() {
      this.auditorium = {}
      this.auditoriumDialog = true
    },

    editAuditorium(item) {
      this.auditorium = { ...item }
      this.auditoriumDialog = true
    },

    beforeDeleteAuditorium(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Auditorio ",
        strong: item.name + "?",
        payload: item,
      }
      this.auditoriumDialogDelete = true
    },

    async deleteAuditorium(item) {
      try {
        await this.$repository.Auditorium?.delete?.(item.id, item)
        await this.getAuditoriums()
        this.$store.dispatch("notify", {
          success: "Auditorio eliminado exitosamente",
        })
      } catch (error) {
        console.error("Error deleting auditorium:", error)
        this.$store.dispatch("notify", {
          error: "Error al eliminar el auditorio",
        })
      } finally {
        this.auditoriumDialogDelete = false
      }
    },

    async saveAuditorium(item) {
      const payload = {
        ...item,
        org_id: item.org_id?.id ?? item.org_id,
      }

      try {
        if (payload.id) {
          await this.$repository.Auditorium?.update?.(payload.id, payload)
          this.$store.dispatch("notify", {
            success: "Auditorio actualizado exitosamente",
          })
        } else {
          await this.$repository.Auditorium?.create?.(payload)
          this.$store.dispatch("notify", {
            success: "Auditorio creado exitosamente",
          })
        }

        await this.getAuditoriums()
        this.auditoriumDialog = false
      } catch (error) {
        console.error("Error saving auditorium:", error)
        this.$store.dispatch("notify", {
          error: "Error al guardar el auditorio",
        })
      }
    },

    closeDialog() {
      this.auditoriumDialog = false
    },

    goToLayout(item) {
      this.$router.push(`/auditorium/${item.id}/editor`)
    },
  },
}
</script>
