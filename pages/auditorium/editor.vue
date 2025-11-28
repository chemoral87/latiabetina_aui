<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>Editor de Auditorio</h2>
        <div v-if="loading">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else>
          <v-card>
            <v-card-title>
              {{ auditorium.name }}
              <v-spacer />
              <v-btn color="primary" @click="$router.push('/auditorium')">Volver</v-btn>
            </v-card-title>
            <v-card-text>
              <div>
                <b>ID:</b>
                {{ auditorium.id }}
              </div>
              <div>
                <b>Organización:</b>
                {{ orgName }}
              </div>
              <!-- Aquí puedes agregar el editor visual de asientos, secciones, etc. -->
              <div class="mt-4">
                <v-alert type="info">Aquí irá el editor visual del auditorio.</v-alert>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ params, app }) {
    let auditorium = {}
    let orgName = ""
    let loading = true
    try {
      auditorium = (await app.$repository.Auditorium?.show?.(params.id)) || {}
      // Buscar nombre de la organización si está en user
      const user = app.$auth && app.$auth.user
      if (user && user.orgs && auditorium.org_id) {
        const org = user.orgs.find((o) => o.id === auditorium.org_id)
        orgName = org ? org.name : ""
      }
      loading = false
    } catch (e) {
      loading = false
    }
    return { auditorium, orgName, loading }
  },
}
</script>
