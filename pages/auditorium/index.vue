<template>
  <v-container fluid>
    <filter-row
      v-model="filterAuditorium"
      :loading="loading"
      search-id="tf-audit-index-filterauditorium-1"
      refresh-id="btn-auditorium-refresh"
      new-id="btn-auditorium-new"
      cols="12"
      md="2"
      @refresh="getAuditoriums"
      @create="newAuditorium"
    >
      <template #append>
        <v-col v-if="!orgFilterHidden" cols="auto">
          <organization-select v-model="filterOrgId" :hidden.sync="orgFilterHidden" permission="auditorium-index" hide-one dense hide-details clearable
            outlined />
        </v-col>
      </template>
    </filter-row>

    <v-row dense>
      <v-col cols="12">
        <AuditoriumTable :loading="loading" :options="options" :response="response" @sorting="getAuditoriums" @edit="editAuditorium"
          @delete="beforeDeleteAuditorium" @layout="goToLayout" />
      </v-col>
    </v-row>
    <AuditoriumDialog v-if="auditoriumDialog" :auditorium="auditorium" :loading="loading" @close="closeDialog"
      @save="saveAuditorium" />
    <DialogDelete v-if="auditoriumDialogDelete" :dialog="dialogDelete" @ok="deleteAuditorium"
      @close="auditoriumDialogDelete = false"></DialogDelete>
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"

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
    } catch(error) {

      return { response: { data: [] }, options }
    }
  },

  data() {
    return {
      filterAuditorium: "",
      filterOrgId: null,
      orgFilterHidden: false,
      auditorium: {},
      response: { data: [] },
      options: {},
      loading: false,
      auditoriumDialog: false,
      auditoriumDialogDelete: false,
      dialogDelete: {},
    }
  },

  watch: {
    filterAuditorium: {
      handler: debounce(function(value) {
        const op = {
          ...this.options,
          filter: value,
          page: 1,
          itemsPerPage: 10,
        }
        this.getAuditoriums(op)
      }, 500),
    },
    filterOrgId(value) {
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.getAuditoriums(overrides)
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
    async getAuditoriums(overrides = {}) {
      const requestOptions = {
        ...this.options,
        ...overrides,
      }

      requestOptions.filter = this.filterAuditorium

      if (this.filterOrgId) {
        requestOptions.org_id = this.filterOrgId
      }

      try {
        this.loading = true
        this.response = (await this.$repository.Auditorium?.index?.(requestOptions))

        // Update options after a successful load
        this.options = requestOptions
      } finally {
        this.loading = false
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

      } finally {
        this.auditoriumDialogDelete = false
      }
    },

    async saveAuditorium(item) {
      const payload = {
        ...item,
      }

      if (item.id) {
        delete payload.org_id
      } else {
        payload.org_id = item.org_id?.id ?? item.org_id
      }

      try {
        if(payload.id) {
          await this.$repository.Auditorium?.update?.(payload.id, payload)

        } else {
          await this.$repository.Auditorium?.create?.(payload)

        }

        await this.getAuditoriums()
        this.auditoriumDialog = false
      } catch(error) {
        this.$handleError(error)

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
