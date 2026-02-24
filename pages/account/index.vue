<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <div class="title">
          Nombre: {{ user.name }} {{ user.last_name }}
          {{ user.second_last_name }}
        </div>
        <div class="subtitle-1">Email: {{ user.email }}</div>
        <div class="overline">App Version: {{ appVersion() }}</div>
      </v-col>
      <v-col>
        <!-- <v-btn color="primary">Editar Nombre</v-btn> -->
        <v-btn color="success" @click="dialogPassword = true">Cambiar contraseña</v-btn>
      </v-col>
      <v-col cols="12">
        <div class="text-h6">Permisos:</div>
        <ul>
          <li v-for="(orgIds, perm) in permissions_org" :key="perm">
            <strong>{{ perm }}</strong>
            :
            <span v-if="orgIds && orgIds.length">
              [
              <span v-for="(oid, i) in orgIds" :key="oid">
                {{ getOrgNameById(oid) }}
                <span v-if="i < orgIds.length - 1">,</span>
              </span>
              ]
            </span>
            <span v-else>[Sin organización]</span>
          </li>
        </ul>
      </v-col>
    </v-row>
    <UserDialogPassword v-if="dialogPassword" @close="dialogPassword = false" @save="changePassword($event)"></UserDialogPassword>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    dialogPassword: false,
    head: {},
  }),
  computed: {
    permissions_org() {
      return this.$store.getters.permissions || {}
    },
    orgs() {
      return this.$store.getters.orgs || []
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", { title: "Perfil", icon: "mdi-account" })
  },
  methods: {
    appVersion() {
      return process.env.APP_VERSION
      // return this.$store.getters.appVersion
    },
    getOrgNameById(id) {
      const org = this.orgs.find((o) => o.id === id)
      return org ? org.name : id
    },
    async changePassword(payload) {
      await this.$repository.User.change(payload)
        .then((res) => {
          this.$auth.logout()
        })
        .catch((e) => {})
    },
  },
}
</script>
