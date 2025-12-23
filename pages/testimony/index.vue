<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterTestimony" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar..." dense :disabled="loading" />
      </v-col>

      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-2" @click="newTestimony">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="refreshTestimonies">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>

      <v-col cols="12">
        <TestimonyTable :options="options" :response="response" :loading="loading" @sorting="handleSorting" @edit="editTestimony" @delete="beforeDeleteTestimony" />
      </v-col>
    </v-row>

    <!-- <TestimonyDialog v-if="testimonyDialog" :testimony="testimony" :loading="saving" @close="closeDialog" @save="saveTestimony" /> -->

    <DialogDelete v-if="testimonyDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteTestimony" @close="testimonyDialogDelete = false" />
  </v-container>
</template>

<script>
// import { debounce } from "lodash-es"

export default {
  middleware: ["authenticated"],

  async asyncData({ app, error }) {
    const options = {
      page: 1,
      sortBy: ["created_at"],
      sortDesc: [true],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.Testimony.index(options)
      return { response, options }
    } catch (e) {
      console.error("Error loading testimonies:", e)
      error({ statusCode: e.response?.status || 500, message: "Error al cargar testimonios" })
      return { response: { data: [], total: 0 }, options }
    }
  },

  data() {
    return {
      filterTestimony: "",
      testimony: {},
      response: { data: [], total: 0 },
      options: { page: 1, sortBy: ["name"], sortDesc: [true], itemsPerPage: 10 },
      testimonyDialog: false,
      testimonyDialogDelete: false,
      dialogDelete: {},
      loading: false,
      saving: false,
      deleting: false,
      skipFilterWatch: false,
    }
  },

  watch: {
    filterTestimony: {
      // handler: debounce(function (value) {
      //   if (this.skipFilterWatch) {
      //     this.skipFilterWatch = false
      //     return
      //   }
      //   this.handleFilterChange(value)
      // }, 500),
    },
  },

  mounted() {
    this.setNavBar()
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", { title: "Testimonios", icon: "mdi-comment-text" })
    },

    async handleFilterChange(value) {
      await this.loadTestimonies({ filter: value || "", page: 1 })
    },

    async loadTestimonies(overrides = {}) {
      try {
        this.loading = true
        this.$store.dispatch("hideNextLoading")

        const requestOptions = { ...this.options, ...overrides }
        if (this.filterTestimony && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          requestOptions.filter = this.filterTestimony
        }

        this.response = await this.$repository.Testimony.index(requestOptions)
        this.options = requestOptions
      } catch (error) {
        console.error("Error loading testimonies:", error)
        this.$notify({ type: "error", text: error.response?.data?.message || "Error al cargar testimonios" })
      } finally {
        this.loading = false
      }
    },

    async refreshTestimonies() {
      await this.loadTestimonies()
    },

    async handleSorting(options) {
      this.options = options
      await this.loadTestimonies()
    },

    newTestimony() {
      this.testimony = {}
      this.testimonyDialog = true
    },

    editTestimony(item) {
      this.testimony = { ...item }
      this.testimonyDialog = true
    },

    beforeDeleteTestimony(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Testimonio ",
        strong: item.title || item.id,
        text2: "?",
        payload: item,
      }
      this.testimonyDialogDelete = true
    },

    async deleteTestimony(item) {
      try {
        this.deleting = true
        await this.$repository.Testimony.delete(item.id, item)
        this.skipFilterWatch = true
        this.filterTestimony = ""
        await this.loadTestimonies({ page: 1, filter: "" })
        this.testimonyDialogDelete = false
      } catch (error) {
        console.error("Error deleting testimony:", error)
        this.$notify({ type: "error", text: error.response?.data?.message || "Error al eliminar testimonio" })
      } finally {
        this.deleting = false
      }
    },

    async saveTestimony(item) {
      try {
        this.saving = true
        const isUpdate = Boolean(item.id)
        if (isUpdate) {
          await this.$repository.Testimony.update(item.id, item)
        } else {
          await this.$repository.Testimony.create(item)
        }

        this.$notify({ type: "success", text: `Testimonio ${isUpdate ? "actualizado" : "creado"} exitosamente` })

        this.filterTestimony = item.name
        this.testimonyDialog = false
      } catch (error) {
        console.error("Error saving testimony:", error)
        this.$notify({ type: "error", text: error.response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} testimonio` })
      } finally {
        this.saving = false
      }
    },

    closeDialog() {
      this.testimonyDialog = false
      this.testimony = {}
    },
  },
}
</script>

<style scoped></style>
