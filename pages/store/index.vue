<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="6" md="2">
        <v-text-field v-model="filterStore" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>

      <v-spacer />
      <v-col cols="auto">
        <v-btn color="success" class="mb-1 mr-1" @click="$router.push('store/new')">
          <v-icon>mdi-account-plus</v-icon>
          Nuevo Store
        </v-btn>
      </v-col>
      <v-col cols="12">
        <StoreTable :options="options" :response="response" :dialog-delete.sync="dialogDeleteStore" @sorting="indexStore" @edit="editStore" @delete="deleteStore" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ $axios, app }) {
    const options = {
      sortBy: ["name"],
      sortDesc: [true],
      itemsPerPage: 5,
    }
    const response = await app.$repository.Store.index(options).catch((e) => {})
    return { response, options }
  },
  data() {
    return {
      dialogDeleteStore: false,
      options: {},
      response: {},
      filterStore: "",
    }
  },
  watch: {
    async filterStore(value) {
      const me = this
      this.$store.dispatch("hideNextLoading")
      const op = Object.assign(me.options, { filter: value, page: 1 })
      me.response = await me.$repository.Store.index(op)
    },
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Store",
      icon: "human-greeting-variant",
    })
  },
  methods: {
    async indexStore(options) {
      if (options) {
        this.options = Object.assign(this.options, options)
      }
      const op = Object.assign({ filter: this.filter }, this.options)
      this.response = await this.$repository.Store.index(op)
    },
    editStore(item) {
      this.$router.push(`/store/${item.id}`)
    },
    async deleteStore(item) {
      await this.$repository.Store.delete(item.id)
        .then((res) => {
          this.dialogDeleteStore = false
          this.indexStore()
        })
        .catch((e) => {})
    },
  },
}
</script>
