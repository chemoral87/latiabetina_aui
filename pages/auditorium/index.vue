<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filterAuditorium" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-btn color="primary" class="mr-1" @click="newAuditorium()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" @click="getAuditoriums()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <AuditoriumTable :options="options" :response="response" @sorting="getAuditoriums" @edit="editAuditorium" @delete="beforeDeleteAuditorium" @layout="goToLayout" />
      </v-col>
    </v-row>
    <AuditoriumDialog v-if="auditoriumDialog" :auditorium="auditorium" :orgs="userOrgs" @close="closeDialog" @save="saveAuditorium" />
    <DialogDelete v-if="auditoriumDialogDelete" :dialog="dialogDelete" @ok="deleteAuditorium" @close="auditoriumDialogDelete = false"></DialogDelete>
  </v-container>
</template>
<script>
import AuditoriumTable from "@/components/Auditorium/Table.vue"
import AuditoriumDialog from "@/components/Auditorium/Dialog.vue"
export default {
  components: {
    AuditoriumTable,
    AuditoriumDialog,
  },
  middleware: ["authenticated"],
  async asyncData({ app }) {
    const op = {
      sortBy: ["name"],
      sortDesc: [false],
      itemsPerPage: 10,
    }
    const res = await app.$repository.Auditorium?.index?.(op).catch(() => ({}))
    return { response: res, options: op }
  },
  data() {
    return {
      filterAuditorium: "",
      auditorium: {},
      response: { data: [] },
      options: {},
      auditoriumDialog: false,
      auditoriumDialogDelete: false,
      dialogDelete: {},
      userOrgs: [],
    }
  },
  watch: {
    async filterAuditorium(value) {
      const op = Object.assign(this.options, {
        filter: value,
        page: 1,
        itemsPerPage: 10,
      })
      this.response = (await this.$repository.Auditorium?.index?.(op)) || { data: [] }
    },
  },
  created() {
    this.$nuxt.$emit("setNavBar", { title: "Auditorios", icon: "theater" })
    // Obtener las organizaciones del usuario autenticado
    const user = this.$auth && this.$auth.user ? this.$auth.user : this.$store && this.$store.state && this.$store.state.auth && this.$store.state.auth.user ? this.$store.state.auth.user : null
    if (user && user.orgs) {
      this.userOrgs = user.orgs
    }
  },
  methods: {
    async getAuditoriums(options) {
      if (options) this.options = options
      const op = Object.assign({}, this.options)
      this.response = (await this.$repository.Auditorium?.index?.(op)) || { data: [] }
    },
    newAuditorium() {
      this.auditorium = {}
      this.auditoriumDialog = true
    },
    editAuditorium(item) {
      this.auditorium = Object.assign({}, item)
      this.auditoriumDialog = true
    },
    beforeDeleteAuditorium(item) {
      this.dialogDelete = {
        text: "Desea eliminar el Auditorio ",
        strong: item.name,
        payload: item,
      }
      this.auditoriumDialogDelete = true
    },
    async deleteAuditorium(item) {
      await this.$repository.Auditorium?.delete?.(item.id, item)
      this.getAuditoriums()
      this.auditoriumDialogDelete = false
    },
    async saveAuditorium(item) {
      if (item.id) {
        await this.$repository.Auditorium?.update?.(item.id, item)
      } else {
        await this.$repository.Auditorium?.create?.(item)
      }
      this.getAuditoriums()
      this.auditoriumDialog = false
    },
    closeDialog() {
      this.auditoriumDialog = false
    },
    goToLayout(item) {
      this.$router.push(`/auditorium/${item.id}/editor`)
    },
  },
}
</script>
