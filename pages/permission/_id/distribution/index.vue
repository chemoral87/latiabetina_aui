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
            Roles con el permiso {{ permission.name }}
            <v-spacer />
            <v-chip color="info" small>{{ filteredRoles.length }} roles</v-chip>
          </v-card-title>

          <v-card-text class="pt-0">
            <v-data-table
              :headers="headers"
              :items="filteredRoles"
              :items-per-page="10"
              class="elevation-0"
              no-data-text="No hay roles asignados a este permiso"
            >
              <template #[`item.organization`]="{ item }">
                {{ item.organization_name }} ({{ item.organization_short_code }})
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card outlined>
          <v-card-text class="d-flex justify-end pa-4">
            <v-btn color="primary" outlined @click="$router.push('/permission')">
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
      const response = await $repository.Permission.distribution(params.id)
      return { permission: response.permission, roles: response.roles }
    } catch(e) {
      error({ statusCode: e.response?.status || 500, message: "Error al cargar la distribución del permiso" })
      return { permission: {}, roles: [] }
    }
  },

  data() {
    return {
      permission: {},
      roles: [],
      selectedOrganization: null,
      headers: [
        { text: "Rol", value: "role_name" },
        { text: "Organización", value: "organization" },
      ],
    }
  },

  computed: {
    organizationOptions() {
      const orgs = new Map();
      this.roles.forEach(role => {
        if (!orgs.has(role.org_id)) {
          orgs.set(role.org_id, {
            id: role.org_id,
            name: role.organization_name,
            short_code: role.organization_short_code,
          });
        }
      });
      return Array.from(orgs.values()).sort((a, b) => a.name.localeCompare(b.name));
    },

    filteredRoles() {
      if (!this.selectedOrganization) {
        return this.roles;
      }
      return this.roles.filter(role => role.org_id === this.selectedOrganization);
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: `Distribución: ${this.permission.name || "Permiso"}`,
      icon: "mdi-share-variant",
      back: "/permission",
      show_drawer: false,
    })
  },
}
</script>
