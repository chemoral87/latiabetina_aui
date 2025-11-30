<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterRole" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar rol..." dense />
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-2" @click="newRole">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="getRoles()">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <RoleTable :options="options" :response="response" :loading="loading" @sorting="getRoles" @editPermissions="editRolePermissions" @edit="editRole" @delete="beforeDeleteRole" />
      </v-col>
    </v-row>

    <RoleDialog v-if="roleDialog" :role="role" :loading="saving" @close="closeDialog" @save="saveRole" />

    <DialogDelete v-if="roleDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteRole" @close="roleDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"

export default {
  middleware: ["authenticated"],

  async asyncData({ app, store, error }) {
    const options = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.Role.index(options)
      return { response, options }
    } catch (e) {
      console.error("Error loading roles:", e)
      return {
        response: { data: [] },
        options,
      }
    }
  },

  data() {
    return {
      filterRole: "",
      role: {},
      response: { data: [] },
      options: {},
      roleDialog: false,
      roleDialogDelete: false,
      dialogDelete: {},
      loading: false,
      saving: false,
      deleting: false,
    }
  },

  computed: {
    hasRoles() {
      return this.response && this.response.data && this.response.data.length > 0
    },
  },

  watch: {
    filterRole: debounce(async function (value) {
      await this.loadRoles({ filter: value, page: 1 })
    }, 500),
  },

  mounted() {
    this.setNavBar()
  },

  beforeDestroy() {
    if (this.filterRole && this.filterRole.cancel) {
      this.filterRole.cancel()
    }
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", {
        title: "Roles",
        icon: "mdi-redhat",
      })
    },

    async loadRoles(overrides = {}) {
      try {
        this.loading = true
        this.$store.dispatch("hideNextLoading")

        const op = Object.assign({}, this.options, overrides)

        // Si hay un filtro activo y no se está sobrescribiendo, mantenerlo
        if (this.filterRole && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          op.filter = this.filterRole
        }

        this.response = await this.$repository.Role.index(op)
      } catch (error) {
        console.error("Error loading roles:", error)
        this.$notify({ error: "Error al cargar roles" })
      } finally {
        this.loading = false
      }
    },

    async getRoles(options) {
      if (options) {
        this.options = options
      }
      await this.loadRoles()
    },

    newRole() {
      this.role = {}
      this.roleDialog = true
    },

    editRole(item) {
      this.role = Object.assign({}, item)
      this.roleDialog = true
    },

    editRolePermissions(item) {
      this.$router.push(`/role/${item.id}`)
    },

    beforeDeleteRole(item) {
      this.dialogDelete = {
        text: "Desea eliminar el Rol ",
        strong: item.name,
        payload: item,
      }
      this.roleDialogDelete = true
    },

    async deleteRole(item) {
      try {
        this.deleting = true
        await this.$repository.Role.delete(item.id, item)

        this.filterRole = ""
        this.roleDialogDelete = false
      } catch (error) {
        console.error("Error deleting role:", error)
      } finally {
        this.deleting = false
      }
    },

    async saveRole(item) {
      try {
        this.saving = true

        if (item.id) {
          await this.$repository.Role.update(item.id, item)
        } else {
          await this.$repository.Role.create(item)
        }
        this.filterRole = item.name

        this.roleDialog = false

        // Si es un nuevo rol, filtrar por su nombre
      } catch (error) {
      } finally {
        this.saving = false
      }
    },

    closeDialog() {
      this.roleDialog = false
      if (this.clearErrors) {
        this.clearErrors()
      }
    },
  },
}
</script>
