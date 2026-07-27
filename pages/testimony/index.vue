<template>
  <v-container fluid>
    <v-row dense align="center">
      <v-col cols="12" md="4" sm="6">
        <v-text-field id="tf-testi-index-filtertestimony-1" v-model="filterTestimony" prepend-inner-icon="mdi-magnify" clearable hide-details dense
          placeholder="Filtro" />
      </v-col>

      <v-col cols="12" md="2" sm="4">
        <v-select v-model="statusFilter" :items="[
          { text: 'Pendientes', value: '' },
          { text: 'Aprobados', value: 'approved' },
          { text: 'Rechazados', value: 'rejected' },
        ]" placeholder="Estado" clearable dense hide-details @change="onStatusChange" />
      </v-col>

      <v-col cols="auto" class="d-flex align-center">
        <v-btn id="btn-testimony-refresh" color="primary" :loading="loading" class="mr-1" @click="refreshTestimonies">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
        <v-btn id="btn-testimony-new" color="success" class="mr-1" @click="newTestimony">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
      </v-col>

      <v-col v-if="!orgFilterHidden" cols="auto" class="d-flex align-center">
        <organization-select v-model="filterOrgId" :hidden.sync="orgFilterHidden" permission="testimony-index" hide-one dense hide-details clearable
          outlined />
      </v-col>

      <v-col cols="12">
        <TestimonyTable ref="testimonyTable" :options="options" :response="response" :loading="loading"
          @sorting="handleSorting" @edit="editTestimony" @show="showTestimony" @delete="beforeDeleteTestimony" />
      </v-col>
    </v-row>

    <TestimonyDialog v-if="testimonyDialog" :testimony="testimony" :loading="saving" @close="closeDialog"
      @save="saveTestimony" />

    <DialogDelete v-if="testimonyDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteTestimony"
      @close="testimonyDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"

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
    } catch(e) {
      error({ statusCode: e.response?.status || 500, message: "Error al cargar testimonios" })
      return { response: { data: [], total: 0 }, options }
    }
  },

  data() {
    return {
      filterTestimony: "",
      statusFilter: "",
      filterOrgId: null,
      orgFilterHidden: false,
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
      handler: debounce(function(value) {
        // Si skipFilterWatch está activo, no ejecutar el watch
        if(this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
    filterOrgId(value) {
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.loadTestimonies(overrides)
    },
  },

  mounted() {
    this.setNavBar()
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", { title: "Testimonios", icon: "mdi-comment-text-outline" })
    },

    async handleFilterChange(value) {
      await this.loadTestimonies({ filter: value || "", page: 1 })
    },

    async loadTestimonies(overrides = {}) {
      try {
        this.loading = true

        const requestOptions = { ...this.options, ...overrides }
        if(this.filterTestimony && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          requestOptions.filter = this.filterTestimony
        }
        if(this.statusFilter && !Object.prototype.hasOwnProperty.call(overrides, "status")) {
          requestOptions.status = this.statusFilter
        }
        if(this.filterOrgId && !Object.prototype.hasOwnProperty.call(overrides, "org_id")) {
          requestOptions.org_id = this.filterOrgId
        }
        if(Object.prototype.hasOwnProperty.call(overrides, "org_id") && !overrides.org_id) {
          delete requestOptions.org_id
        }

        this.response = await this.$repository.Testimony.index(requestOptions)
        this.options = requestOptions
      } catch(error) {

        this.$notify({ type: "error", text: error.response?.data?.message || "Error al cargar testimonios" })
      } finally {
        this.loading = false
      }
    },

    async onStatusChange(value) {
      await this.loadTestimonies({ page: 1, status: value })
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
    showTestimony(item) {
      this.$router.push(`/testimony/review/${item.id}`)
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
      } catch(error) {

        this.$notify({ type: "error", text: error.response?.data?.message || "Error al eliminar testimonio" })
      } finally {
        this.deleting = false
      }
    },

    async saveTestimony(item) {
      try {
        this.saving = true
        const isUpdate = Boolean(item.id)
        let saved = null
        if(isUpdate) {
          const res = await this.$repository.Testimony.update(item.id, item)
          saved = res.data?.testimony || res.testimony || res.data || res

          const idx = this.response.data.findIndex((d) => d.id === (saved.id || item.id))
          if(idx !== -1) {
            this.$set(this.response.data, idx, saved)
          } else {
            this.response.data.unshift(saved)
            this.response.total = (this.response.total || 0) + 1
          }
        } else {
          const res = await this.$repository.Testimony.create(item)
          saved = res.data?.testimony || res.testimony || res.data || res
          this.response.data.unshift(saved)
          this.response.total = (this.response.total || 0) + 1
        }

        // update the table row via ref if available
        if(this.$refs.testimonyTable && typeof this.$refs.testimonyTable.updateRow === "function") {
          this.$refs.testimonyTable.updateRow(saved)
        }

        this.$notify({ type: "success", text: `Testimonio ${isUpdate ? "actualizado" : "creado"} exitosamente` })
        this.testimonyDialog = false
      } catch(error) {

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
