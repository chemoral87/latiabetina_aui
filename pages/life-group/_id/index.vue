<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12">
        <v-card id="card-life--index-1" outlined v-if="group">
          <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
            <v-icon left small color="primary">mdi-information-outline</v-icon>
            {{ group.name }}
            <v-chip :color="statusColor(group.status)" small class="ml-2">
              {{ statusLabel(group.status) }}
            </v-chip>
            <v-spacer />
            <v-btn id="btn-lfgrp-edit-group" outlined small color="primary" @click="editGroup">
              <v-icon left small>mdi-pencil</v-icon> Editar
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="3">
                <strong>Día:</strong> {{ capitalize(group.day_of_week) }}
              </v-col>
              <v-col cols="12" sm="3">
                <strong>Hora:</strong> {{ group.time | formatTime }}
              </v-col>
              <v-col cols="12" sm="3">
                <strong>Inicio:</strong> {{ group.start_date | formatDate }}
              </v-col>
              <v-col cols="12" sm="3">
                <strong>Dirección:</strong> {{ group.address || "Sin dirección" }}
              </v-col>
              <v-col cols="12" v-if="group.leaders && group.leaders.length > 0">
                <strong>Líderes:</strong>
                <v-chip v-for="leader in group.leaders" :key="leader.id" x-small color="primary" class="ml-1 mr-1 mt-1">
                  {{ leader.name }} {{ leader.last_name }}
                </v-chip>
              </v-col>
              <v-col cols="12" v-if="group.observations">
                <strong>Observaciones:</strong> {{ group.observations }}
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Sessions: Tabs for Table / Calendar -->
      <v-col cols="12">
        <v-card id="card-life--index-2" outlined>
          <v-tabs v-model="sessionTab">
            <v-tab>
              <v-icon left small>mdi-table</v-icon>
              Tabla de Sesiones
            </v-tab>
            <v-tab>
              <v-icon left small>mdi-calendar</v-icon>
              Calendario
            </v-tab>
          </v-tabs>

          <v-card-text>
            <v-tabs-items v-model="sessionTab">
              <!-- Table View -->
              <v-tab-item>
                <v-simple-table dense class="elevation-1">
                  <template #default>
                    <thead>
                      <tr>
                        <th class="text-left">Semana</th>
                        <th class="text-left">Fecha</th>
                        <th class="text-left">Asistentes</th>
                        <th class="text-left">Estado</th>
                        <th class="text-left">Notas</th>
                        <th class="text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in sessions" :key="item.id">
                        <td>{{ item.week_number }}</td>
                        <td>{{ item.date | formatDate }}</td>
                        <td>{{ item.attendance?.length || 0 }} asistentes</td>
                        <td>
                          <v-chip :color="sessionStatusColor(item.status)" x-small>
                            {{ sessionStatusLabel(item.status) }}
                          </v-chip>
                        </td>
                        <td>{{ item.notes || "-" }}</td>
                        <td class="pa-1">
                          <v-btn id="btn-lfgrp-attendance" icon x-small color="primary" title="Registrar asistencia"
                            @click="openAttendance(item)">
                            <v-icon small>mdi-account-check</v-icon>
                          </v-btn>
                          <v-btn id="btn-lfgrp-reschedule" icon x-small color="warning" title="Reprogramar" @click="editSession(item)">
                            <v-icon small>mdi-calendar-edit</v-icon>
                          </v-btn>
                          <v-btn id="btn-lfgrp-cancel" icon x-small color="error" title="Cancelar" v-if="item.status === 'scheduled'"
                            @click="cancelSession(item)">
                            <v-icon small>mdi-close-circle</v-icon>
                          </v-btn>
                        </td>
                      </tr>
                      <tr v-if="sessions.length === 0">
                        <td colspan="6" class="text-center grey--text py-4">
                          No hay sesiones registradas
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-tab-item>

              <!-- Calendar View -->
              <v-tab-item>
                <SessionCalendar :sessions="sessions" :life-group-name="group?.name"
                  @session-click="openSessionFromCalendar" @session-drop="moveSession" />
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Group Dialog -->
    <LifeGroupDialog v-if="dialogEdit" :life-group="editingGroup" @close="dialogEdit = false" @save="updateGroup" />

    <DialogDelete v-if="dialogDeleteCancel" :dialog="dialogDeleteCancelData" @ok="confirmCancelSession"
      @close="dialogDeleteCancel = false" />

    <!-- Session Edit Dialog -->
    <v-dialog v-model="sessionDialog" max-width="400px" persistent>
      <v-card v-if="editingSession">
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon left small color="primary">mdi-calendar-edit</v-icon>
          Reprogramar Sesión
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="editingSession.date" label="Fecha" type="date" outlined dense
                hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="editingSession.start_time" label="Hora" type="time" outlined dense
                hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="editingSession.notes" label="Notas" outlined dense rows="2" hide-details="auto" />
            </v-col>
            <v-col cols="12">
              <v-select v-model="editingSession.status" label="Estado" outlined dense :items="sessionStatuses"
                item-text="label" item-value="value" hide-details="auto" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn id="btn-lfgrp-session-cancel" color="primary" outlined class="mr-2" @click="sessionDialog = false">Cancelar</v-btn>
          <v-btn id="btn-lfgrp-session-save" color="primary" @click="saveSession">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Attendance Dialog -->
    <v-dialog v-model="attendanceDialog" max-width="500px" persistent>
      <v-card v-if="attendanceSession">
        <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
          <v-icon left small color="primary">mdi-account-check</v-icon>
          Asistencia - Semana {{ attendanceSession.week_number }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="searchPerson" append-icon="mdi-magnify" clearable label="Buscar persona..." dense
                hide-details @keyup.enter="searchForPerson" />
            </v-col>

            <v-col cols="12" v-if="searchResults.length > 0">
              <v-list dense>
                <v-list-item v-for="p in searchResults" :key="p.id" @click="addAttendee(p)">
                  <v-list-item-content>
                    <v-list-item-title>{{ fullName(p) }}</v-list-item-title>
                    <v-list-item-subtitle v-if="p.phone">{{ p.phone }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon color="success">mdi-plus-circle</v-icon>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12">
              <v-divider class="my-2" />
              <strong>Asistentes registrados:</strong>
            </v-col>

            <v-col cols="12">
              <v-list dense>
                <v-list-item v-for="a in attendees" :key="a.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ fullName(a) }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip x-small :color="typeColor(a.pivot?.type)" class="mr-1">
                        {{ typeLabel(a.pivot?.type) }}
                      </v-chip>
                      <span v-if="a.pivot?.observations">{{ a.pivot.observations }}</span>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn id="btn-lfgrp-remove-attendee" icon small color="error" @click="removeAttendee(a)">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item v-if="attendees.length === 0">
                  <v-list-item-content>
                    <v-list-item-title class="grey--text">Sin asistentes registrados</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- New person form -->
            <v-col cols="12">
              <v-divider class="my-2" />
              <v-btn id="btn-lfgrp-add-person" color="success" small @click="showNewPerson = !showNewPerson">
                <v-icon left small>mdi-account-plus</v-icon>
                Agregar nueva persona
              </v-btn>
            </v-col>

            <template v-if="showNewPerson">
              <v-col cols="12" sm="4">
                <v-text-field v-model="newPerson.name" label="Nombre" prepend-inner-icon="mdi-account-outline" dense outlined hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="4">
                <v-text-field v-model="newPerson.last_name" label="Apellido" prepend-inner-icon="mdi-account-outline" dense outlined hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field v-model="newPerson.age" label="Edad" type="number" dense outlined hide-details="auto" />
              </v-col>
              <v-col cols="12" sm="2">
                <v-text-field v-model="newPerson.phone" label="Teléfono" prepend-inner-icon="mdi-phone" dense outlined hide-details="auto" />
              </v-col>
              <v-col cols="12">
                <v-select v-model="newPersonType" label="Tipo" outlined dense :items="attendeeTypes" item-text="label"
                  item-value="value" hide-details="auto" />
              </v-col>
              <v-col cols="12">
                <v-btn id="btn-lfgrp-create-person" color="primary" small @click="createAndAddPerson">
                  <v-icon left small>mdi-check</v-icon>
                  Agregar y registrar
                </v-btn>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn id="btn-lfgrp-att-close" color="primary" outlined class="mr-2" @click="closeAttendance">Cerrar</v-btn>
          <v-btn id="btn-lfgrp-att-save" color="primary" @click="saveAttendance">Guardar Asistencia</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import SessionCalendar from "~/components/LifeGroup/SessionCalendar.vue"

export default {
  components: { SessionCalendar },
  middleware: ["authenticated"],

  async asyncData({ app, params }) {
    try {
      const groupRes = await app.$repository.LifeGroup.show(params.id)
      return {
        group: groupRes,
        sessions: groupRes?.sessions || [],
      }
    } catch {
      return { group: null, sessions: [], leaders: [] }
    }
  },

  data() {
    return {
      group: null,
      sessions: [],
      sessionTab: 0,
      dialogEdit: false,
      editingGroup: {},
      sessionDialog: false,
      editingSession: null,
      attendanceDialog: false,
      attendanceSession: null,
      attendees: [],
      searchPerson: "",
      searchResults: [],
      showNewPerson: false,
      newPerson: { name: "", last_name: "", age: null, phone: "" },
      newPersonType: "member",
      attendeeTypes: [
        { label: "Miembro", value: "member" },
        { label: "Nuevo Invitado", value: "new_guest" },
        { label: "Converso", value: "convert" },
      ],
      sessionStatuses: [
        { label: "Programada", value: "scheduled" },
        { label: "Completada", value: "completed" },
        { label: "Cancelada", value: "cancelled" },
        { label: "Reprogramada", value: "rescheduled" },
      ],
      dialogDeleteCancel: false,
      dialogDeleteCancelData: {},
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: this.group?.name || "Red de Vida",
      icon: "mdi-account-group",
      back: "/life-group",
    })
  },

  methods: {
    statusColor(s) {
      return { active: "success", finished: "grey", cancelled: "error" }[s] || "primary"
    },
    statusLabel(s) {
      return { active: "Activa", finished: "Finalizada", cancelled: "Cancelada" }[s] || s
    },
    sessionStatusColor(s) {
      return { scheduled: "primary", completed: "success", cancelled: "error", rescheduled: "warning" }[s] || "grey"
    },
    sessionStatusLabel(s) {
      return { scheduled: "Programada", completed: "Completada", cancelled: "Cancelada", rescheduled: "Reprogramada" }[s] || s
    },
    typeColor(t) {
      return { member: "primary", new_guest: "success", convert: "warning" }[t] || "grey"
    },
    typeLabel(t) {
      return { member: "Miembro", new_guest: "Invitado", convert: "Converso" }[t] || t
    },
    fullName(p) {
      return [p.name, p.last_name].filter(Boolean).join(' ') || 'Sin nombre'
    },

    capitalize(s) {
      if (!s) return ""
      return s.charAt(0).toUpperCase() + s.slice(1)
    },

    editGroup() {
      this.editingGroup = { ...this.group }
      this.dialogEdit = true
    },

    async updateGroup(item) {
      try {
        const payload = { ...item }
        // Ensure we pass leader_ids from the leaders array if present
        if (payload.leaders && !payload.leader_ids) {
          payload.leader_ids = payload.leaders.map((l) => l.id)
        }
        delete payload.leaders

        await this.$repository.LifeGroup.update(item.id, payload)
        const res = await this.$repository.LifeGroup.show(item.id)
        this.group = res
        this.dialogEdit = false
      } catch (error) {
        this.$handleError(error)
      }
    },

    editSession(session) {
      this.editingSession = { ...session }
      this.sessionDialog = true
    },

    async saveSession() {
      try {
        await this.$repository.LifeGroup.updateSession(this.editingSession.id, this.editingSession)
        const res = await this.$repository.LifeGroup.show(this.$route.params.id)
        this.group = res
        this.sessions = res?.sessions || []
        this.sessionDialog = false
      } catch (error) {
        this.$handleError(error)
      }
    },

    cancelSession(session) {
      this.dialogDeleteCancelData = {
        text: `¿Cancelar la sesión de la semana ${session.week_number}?`,
        strong: this.$options.filters.formatDate(session.date),
        payload: session,
      }
      this.dialogDeleteCancel = true
    },

    async confirmCancelSession(session) {
      try {
        await this.$repository.LifeGroup.updateSession(session.id, { status: "cancelled" })
        const res = await this.$repository.LifeGroup.show(this.$route.params.id)
        this.sessions = res?.sessions || []
      } catch (error) {
        this.$handleError(error)
      } finally {
        this.dialogDeleteCancel = false
      }
    },

    async openAttendance(session) {
      this.attendanceSession = session
      this.attendees = []
      this.searchPerson = ""
      this.searchResults = []
      this.showNewPerson = false
      this.attendanceDialog = true

      try {
        const res = await this.$repository.LifeGroup.getAttendance(session.id)
        this.attendees = res?.attendees || []
      } catch {
        this.attendees = []
      }
    },

    async searchForPerson() {
      if (!this.searchPerson || this.searchPerson.length < 2) return
      try {
        this.searchResults = await this.$repository.LifeGroup.searchPeople(this.searchPerson)
      } catch {
        this.searchResults = []
      }
    },

    addAttendee(person) {
      if (this.attendees.find((a) => a.id === person.id)) return
      this.attendees.push({ ...person, pivot: { type: "member", observations: null } })
      this.searchPerson = ""
      this.searchResults = []
    },

    removeAttendee(person) {
      this.attendees = this.attendees.filter((a) => a.id !== person.id)
    },

    async createAndAddPerson() {
      if (!this.newPerson.name) return
      try {
        const res = await this.$repository.LifeGroup.createPerson(this.newPerson)
        const person = res.data || res
        this.attendees.push({ ...person, pivot: { type: this.newPersonType, observations: null } })
        this.showNewPerson = false
        this.newPerson = { name: "", last_name: "", age: null, phone: "" }
      } catch (error) {
        // If duplicate, check response for existing person
        if (error?.response?.status === 409 && error?.response?.data?.data) {
          const existing = error.response.data.data
          this.attendees.push({ ...existing, pivot: { type: this.newPersonType, observations: null } })
          this.showNewPerson = false
          this.newPerson = { name: "", last_name: "", age: null, phone: "" }
        } else {
          this.$handleError(error)
        }
      }
    },

    async saveAttendance() {
      try {
        const payload = {
          attendees: this.attendees.map((a) => ({
            person_id: a.id,
            type: a.pivot?.type || "member",
            observations: a.pivot?.observations || null,
          })),
        }
        await this.$repository.LifeGroup.registerAttendance(this.attendanceSession.id, payload)
        // Refresh
        const res = await this.$repository.LifeGroup.show(this.$route.params.id)
        this.sessions = res?.sessions || []
        this.attendanceDialog = false
      } catch (error) {
        this.$handleError(error)
      }
    },

    closeAttendance() {
      this.attendanceDialog = false
    },

    // Calendar event handlers
    openSessionFromCalendar(session) {
      this.editingSession = { ...session }
      this.sessionDialog = true
    },

    async moveSession({ id, date }) {
      try {
        await this.$repository.LifeGroup.updateSession(id, {
          date,
          status: "rescheduled",
        })
        const res = await this.$repository.LifeGroup.show(this.$route.params.id)
        this.sessions = res?.sessions || []
      } catch (error) {
        this.$handleError(error)
      }
    },
  },
}
</script>
