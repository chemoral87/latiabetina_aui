<template>
  <v-container>
    <v-row dense>

      <!-- LEFT COLUMN: User info + Roles -->
      <v-col cols="12" md="5">

        <!-- User card -->
        <v-card flat outlined class="mb-3 pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="primary" size="52" class="mr-3">
              <span class="white--text text-h6">{{ initials }}</span>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">
                {{ user.name }} {{ user.last_name }} {{ user.second_last_name }}
              </div>
              <div class="text-body-2 grey--text">{{ user.email }}</div>
              <div class="overline grey--text">v{{ appVersion() }}</div>
            </div>
          </div>
          <v-btn color="success" small @click="dialogPassword = true">
            <v-icon left small>mdi-lock-reset</v-icon>
            Cambiar contraseña
          </v-btn>
        </v-card>

        <!-- Roles card -->
        <v-card flat outlined>
          <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
            <v-icon left small color="primary">mdi-shield-account</v-icon>
            Roles
          </v-card-title>
          <v-card-text class="pt-1">
            <div v-if="!hasRoles" class="grey--text text-body-2">Sin roles asignados</div>
            <div v-for="(orgIds, role) in roles_org" :key="role" class="mb-2">
              <div class="d-flex align-center flex-wrap" style="gap: 6px">
                <v-chip small color="primary" dark label>{{ role }}</v-chip>
                <v-chip
                  v-for="oid in orgIds"
                  :key="oid"
                  x-small
                  outlined
                  color="primary"
                >
                  {{ getOrgNameById(oid) }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

      </v-col>

      <!-- RIGHT COLUMN: Permissions -->
      <v-col cols="12" md="7">
        <v-card flat outlined height="100%">
          <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
            <v-icon left small color="secondary">mdi-key-variant</v-icon>
            Permisos
          </v-card-title>
          <v-card-text class="pt-1">
            <div v-if="!hasPermissions" class="grey--text text-body-2">Sin permisos asignados</div>
            <v-row dense>
              <v-col
                v-for="(orgIds, perm) in permissions_org"
                :key="perm"
                cols="12"
                sm="6"
              >
                <div class="d-flex align-center flex-wrap" style="gap: 4px">
                  <v-chip x-small color="secondary" dark label class="mr-1">{{ perm }}</v-chip>
                  <v-chip
                    v-for="oid in orgIds"
                    :key="oid"
                    x-small
                    outlined
                    color="secondary"
                  >
                    {{ getOrgNameById(oid) }}
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>

    <UserDialogPassword
      v-if="dialogPassword"
      @close="dialogPassword = false"
      @save="changePassword($event)"
    />
  </v-container>
</template>

<script>
export default {
  data: () => ({
    dialogPassword: false,
  }),
  computed: {
    user() {
      return this.$store.getters.user || {}
    },
    permissions_org() {
      return this.$store.getters.permissions || {}
    },
    roles_org() {
      return this.$store.getters.roles || {}
    },
    orgs() {
      return this.$store.getters.orgs || []
    },
    hasPermissions() {
      return Object.keys(this.permissions_org).length > 0
    },
    hasRoles() {
      return Object.keys(this.roles_org).length > 0
    },
    initials() {
      const n = this.user.name?.[0] || ''
      const l = this.user.last_name?.[0] || ''
      return (n + l).toUpperCase() || '?'
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit('setNavBar', { title: 'Perfil', icon: 'mdi-account' })
  },
  methods: {
    appVersion() {
      return process.env.APP_VERSION
    },
    getOrgNameById(id) {
      const org = this.orgs.find((o) => o.id === id)
      return org ? org.short_code || org.name : id
    },
    async changePassword(payload) {
      await this.$repository.User.change(payload)
        .then(() => {
          this.$auth.logout()
        })
        .catch(() => {})
    },
  },
}
</script>
