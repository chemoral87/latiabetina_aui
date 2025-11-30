<template>
  <v-container fluid>
    <v-row dense>
      <!-- Filtro de búsqueda -->
      <v-col cols="12" md="2">
        <v-text-field v-model="filterRole" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar rol..." dense :disabled="loading" />
      </v-col>

      <!-- Botones de acción -->
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-2" @click="newRole">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="refreshRoles">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>

      <!-- Tabla de roles -->
      <v-col cols="12">
        <RoleTable :options="options" :response="response" :loading="loading" @sorting="handleSorting" @editPermissions="editRolePermissions" @edit="editRole" @delete="beforeDeleteRole" />
      </v-col>
    </v-row>

    <!-- Diálogo para crear/editar rol -->
    <RoleDialog v-if="roleDialog" :role="role" :loading="saving" @close="closeDialog" @save="saveRole" />

    <!-- Diálogo de confirmación de eliminación -->
    <DialogDelete v-if="roleDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteRole" @close="roleDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from "lodash-es"

export default {
  middleware: ["authenticated"],

  async asyncData({ app, error }) {
    const options = {
      page: 1,
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    try {
      const response = await app.$repository.Role.index(options)
      return { response, options }
    } catch (e) {
      console.error("Error loading roles:", e)
      error({ statusCode: e.response?.status || 500, message: "Error al cargar roles" })
      return {
        response: { data: [], total: 0 },
        options,
      }
    }
  },

  data() {
    return {
      filterRole: "",
      role: {},
      response: { data: [], total: 0 },
      options: {
        page: 1,
        sortBy: ["name"],
        sortDesc: [false],
        itemsPerPage: 10,
      },
      roleDialog: false,
      roleDialogDelete: false,
      dialogDelete: {},
      loading: false,
      saving: false,
      deleting: false,
      skipFilterWatch: false, // Flag para evitar llamadas duplicadas
    }
  },

  computed: {
    hasRoles() {
      return this.response?.data?.length > 0
    },
  },

  watch: {
    filterRole: {
      handler: debounce(function (value) {
        // Si skipFilterWatch está activo, no ejecutar el watch
        if (this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
  },

  mounted() {
    this.setNavBar()
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit("setNavBar", {
        title: "Roles",
        icon: "mdi-redhat",
      })
    },

    /**
     * Maneja el cambio en el filtro de búsqueda
     */
    async handleFilterChange(value) {
      await this.loadRoles({ filter: value || "", page: 1 })
    },

    /**
     * Carga los roles con las opciones especificadas
     */
    async loadRoles(overrides = {}) {
      try {
        this.loading = true
        this.$store.dispatch("hideNextLoading")

        // Combina opciones actuales con las sobrescrituras
        const requestOptions = {
          ...this.options,
          ...overrides,
        }

        // Preserva el filtro actual si no se sobrescribe explícitamente
        if (this.filterRole && !Object.prototype.hasOwnProperty.call(overrides, "filter")) {
          requestOptions.filter = this.filterRole
        }

        this.response = await this.$repository.Role.index(requestOptions)

        // Actualiza las opciones después de una carga exitosa
        this.options = requestOptions
      } catch (error) {
        console.error("Error loading roles:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || "Error al cargar roles",
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * Refresca la lista de roles manteniendo las opciones actuales
     */
    async refreshRoles() {
      await this.loadRoles()
    },

    /**
     * Maneja el cambio de ordenamiento desde la tabla
     */
    async handleSorting(options) {
      this.options = options
      await this.loadRoles()
    },

    /**
     * Abre el diálogo para crear un nuevo rol
     */
    newRole() {
      this.role = {}
      this.roleDialog = true
    },

    /**
     * Abre el diálogo para editar un rol existente
     */
    editRole(item) {
      this.role = { ...item }
      this.roleDialog = true
    },

    /**
     * Navega a la página de permisos del rol
     */
    editRolePermissions(item) {
      this.$router.push(`/role/${item.id}`)
    },

    /**
     * Prepara el diálogo de confirmación para eliminar un rol
     */
    beforeDeleteRole(item) {
      this.dialogDelete = {
        text: "¿Desea eliminar el Rol ",
        strong: item.name,
        text2: "?",
        payload: item,
      }
      this.roleDialogDelete = true
    },

    /**
     * Elimina un rol
     */
    async deleteRole(item) {
      try {
        this.deleting = true
        await this.$repository.Role.delete(item.id, item)

        // Activa el flag para evitar que el watch dispare una llamada adicional
        this.skipFilterWatch = true

        // Limpia el filtro y recarga la primera página (solo 1 llamada GET)
        this.filterRole = ""
        await this.loadRoles({ page: 1, filter: "" })

        this.roleDialogDelete = false
      } catch (error) {
        console.error("Error deleting role:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || "Error al eliminar el rol",
        })
      } finally {
        this.deleting = false
      }
    },

    /**
     * Guarda un rol (crear o actualizar)
     */
    async saveRole(item) {
      try {
        this.saving = true

        const isUpdate = Boolean(item.id)

        if (isUpdate) {
          await this.$repository.Role.update(item.id, item)
        } else {
          await this.$repository.Role.create(item)
        }

        this.$notify({
          type: "success",
          text: `Rol ${isUpdate ? "actualizado" : "creado"} exitosamente`,
        })

        // Aplica el filtro con el nombre del rol guardado y recarga
        this.filterRole = item.name
        this.roleDialog = false
      } catch (error) {
        console.error("Error saving role:", error)
        this.$notify({
          type: "error",
          text: error.response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} el rol`,
        })
      } finally {
        this.saving = false
      }
    },

    /**
     * Cierra el diálogo de rol
     */
    closeDialog() {
      this.roleDialog = false
      this.role = {}
    },
  },
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
