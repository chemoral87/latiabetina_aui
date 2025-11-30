<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="6" md="2">
        <v-text-field v-model="filterOrganization" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>

      <v-spacer />
      <v-col cols="auto">
        <v-btn color="success" class="mb-1 mr-1" @click="newOrganization()">
          <v-icon>mdi-account-plus</v-icon>
          Nuevo Organization
        </v-btn>
      </v-col>
      <v-col cols="12">
        <OrganizationTable :options="options" :response="response" :dialog-delete.sync="dialogDeleteOrganization" @sorting="indexOrganizations" @edit="editOrganization" @delete="deleteOrganization" @config="goConfig" />
      </v-col>
    </v-row>
    <OrganizationFormDialog v-if="organizationFormDialog" :organization="organization" @close="closeFormDialog()" @save="saveOrganization" />
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, error, store }) {
    // let orgs_id = await store.dispatch("validatePermission", { permission: "organization-index", error });

    const options = {
      sortBy: ["name"],
      sortDesc: [true],
      itemsPerPage: 5,
    }
    const response = await app.$repository.Organization.index(options).catch((e) => {
      error(app.$handleError(e))
    })
    return { response, options }
  },
  data() {
    return {
      dialogDeleteOrganization: false,
      organizationFormDialog: false,
      options: {},
      response: {},
      filterOrganization: "",
    }
  },
  watch: {
    async filterOrganization(value) {
      const me = this
      this.$store.dispatch("hideNextLoading")
      const op = Object.assign(me.options, { filter: value, page: 1 })
      me.response = await me.$repository.Organization.index(op)
    },
  },
  // validate({ store, error }) {
  //   if (store.getters.permissions.includes("organization-index")) return true;
  //   else throw error({ statusCode: 403 });
  // },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Organizaciones",
      icon: "mdi-domain",
    })
  },
  methods: {
    goConfig(item) {
      this.$router.push(`/organizations/${item.id}/config`)
    },
    newOrganization() {
      this.organization = {}
      this.organizationFormDialog = true
    },
    editOrganization(item) {
      this.organization = Object.assign({}, item)
      this.organizationFormDialog = true
    },
    async indexOrganizations(options) {
      if (options) {
        this.options = Object.assign(this.options, options)
      }
      const op = Object.assign({ filter: this.filter }, this.options)
      this.response = await this.$repository.Organization.index(op)
    },
    // editOrganization(item) {
    //   this.$router.push(`/organization/${item.id}`);
    // },
    async deleteOrganization(item) {
      await this.$repository.Organization.delete(item.id)
        .then((res) => {
          this.dialogDeleteOrganization = false
          this.indexOrganizations()
        })
        .catch((e) => {})
    },

    async saveOrganization(item) {
      const me = this
      if (item.id) {
        await this.$repository.Organization.update(item.id, item)
          .then((res) => {
            me.indexOrganizations()
            me.organizationFormDialog = false
          })
          .catch((e) => {})
      } else {
        await this.$repository.Organization.create(item)
          .then((res) => {
            me.indexOrganizations()
            me.organizationFormDialog = false
          })
          .catch((e) => {})
      }
    },
    closeFormDialog() {
      this.organizationFormDialog = false
      this.clearErrors()
    },
  },
}
</script>
