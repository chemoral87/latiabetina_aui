<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <span class="text-h5">{{ isEditing ? "Editar" : "Nuevo" }} Evento de Auditorio</span>
        <v-spacer />
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="eventForm">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <organization-select v-model="localEvent.org_id" label="Organización *" hide-one
                  :permission="'auditorium-index'" :rules="organizationRules" :prevent-auto-select="!isEditing"
                  outlined />
              </v-col>
              <!-- Fecha del Evento -->
              <v-col cols="12" md="6">
                <MyDatePicker v-model="localEvent.event_date" label="Fecha del Evento *" :rules="dateRules" required />
              </v-col>

              <!-- Auditorio -->
              <v-col cols="12" md="6">
                <AuditoriumSelect v-model="localEvent.auditorium_id" :org-id="localEvent.org_id"
                  :loading="loadingAuditoriums" label="Auditorio *" :rules="auditoriumRules" outlined />
              </v-col>

              <!-- Organización -->
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" :disabled="!isFormValid" @click="saveEvent">
          {{ isEditing ? "Actualizar" : "Guardar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "AuditoriumEventDialog",

  props: {
    auditoriumEvent: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      dialog: false,
      saving: false,
      loadingAuditoriums: false,
      loadingOrganizations: false,
      auditoriums: [],
      organizations: [],
      localEvent: {
        event_date: null,
        auditorium_id: null,
        org_id: null,
        config: "",
      },

      // Validation rules
      dateRules: [(v) => !!v || "La fecha es requerida"],
      auditoriumRules: [(v) => !!v || "El auditorio es requerido"],
      organizationRules: [(v) => !!v || "La organización es requerida"],
    }
  },

  computed: {
    isEditing() {
      return this.auditoriumEvent && this.auditoriumEvent.id
    },

    isFormValid() {
      return this.localEvent.event_date && this.localEvent.org_id
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.dialog = newVal
        if(newVal) {
          // Reset and refresh localEvent when dialog opens
          this.localEvent = {
            event_date: null,
            auditorium_id: null,
            org_id: null,
            config: "",
          }
          // Force organization select reset for new events
          if(!this.isEditing) {
            this.$nextTick(() => {
              this.localEvent.org_id = null
            })
          }
          this.initializeForm()
          // Reset form validation
          this.$nextTick(() => {
            if(this.$refs.eventForm) {
              this.$refs.eventForm.resetValidation()
            }
          })
        }
      },
    },

    dialog(newVal) {
      if(!newVal) {
        this.$emit("input", false)
      }
    },

    auditoriumEvent: {
      immediate: true,
      deep: true,
      handler() {
        this.initializeForm()
      },
    },
  },

  methods: {
    initializeForm() {
      if(this.auditoriumEvent && Object.keys(this.auditoriumEvent).length > 0) {
        this.localEvent = {
          ...this.auditoriumEvent,
          event_date: this.auditoriumEvent.event_date || null,
          config: this.auditoriumEvent.config || "",
        }
      } else {
        this.localEvent = {
          event_date: null,
          auditorium_id: null,
          org_id: null,
          config: "",
        }
      }
    },

    async loadAuditoriums() {
      this.loadingAuditoriums = true
      try {
        if(this.$repository?.Auditorium?.index) {
          const response = await this.$repository.Auditorium.index({})
          this.auditoriums = response?.data || []
        } else {

          this.auditoriums = []
        }
      } catch(error) {


      } finally {
        this.loadingAuditoriums = false
      }
    },

    saveEvent() {
      if(!this.isFormValid) return

      this.saving = true

      try {
        // Validate JSON config if provided

        const eventData = {
          ...this.localEvent,
        }

        this.$emit("save", eventData)
      } catch(error) {

      } finally {
        this.saving = false
      }
    },

    closeDialog() {
      this.dialog = false
      this.$emit("close")
    },
  },
}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}
</style>
