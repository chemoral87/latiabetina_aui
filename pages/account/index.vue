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
              <div class="text-h6 font-weight-bold">{{ user.name }} {{ user.last_name }} {{ user.second_last_name }}</div>
              <div class="text-body-2 grey--text">{{ user.email }}</div>
              <div class="overline grey--text">v{{ appVersion() }}</div>
            </div>
          </div>
          <v-btn color="success" small @click="dialogPassword = true">
            <v-icon left small>mdi-lock-reset</v-icon>
            Cambiar contraseña
          </v-btn>
        </v-card>
        <!-- View toggle -->
        <div class="d-flex align-center mb-3" style="gap: 6px">
          <span class="text-caption grey--text">Separado</span>
          <v-switch v-model="combinedView" hide-details dense inset class="mt-0 pt-0" />
          <span class="text-caption grey--text">Combinado</span>
        </div>

        <!-- Roles card (hidden in combined view) -->
        <v-card v-if="!combinedView" flat outlined>
          <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
            <v-icon left small color="primary">{{ rolesIcon }}</v-icon>
            Roles
          </v-card-title>
          <v-card-text class="pt-1">
            <div v-if="!hasRoles" class="grey--text text-body-2">Sin roles asignados</div>
            <div v-for="(orgIds, role) in roles_org" :key="role" class="mb-2">
              <div class="d-flex align-center flex-wrap" style="gap: 6px">
                <v-chip small color="primary" dark label>{{ role }}</v-chip>
                <v-chip v-for="oid in orgIds" :key="oid" x-small outlined color="primary">
                  {{ getOrgNameById(oid) }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT COLUMN: Permissions / Combined view -->
      <v-col cols="12" md="7">
        <v-card flat outlined height="100%">
          <v-card-title class="text-subtitle-1 font-weight-bold pb-1">
            <span v-if="!combinedView">
              <v-icon left small color="secondary">{{ permsIcon }}</v-icon>
              Permisos
            </span>
            <span v-else>
              <v-icon left small color="primary">{{ rolesIcon }}</v-icon>
              <v-icon left small color="secondary">{{ permsIcon }}</v-icon>
              Roles y permisos
            </span>
          </v-card-title>
          <v-divider />
          <v-card-text class="pt-2">
            <!-- ═══ SEPARATE VIEW (current) ═══ -->
            <template v-if="!combinedView">
              <div v-if="!hasPermissions" class="grey--text text-body-2">Sin permisos asignados</div>
              <v-row dense>
                <v-col v-for="(orgIds, perm) in permissions_org" :key="perm" cols="12" sm="6">
                  <div class="d-flex align-center flex-wrap" style="gap: 4px">
                    <v-chip x-small color="secondary" dark label class="mr-1">{{ perm }}</v-chip>
                    <v-chip v-for="oid in orgIds" :key="oid" x-small outlined color="secondary">
                      {{ getOrgNameById(oid) }}
                    </v-chip>
                  </div>
                </v-col>
              </v-row>
            </template>

            <!-- ═══ COMBINED VIEW ═══ -->
            <template v-else>
              <div v-if="!hasRoles" class="grey--text text-body-2">Sin roles asignados</div>
              <div v-else>
                <div v-for="(orgIds, roleName) in roles_org" :key="roleName" class="mb-4">
                  <div class="d-flex align-center flex-wrap mb-1" style="gap: 6px">
                    <v-chip small color="primary" dark label>
                      <v-icon left small>{{ rolesIcon }}</v-icon>
                      {{ roleName }}
                    </v-chip>
                    <v-chip v-for="oid in orgIds" :key="oid" x-small outlined color="primary">
                      {{ getOrgNameById(oid) }}
                    </v-chip>
                    <v-chip x-small color="secondary" outlined class="ml-1">{{ (roles_permissions[roleName] || []).length }} permisos</v-chip>
                  </div>

                  <div v-if="roles_permissions[roleName] && roles_permissions[roleName].length > 0" class="pl-2">
                    <v-chip v-for="perm in roles_permissions[roleName]" :key="perm" x-small label color="secondary" dark class="mr-1 mb-1">
                      {{ perm }}
                    </v-chip>
                  </div>
                  <div v-else class="grey--text text-caption pl-2">Sin permisos asociados a este rol</div>
                </div>
              </div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <UserDialogPassword v-if="dialogPassword" @close="dialogPassword = false" @save="changePassword($event)" />
  </v-container>
</template>

<script>
export default {
  data: () => ({
    dialogPassword: false,
    combinedView: false,
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
    roles_permissions() {
      return this.$store.getters.rolesPermissions || {}
    },
    rolesIcon() {
      return "mdi-redhat"
    },
    permsIcon() {
      return "mdi-key-variant"
    },
    hasPermissions() {
      return Object.keys(this.permissions_org).length > 0
    },
    hasRoles() {
      return Object.keys(this.roles_org).length > 0
    },
    initials() {
      const n = this.user.name?.[0] || ""
      const l = this.user.last_name?.[0] || ""
      return (n + l).toUpperCase() || "?"
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", { title: "Perfil", icon: "mdi-account" })
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
