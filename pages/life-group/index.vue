<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="4" sm="6">
        <v-text-field v-model="filterText" append-icon="mdi-magnify" clearable hide-details
          placeholder="Buscar red..." />
      </v-col>
      <v-col cols="auto" class="d-flex align-center">
        <v-btn color="primary" :loading="loading" class="mr-1" @click="getItems()">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
        <v-btn color="success" class="mr-1" @click="$router.push('/life-group/new')">
          <v-icon left>mdi-plus</v-icon>
          Nueva Red
        </v-btn>
        <v-btn color="info" @click="$router.push('/life-group/dashboard')">
          <v-icon left>mdi-chart-box</v-icon>
          Dashboard
        </v-btn>
      </v-col>
      <v-col v-if="!orgFilterHidden" cols="auto">
        <organization-select v-model="filterOrgId" :hidden.sync="orgFilterHidden" permission="life-group-index" hide-one dense hide-details clearable
          outlined />
      </v-col>

      <v-col cols="12">
        <LifeGroupTable
          :loading="loading"
          :options="options"
          :response="response"
          @sorting="getItems"
          @edit="editItem"
          @delete="beforeDeleteItem"
          @sessions="goToSessions"
        />
      </v-col>
    </v-row>

    <LifeGroupDialog
      v-if="dialog"
      :life-group="editingItem"
      @close="closeDialog"
      @save="saveItem"
    />

    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteData"
      @ok="deleteItem"
      @close="dialogDelete = false"
    />
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
      const response = await app.$repository.LifeGroup.index(options)
      return { response, options }
    } catch {
      return { response: { data: [] }, options, leaders: [] }
    }
  },

  data() {
    return {
      filterText: "",
      filterOrgId: null,
      orgFilterHidden: false,
      editingItem: {},
      response: { data: [] },
      options: {},
      loading: false,
      dialog: false,
      dialogDelete: false,
      dialogDeleteData: {},
    }
  },

  watch: {
    filterText: {
      handler: debounce(function (value) {
        const op = {
          ...this.options,
          filter: value,
          page: 1,
          itemsPerPage: 10,
        }
        this.getItems(op)
      }, 500),
    },
    filterOrgId(value) {
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.getItems(overrides)
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Redes de Vida",
      icon: "mdi-account-group",
    })
  },

  methods: {
    async getItems(overrides = {}) {
      const requestOptions = {
        ...this.options,
        ...overrides,
        filter: this.filterText,
      }

      if (this.filterOrgId) {
        requestOptions.org_id = this.filterOrgId
      }

      try {
        this.loading = true
        this.response = await this.$repository.LifeGroup.index(requestOptions)

        // Update options after a successful load
        this.options = requestOptions
      } catch {
        // handled by axios interceptor
      } finally {
        this.loading = false
      }
    },

    editItem(item) {
      this.editingItem = { ...item }
      this.dialog = true
    },

    beforeDeleteItem(item) {
      this.dialogDeleteData = {
        text: "¿Desea eliminar la Red de Vida ",
        strong: item.name + "?",
        payload: item,
      }
      this.dialogDelete = true
    },

    async deleteItem(item) {
      try {
        await this.$repository.LifeGroup.delete(item.id)
        await this.getItems()
      } finally {
        this.dialogDelete = false
      }
    },

    async saveItem(item) {
      const payload = {
        ...item,
        start_date: item.start_date,
        time: item.time,
        day_of_week: item.day_of_week,
        status: item.status || "active",
        leader_ids: item.leader_ids || [],
      }
      // Clean up leader list from payload if present
      delete payload.leaders

      try {
        if (payload.id) {
          await this.$repository.LifeGroup.update(payload.id, payload)
        } else {
          await this.$repository.LifeGroup.create(payload)
        }
        await this.getItems()
        this.dialog = false
      } catch (error) {
        this.$handleError(error)
      }
    },

    closeDialog() {
      this.dialog = false
    },

    goToSessions(item) {
      this.$router.push(`/life-group/${item.id}`)
    },
  },
}
</script>
