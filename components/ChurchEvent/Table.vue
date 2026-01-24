<template>
  <v-data-table :headers="headers" :items="items" :options.sync="optionsTable" dense :server-items-length="total" :loading="loading" :must-sort="true" mobile-breakpoint="0" class="elevation-1 xwidth800">
    <!-- Columna de acciones -->
    <template #[`item.actions`]="{ item }">
      <div class="d-flex flex-nowrap justify-center">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn outlined color="primary" fab x-small class="mr-1" v-bind="attrs" v-on="on" @click="editChurchEvent(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn outlined color="error" fab x-small v-bind="attrs" v-on="on" @click="deleteChurchEvent(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </div>
    </template>

    <!-- Estado vacío -->
    <template #no-data>
      <div class="text-center pa-4">
        <v-icon color="grey lighten-1">mdi-church</v-icon>
        <span class="text-body-1 grey--text">No se encontraron eventos de iglesia</span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "ChurchEventTable",

  props: {
    response: {
      type: Object,
      default: () => ({ data: [], total: 0 }),
    },
    options: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      optionsTable: {},
      headers: [
        {
          text: "Nombre",
          align: "start",
          value: "name",
        },
        {
          text: "Ubicación",
          value: "location",
          sortable: false,
        },
        {
          text: "Fecha Inicio",
          value: "start_date",
        },
        {
          text: "Fecha Fin",
          value: "end_date",
        },
        {
          text: "Acciones",
          value: "actions",
          sortable: false,
          align: "center",
          width: "150px",
        },
      ],
      isFirstWatch: true,
    }
  },

  computed: {
    total() {
      return this.response && this.response.total ? this.response.total : 0
    },

    items() {
      return this.response && this.response.data ? this.response.data : []
    },
  },

  watch: {
    options: {
      handler(newOptions) {
        if (newOptions) {
          this.optionsTable = Object.assign({}, newOptions)
        }
      },
      immediate: true,
      deep: true,
    },

    optionsTable: {
      handler(newValue, oldValue) {
        // Evitar el primer watch (cuando se inicializa)
        if (this.isFirstWatch) {
          this.isFirstWatch = false
          return
        }

        // Solo emitir si realmente cambió algo relevante
        if (this.hasOptionsChanged(newValue, oldValue)) {
          this.$emit("sorting", newValue)
        }
      },
      deep: true,
    },
  },

  methods: {
    hasOptionsChanged(newVal, oldVal) {
      if (!oldVal) return true

      // Comparar solo las propiedades relevantes
      const relevantProps = ["page", "itemsPerPage", "sortBy", "sortDesc"]

      return relevantProps.some((prop) => {
        if (Array.isArray(newVal[prop]) && Array.isArray(oldVal[prop])) {
          return JSON.stringify(newVal[prop]) !== JSON.stringify(oldVal[prop])
        }
        return newVal[prop] !== oldVal[prop]
      })
    },

    editChurchEvent(item) {
      this.$emit("edit", item)
    },

    deleteChurchEvent(item) {
      this.$emit("delete", item)
    },
  },
}
</script>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
