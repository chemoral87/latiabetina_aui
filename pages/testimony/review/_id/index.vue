<template>
  <v-container>
    <v-row dense>
      <!-- <v-col cols="12" md="6">
        <PermissionCombobox label="Permisos" :permissionsx="mRole.permissions" @modelChange="setPermissions"></PermissionCombobox>
      </v-col>
      <v-col cols="12">
        <v-btn color="primary" outlined class="mr-1" @click="$router.push('/roles')">Cancelar</v-btn>
        <v-btn color="primary" @click="saveRolePermissions()">Guardar</v-btn>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, params, store, error }) {
    // const orgIds = await store.dispatch("validatePermission", { permission: "role-update", error })

    const res = await app.$repository.Role.show(params.id).catch((e) => {})
    return { mRole: res }
  },
  data() {
    return {
      mRole: {},
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    const roleName = this.mRole.name || ""
    eventBus.$emit("setNavBar", {
      title: "Testimonio " + roleName,
      icon: "mdi-redhat",
      back: "/role",
      show_drawer: false,
    })
  },
  methods: {
    setPermissions(permissions) {
      this.mRole.permissions = permissions
    },
    async saveRolePermissions() {
      const permissionsIds = this.mRole.permissions.map((x) => x.id)
      const params = {
        permissionsIds,
      }
      await this.$repository.Role.children(this.mRole.id, params).then((res) => {
        this.$router.push("/role")
      })
    },
  },
}
</script>
