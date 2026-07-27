<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-1" outlined color="primary" dark>
              <v-card-text class="text-center">
                <v-icon large>mdi-account-group</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.activeGroups || 0 }}</div>
                <div>Redes Activas</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-2" outlined color="grey" dark>
              <v-card-text class="text-center">
                <v-icon large>mdi-account-group-outline</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.finishedGroups || 0 }}</div>
                <div>Redes Finalizadas</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-3" outlined color="success" dark>
              <v-card-text class="text-center">
                <v-icon large>mdi-account-multiple</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.totalPeople || 0 }}</div>
                <div>Personas Registradas</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-4" outlined color="info" dark>
              <v-card-text class="text-center">
                <v-icon large>mdi-chart-line</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.avgAttendance || 0 }}</div>
                <div>Asistencia Promedio</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-5" outlined>
              <v-card-text class="text-center">
                <v-icon large color="primary">mdi-calendar</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.completedSessions || 0 }}</div>
                <div>Sesiones Realizadas</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-6" outlined>
              <v-card-text class="text-center">
                <v-icon large color="warning">mdi-calendar-clock</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.pendingSessions || 0 }}</div>
                <div>Sesiones Pendientes</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-7" outlined>
              <v-card-text class="text-center">
                <v-icon large color="success">mdi-account-plus</v-icon>
                <div class="text-h4 font-weight-bold">{{ stats.newGuests || 0 }}</div>
                <div>Nuevos Invitados</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card id="card-life--dashb-8" outlined>
              <v-card-text class="text-center">
                <v-icon large color="info">mdi-calendar-text</v-icon>
                <div class="text-h4 font-weight-bold">{{ totalUpcoming || 0 }}</div>
                <div>Próximas Reuniones</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- Próximas reuniones -->
      <v-col cols="12" md="4">
        <v-card id="card-life--dashb-9" outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-calendar-week</v-icon>
            Próximas Reuniones
          </v-card-title>
          <v-card-text>
            <v-list dense v-if="stats.upcomingSessions?.length">
              <v-list-item v-for="s in stats.upcomingSessions" :key="s.id">
                <v-list-item-content>
                  <v-list-item-title>{{ s.life_group?.name }} - Semana {{ s.week_number }}</v-list-item-title>
                  <v-list-item-subtitle>{{ s.date }} {{ s.start_time }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <div v-else class="grey--text">No hay próximas reuniones</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Asistencia por Líder -->
      <v-col cols="12" md="4">
        <v-card id="card-life--dashb-10" outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-chart-bar</v-icon>
            Asistencia por Líder
          </v-card-title>
          <v-card-text>
            <v-list dense v-if="stats.attendanceByLeader?.length">
              <v-list-item v-for="l in stats.attendanceByLeader" :key="l.name">
                <v-list-item-content>
                  <v-list-item-title>{{ l.name }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small color="primary">{{ l.total }}</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="grey--text">Sin datos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Asistencia por Zona -->
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-map-marker</v-icon>
            Asistencia por Zona
          </v-card-title>
          <v-card-text>
            <v-list dense v-if="stats.attendanceByArea?.length">
              <v-list-item v-for="a in stats.attendanceByArea" :key="a.area">
                <v-list-item-content>
                  <v-list-item-title>{{ a.area }}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip small color="primary">{{ a.total }}</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            <div v-else class="grey--text">Sin datos</div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Asistencia Mensual -->
      <v-col cols="12" v-if="stats.monthlyAttendance?.length">
        <v-card outlined>
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-chart-bar</v-icon>
            Asistencia Mensual (últimos 6 meses)
          </v-card-title>
          <v-card-text>
            <v-simple-table dense>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Asistentes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in stats.monthlyAttendance" :key="m.month">
                  <td>{{ m.month }}</td>
                  <td>{{ m.total }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],

  async asyncData({ app }) {
    try {
      const stats = await app.$repository.LifeGroup.dashboard()
      return { stats: stats || {} }
    } catch {
      return { stats: {} }
    }
  },

  data() {
    return {
      stats: {},
    }
  },

  computed: {
    totalUpcoming() {
      return this.stats.upcomingSessions?.length || 0
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Dashboard Redes de Vida",
      icon: "mdi-chart-box",
      back: "/life-group",
    })
  },
}
</script>
