<template>
  <v-dialog id="dlg-lifeg-dialo-1" :value="true" persistent max-width="600px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2">
        <v-icon left small color="primary">{{ iconTitle }}</v-icon>
        {{ formTitle }}
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <!-- Nombre -->
          <v-col cols="12">
            <v-text-field id="tf-lifeg-dialo-item-name-1" v-model="item.name" label="Nombre de la Red" outlined dense
              :rules="[$vrules.required]" hide-details="auto"
              @keyup.enter="save" />
          </v-col>

          <!-- Día de reunión y Hora -->
          <v-col cols="12" sm="6">
            <v-select v-model="item.day_of_week" label="Día de reunión" outlined dense
              :items="days" :rules="[$vrules.required]" hide-details="auto" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field id="tf-lifeg-dialo-item-time-2" v-model="item.time" label="Hora" type="time" outlined dense
              :rules="[$vrules.required]" hide-details="auto" />
          </v-col>

          <!-- Fecha Inicio -->
          <v-col cols="12" sm="6">
            <v-text-field id="tf-lifeg-dialo-item-start_date-3" v-model="item.start_date" label="Fecha de inicio" type="date" outlined dense
              :rules="[$vrules.required]" hide-details="auto" />
          </v-col>

          <!-- Estado -->
          <v-col cols="12" sm="6">
            <v-select v-model="item.status" label="Estado" outlined dense
              :items="statuses" item-text="label" item-value="value" hide-details="auto" />
          </v-col>

          <!-- Dirección -->
          <v-col cols="12">
            <v-text-field id="tf-lifeg-dialo-item-address-4" v-model="item.address" label="Dirección" outlined dense hide-details="auto" />
          </v-col>

          <!-- Referencia -->
          <v-col cols="12">
            <v-text-field id="tf-lifeg-dialo-item-reference-5" v-model="item.reference" label="Referencia" outlined dense hide-details="auto" />
          </v-col>

          <!-- Colonia/Zona -->
          <v-col cols="12">
            <v-text-field id="tf-lifeg-dialo-item-neighborhood-6" v-model="item.neighborhood" label="Colonia / Zona" outlined dense hide-details="auto" />
          </v-col>

          <!-- GPS (Mapa) -->
          <v-col cols="12">
            <v-card id="card-lifeg-dialo-1" outlined class="pa-2">
              <v-card-title class="text-subtitle-2 font-weight-medium pa-0 pb-2">
                <v-icon left small color="primary">mdi-map-marker</v-icon>
                Ubicación GPS
              </v-card-title>
              <LifeGroupMapPicker
                :latitude.sync="item.latitude"
                :longitude.sync="item.longitude"
              />
            </v-card>
          </v-col>

          <!-- Líderes adicionales -->
          <v-col cols="12">
            <v-card id="card-lifeg-dialo-2" outlined class="pa-2">
              <v-card-title class="text-subtitle-2 font-weight-medium pa-0 pb-2">
                <v-icon left small color="primary">mdi-account-multiple</v-icon>
                Líderes adicionales
              </v-card-title>
              <v-card-text class="pa-0 pt-2">
                <UserCombobox :users="item.leaders" label="Seleccionar líderes" @modelChange="onLeadersChange" />
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Observaciones -->
          <v-col cols="12">
            <v-textarea v-model="item.observations" label="Observaciones" outlined dense rows="2"
              hide-details="auto" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" id="btn-lifegroup-dialog-cancel" @click="close">Cancelar</v-btn>
        <v-btn color="primary" id="btn-lifegroup-dialog-save" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import LifeGroupMapPicker from "./MapPicker.vue"
import UserCombobox from "@/components/User/Combobox.vue"

export default {
  name: "LifeGroupDialog",
  components: { LifeGroupMapPicker, UserCombobox },

  props: {
    lifeGroup: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      item: {},
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

  computed: {
    iconTitle() {
      return this.item.id ? "mdi-pencil" : "mdi-plus-circle-outline"
    },
    formTitle() {
      return this.item.id ? "Editar Red de Vida" : "Nueva Red de Vida"
    },
  },

  mounted() {
    if (this.lifeGroup && Object.keys(this.lifeGroup).length > 0) {
      this.item = { ...this.lifeGroup }
      this.item.leader_ids = (this.lifeGroup.leaders || []).map((l) => l.id)
    } else {
      this.item = { status: "active", leader_ids: [] }
    }
  },

  methods: {
    close() {
      this.$emit("close")
    },
    onLeadersChange(users) {
      this.item.leader_ids = users.map((u) => u.id)
      this.item.leaders = users
    },
    save() {
      this.$emit("save", this.item)
    },
  },
}
</script>
