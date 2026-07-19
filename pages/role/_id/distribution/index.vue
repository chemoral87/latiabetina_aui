<template>
  <v-container>
    <v-row dense>
      <!-- Organization Filter -->
      <v-col cols="12" md="3">
        <v-select
          v-model="selectedOrganization"
          :items="organizationOptions"
          item-text="name"
          item-value="id"
          label="Organización"
          clearable
          outlined
          dense
          hide-details
        />
      </v-col>

      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-shield-key-outline</v-icon>
            Perfiles con el rol {{ role.name }}
            <v-spacer />
            <v-chip color="info" small>{{ filteredProfiles.length }} perfiles</v-chip>
          </v-card-title>

          <v-card-text class="pt-0">
            <v-data-table
              :headers="headers"
              :items="filteredProfiles"
              :items-per-page="10"
              class="elevation-0"
              no-data-text="No hay perfiles asignados a este rol"
            >
              <template #[`item.user`]="{ item }">
                {{ userName(item.user) }}
              </template>
              <template #[`item.organization`]="{ item }">
                {{ item.organization_name }} ({{ item.organization_short_code }})
              </template>
              <template #[`item.lastLogin`]="{ item }">
                {{ item.user.last_login_at | formatLastLogin }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card outlined>
          <v-card-text class="d-flex justify-end pa-4">
            <v-btn color="primary" outlined @click="$router.push('/role')">
              <v-icon left>mdi-arrow-left</v-icon>
              Volver
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ $repository, params, error }) {
    try {
      const response = await $repository.Role.distribution(params.id)
      return { role: response.role, profiles: response.profiles }
    } catch(e) {
      error({ statusCode: e.response?.status || 500, message: "Error al cargar la distribución del rol" })
      return { role: {}, profiles: [] }
    }
  },

  data() {
    return {
      role: {},
      profiles: [],
      selectedOrganization: null,
      headers: [
        { text: "Usuario", value: "user" },
        { text: "Correo", value: "user.email" },
        { text: "Organización", value: "organization" },
        { text: "Último acceso", value: "lastLogin" },
      ],
    }
  },

  computed: {
    organizationOptions() {
      const orgs = new Map();
      this.profiles.forEach(profile => {
        if (!orgs.has(profile.org_id)) {
          orgs.set(profile.org_id, {
            id: profile.org_id,
            name: profile.organization_name,
            short_code: profile.organization_short_code,
          });
        }
      });
      return Array.from(orgs.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    filteredProfiles() {
      if (!this.selectedOrganization) {
        return this.profiles;
      }
      return this.profiles.filter(profile => profile.org_id === this.selectedOrganization);
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: `Distribución: ${this.role.name || "Rol"}`,
      icon: "mdi-share-variant",
      back: "/role",
      show_drawer: false,
    })
  },

  methods: {
    userName(user) {
      return [user?.name, user?.last_name, user?.second_last_name].filter(Boolean).join(" ")
    },
  },
}
</script>