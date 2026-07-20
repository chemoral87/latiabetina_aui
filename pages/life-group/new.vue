<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-form ref="form" v-model="valid" @submit.prevent="save">
          <!-- Section 1: Información general -->
          <v-row dense>
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                  <v-icon left small color="primary">mdi-information-outline</v-icon>
                  Información general
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <v-text-field v-model="item.name" label="Nombre de la Red" outlined dense
                        :rules="[$vrules.required]" hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select v-model="item.day_of_week" label="Día de reunión" outlined dense :items="days"
                        :rules="[$vrules.required]" hide-details="auto" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <MyTimePicker v-model="item.time" label="Hora" outlined dense :error-messages="timeError"
                        hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <MyDatePicker v-model="item.start_date" label="Fecha de inicio" outlined dense :required="true"
                        :rules="[$vrules.required]" hide-details="auto" />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-select v-model="item.status" label="Estado" outlined dense :items="statuses" item-text="label"
                        item-value="value" hide-details="auto" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Section 2: Dirección -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                  <v-icon left small color="primary">mdi-map-marker-outline</v-icon>
                  Dirección
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <v-text-field v-model="item.address" label="Dirección" outlined dense hide-details="auto"
                        placeholder="Calle y número" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="item.neighborhood" label="Colonia / Zona" outlined dense
                        hide-details="auto" />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field v-model="item.reference" label="Referencia" outlined dense hide-details="auto"
                        placeholder="Cerca de..." />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Section 3: Ubicación GPS -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                  <v-icon left small color="primary">mdi-crosshairs-gps</v-icon>
                  Ubicación GPS
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <LifeGroupMapPicker :latitude.sync="item.latitude" :longitude.sync="item.longitude" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Section 4: Líderes adicionales -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card outlined>
                <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
                  <v-icon left small color="primary">mdi-account-multiple</v-icon>
                  Líderes adicionales
                </v-card-title>
                <v-card-text>
                  <UserCombobox :users="[]" label="Seleccionar líderes" @modelChange="onLeadersChange" />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Section 5: Observaciones -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card outlined>
                <v-card-title clasds="text-subtitle-1 font-weight-medium pb-2">
                  <v-icon left small color="primary">mdi-text-box-outline</v-icon>
                  Observaciones
                </v-card-title>
                <v-card-text>
                  <v-textarea v-model="item.observations" label="Observaciones" outlined dense rows="3"
                    hide-details="auto" placeholder="Notas adicionales sobre la Red..." />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Section 6: Acciones -->
          <v-row dense class="mt-4">
            <v-col cols="12">
              <v-card outlined>
                <v-card-text class="d-flex justify-end pa-4 flex-wrap">
                  <v-btn color="primary" outlined class="mr-2 mb-2 mb-sm-0" :disabled="saving" @click="cancel">
                    <v-icon left>mdi-close</v-icon>
                    Cancelar
                  </v-btn>
                  <v-btn color="primary" :loading="saving" :disabled="!valid" @click="save">
                    <v-icon left>mdi-content-save</v-icon>
                    Guardar
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  components: {
    MyTimePicker: () => import('@/components/My/TimePicker.vue'),
    MyDatePicker: () => import('@/components/My/DatePicker.vue'),
    UserCombobox: () => import('@/components/User/Combobox.vue'),
  },

  middleware: ["authenticated", "permission"],
  meta: { permission: "life-group-index" },

  data() {
    return {
      valid: true,
      saving: false,
      timeError: "",
      item: {
        name: "",
        day_of_week: "",
        time: "",
        start_date: "",
        status: "active",
        address: "",
        neighborhood: "",
        reference: "",
        latitude: null,
        longitude: null,
        observations: "",
        leader_ids: [],
      },
      days: [
        "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo",
      ],
      statuses: [
        { label: "Activa", value: "active" },
        { label: "Finalizada", value: "finished" },
        { label: "Cancelada", value: "cancelled" },
      ],
    }
  },

  watch: {
    'item.time'() {
      if (this.timeError) this.timeError = ""
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Nueva Red de Vida",
      icon: "mdi-plus-circle-outline",
      back: "/life-group",
      show_drawer: false
    })
  },

  methods: {
    onLeadersChange(users) {
      this.item.leader_ids = users.map((u) => u.id)
    },

    async save() {
      if (!this.item.time) {
        this.timeError = 'La hora es requerida'
        return
      }
      if (!this.$refs.form.validate()) return

      this.saving = true
      try {
        const payload = {
          ...this.item,
          start_date: this.item.start_date,
          time: this.item.time,
          day_of_week: this.item.day_of_week,
          status: this.item.status || "active",
          leader_ids: this.item.leader_ids,
        }

        await this.$repository.LifeGroup.create(payload)
        this.$router.push("/life-group")
      } catch (error) {
        this.$handleError(error)
      } finally {
        this.saving = false
      }
    },

    cancel() {
      this.$router.push("/life-group")
    },
  },
}
</script>
