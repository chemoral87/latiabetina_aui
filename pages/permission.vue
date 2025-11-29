<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterPermission" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn class="mr-1" color="primary" @click="newPermission()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" @click="getPermissions()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <client-only>
          <PermissionTable :options="options" :response="response" @sorting="getPermissions" @edit="editPermission" @delete="beforeDeletePermission"></PermissionTable>
        </client-only>
      </v-col>
    </v-row>
    <PermissionDialog v-if="permissionDialog" :permission="permission" @close="closeDialog" @save="savePermission" />
    <DialogDelete v-if="permissionDialogDelete" :dialog="dialogDelete" @ok="deletePermission" @close="permissionDialogDelete = false"></DialogDelete>

    <!-- <PermissionDialogDelete :permission="permission" v-if="permissionDialogDelete" @close="permissionDialogDelete = false" @ok="deletePermission" /> -->
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],
  props: {},
  async asyncData({ $axios, app, store, error }) {
    // let org_ids = await store.dispatch("validatePermission", { permission: "permission-index", error });

    const op = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }
    // NOTE Repository https://medium.com/js-dojo/consuming-apis-in-nuxt-using-the-repository-pattern-8a13ea57d520
    const res = await app.$repository.Permission.index(op).catch((e) => {
      error(app.$handleError(e))
    })
    return { response: res, options: op }
  },
  data() {
    return {
      permission: {},
      options: {},
      filterPermission: "",
      permissionDialog: false,
      permissionDialogDelete: false,
      dialogDelete: {},
    }
  },
  watch: {
    async filterPermission(value) {
      const me = this
      this.$store.dispatch("hideNextLoading")
      const op = Object.assign(me.options, { filter: value, page: 1 })
      me.response = await me.$repository.Permission.index(op)
    },
  },

  created() {
    this.$nuxt.$emit("setNavBar", { title: "Permisos", icon: "key" })
  },
  methods: {
    newPermission() {
      this.permission = {}
      this.permissionDialog = true
    },
    editPermission(item) {
      this.permission = Object.assign({}, item)
      this.permissionDialog = true
    },
    beforeDeletePermission(item) {
      this.dialogDelete = {
        text: "Desea eliminar el Permiso ",
        strong: item.name,
        payload: item,
      }
      this.permissionDialogDelete = true
    },
    async deletePermission(item) {
      await this.$repository.Permission.delete(item.id, item)
        .then((res) => {
          this.getPermissions()
          this.permissionDialogDelete = false
        })
        .catch((e) => {})
    },
    async getPermissions(options) {
      if (options) {
        this.options = options
      }
      const op = Object.assign({ filter: this.filterPermission }, this.options)
      this.response = await this.$repository.Permission.index(op)
    },
    async savePermission(item) {
      const me = this
      if (item.id) {
        await this.$repository.Permission.update(item.id, item)
          .then((res) => {
            me.getPermissions()
            me.permissionDialog = false
          })
          .catch((e) => {})
      } else {
        await this.$repository.Permission.create(item)
          .then((res) => {
            me.getPermissions()
            me.permissionDialog = false
          })
          .catch((e) => {})
      }
    },
    closeDialog() {
      this.permissionDialog = false
      this.clearErrors()
    },
  },
}
</script>
