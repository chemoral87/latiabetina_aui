<template>
  <v-dialog :value="true" persistent max-width="400px">
    <v-card v-if="session">
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
        <v-icon left small color="primary">mdi-calendar-edit</v-icon>
        Semana {{ session.week_number }}
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="localSession.date" label="Fecha" type="date" outlined dense
              hide-details="auto" />
          </v-col>
          <v-col cols="12">
            <v-select v-model="localSession.status" label="Estado" outlined dense
              :items="statuses" item-text="label" item-value="value" hide-details="auto" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="localSession.notes" label="Notas" outlined dense rows="2"
              hide-details="auto" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" @click="cancel">Cancelar</v-btn>
        <v-btn color="primary" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "LifeGroupSessionDialog",

  props: {
    session: { type: Object, default: null },
  },

  data() {
    return {
      localSession: {},
      statuses: [
        { label: "Programada", value: "scheduled" },
        { label: "Completada", value: "completed" },
        { label: "Cancelada", value: "cancelled" },
        { label: "Reprogramada", value: "rescheduled" },
      ],
    }
  },

  mounted() {
    this.localSession = { ...this.session }
  },

  methods: {
    cancel() {
      this.$emit("close")
    },
    save() {
      this.$emit("save", this.localSession)
    },
  },
}
</script>
