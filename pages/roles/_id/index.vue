<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="6">
        <PermissionCombobox
          label="Permisos"
          :permissionsx="mRole.permissions"
          @modelChange="setPermissions"
        ></PermissionCombobox>
      </v-col>
      <v-col cols="12">
        <v-btn @click="$router.push('/roles')" color="primary" outlined class="mr-1"> Cancelar </v-btn>
        <v-btn @click="saveRolePermissions()" color="primary"> Guardar </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, params, store, error }) {
    let org_ids = await store.dispatch("validatePermission", { permission: "role-update", error });

    const res = await app.$repository.Role.show(params.id).catch(e => {});
    return { mRole: res };
  },
  data() {
    return {
      mRole: {}
    };
  },
  methods: {
    setPermissions(permissions) {
      this.mRole.permissions = permissions;
    },
    async saveRolePermissions() {
      let permissions_ids = this.mRole.permissions.map(x => x.id);
      let params = {
        permissions_ids: permissions_ids
      };
      await this.$repository.Role.children(this.mRole.id, params).then(res => {
        this.$router.push("/roles");
      });
    }
  },

  created() {
    let role_name = this.mRole.name || "";
    this.$nuxt.$emit("setNavBar", {
      title: "Rol " + role_name,
      icon: "redhat",
      back: "/roles",
      show_drawer: false
    });
  }
};
</script>
