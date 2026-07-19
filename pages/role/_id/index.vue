<template>
  <v-container>
    <v-row>
      <!-- Permisos existentes -->
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-shield-key-outline</v-icon>
            Permisos del rol
          </v-card-title>
          <v-card-text>
            <PermissionCombobox :key="comboboxKey" label="Buscar y asignar permisos" :permissionsx="mRole.permissions"
              @modelChange="setPermissions" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Crear permiso al vuelo -->
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="success">mdi-plus-circle-outline</v-icon>
            Crear nuevo permiso
          </v-card-title>
          <v-card-text class="pb-2">
            <v-row dense align="center">
              <v-col col="12">
                <v-text-field v-model="newPermissionName" label="Nombre del permiso" placeholder="ej. product-create"
                  outlined dense clearable hide-details :loading="creatingPermission" :disabled="creatingPermission"
                  @keyup.enter="createAndAddPermission" />
              </v-col>
              <v-col cols="auto">
                <v-btn color="success" :disabled="!newPermissionName || creatingPermission"
                  :loading="creatingPermission" @click="createAndAddPermission">
                  <v-icon left>mdi-plus</v-icon>
                  Crear y agregar
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Acciones -->
      <v-col cols="12">
        <v-card outlined>
          <v-card-text class="d-flex justify-start gap-2 pa-4">
            <v-btn color="primary" outlined @click="$router.push('/role')">Cancelar</v-btn>
            <v-btn color="primary" @click="saveRolePermissions()">Guardar</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, params, store, error }) {
    const res = await app.$repository.Role.show(params.id).catch((e) => { })
    return { mRole: res }
  },
  data() {
    return {
      mRole: {},
      comboboxKey: 0,
      newPermissionName: "",
      creatingPermission: false,
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    const roleName = this.mRole.name || ""
    eventBus.$emit("setNavBar", {
      title: "Rol " + roleName,
      icon: "mdi-redhat",
      back: "/role",
      show_drawer: false,
    })
  },

  methods: {
    setPermissions(permissions) {
      this.mRole.permissions = permissions
    },

    async createAndAddPermission() {
      const name = (this.newPermissionName || "").trim()
      if (!name) return

      const alreadyAssigned = (this.mRole.permissions || []).some(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      )
      if (alreadyAssigned) {
        this.showSnackbar(`El permiso "${name}" ya está asignado al rol.`, "warning")
        return
      }

      this.creatingPermission = true
      try {
        const res = await this.$axios.$post(`/role/${this.mRole.id}/permission`, { name })
        if (!this.mRole.permissions) this.mRole.permissions = []
        this.mRole.permissions = [...this.mRole.permissions, res.permission]
        this.comboboxKey++
        this.newPermissionName = ""
        this.showSnackbar(`Permiso "${res.permission.name}" agregado al rol.`, "success")
      } catch (e) {
        const msg =
          e?.response?.data?.errors?.name?.[0] ||
          e?.response?.data?.message ||
          "Error al crear el permiso."
        this.showSnackbar(msg, "error")
      } finally {
        this.creatingPermission = false
      }
    },

    async saveRolePermissions() {
      const permissionsIds = (this.mRole.permissions || []).map((x) => x.id)
      await this.$repository.Role.children(this.mRole.id, { permissionsIds }).then(() => {
        this.$router.push("/role")
      })
    },

    showSnackbar(message, color = "success") {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },
  },
}
</script>
