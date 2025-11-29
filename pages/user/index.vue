<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="3">
        <v-text-field v-model="filterUser" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro" />
      </v-col>

      <v-col cols="12" md="4">
        <v-btn color="primary" class="mr-1" @click="newUser()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" @click="getUsers()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <UserTable :options="options" :response="response" @sorting="getUsers" @edit="editUser" @editProfiles="editProfiles" @delete="beforeDeleteUser"></UserTable>
      </v-col>
    </v-row>
    <UserDialog v-if="userDialog" :userx="userx" @close="closeDialog" @save="saveUser" />
    <DialogDelete v-if="userDialogDelete" :dialog="dialogDelete" @ok="deleteUser" @close="userDialogDelete = false"></DialogDelete>
    <!-- <UserDialogDelete :userx="userx" v-if="userDialogDelete" @close="userDialogDelete = false" @ok="deleteUser" /> -->
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ $axios, app, store, error }) {
    store.dispatch("validatePermission", { error, permission: "user-index" })

    const op = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }

    const res = await app.$repository.User.index(op).catch((e) => {})
    return { response: res, options: op }
  },

  data() {
    return {
      userx: {},
      options: {},
      filterUser: "",
      userDialog: false,
      userDialogDelete: false,
    }
  },
  watch: {
    filterUser(value) {
      this.$store.dispatch("hideNextLoading")
      const me = this
      const op = Object.assign(me.options, { filter: value, page: 1 })

      me.getUsers(op)
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", { title: "Usuarios", icon: "account" })
  },

  methods: {
    newUser() {
      this.userx = {}
      this.userDialog = true
    },
    editUser(item) {
      this.userDialog = true
      this.userx = Object.assign({}, item)
    },
    editUserRoles(item) {
      this.$router.push(`/user/${item.id}`)
    },
    editProfiles(item) {
      this.$router.push(`/user/${item.id}/profile`)
    },
    beforeDeleteUser(item) {
      this.userDialogDelete = true
      this.dialogDelete = {
        text: "Desea eliminar el Usuario ",
        strong: `${item.name} ${item.last_name}  ${item.second_last_name ? item.second_last_name : ""}`,
        payload: item,
      }
      // this.userx = Object.assign({}, item);
    },
    async deleteUser(item) {
      await this.$repository.User.delete(item.id, item)
        .then((res) => {
          this.getUsers()
          this.userDialogDelete = false
        })
        .catch((e) => {})
    },
    async getUsers(options) {
      if (options) {
        this.options = options
      }
      const op = Object.assign({ filter: this.filterUser }, this.options)
      this.response = await this.$repository.User.index(op)
    },
    async saveUser(item) {
      const me = this
      if (item.id) {
        await this.$repository.User.update(item.id, item)
          .then((res) => {
            me.getUsers()
            me.userDialog = false
          })
          .catch((e) => {})
      } else {
        await this.$repository.User.create(item)
          .then((res) => {
            me.getUsers()
            me.userDialog = false
          })
          .catch((e) => {})
      }
    },
    closeDialog() {
      this.userDialog = false
      this.clearErrors()
    },
  },
}
</script>
