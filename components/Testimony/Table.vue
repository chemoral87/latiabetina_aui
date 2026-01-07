<template>
  <v-card>
    <v-data-table
      dense
      :headers="headers"
      :items="localItems"
      :options.sync="optionsTable"
      :server-items-length="total"
      :loading="loading"
      mobile-breakpoint="0"
      :items-per-page="optionsTable.itemsPerPage"
      :must-sort="true"
      class="elevation-1 xwidth800"
    >
      <template #[`item.review`]="{ item }">
        <v-btn outlined color="primary" fab x-small class="my-1" @click="show(item)">
          <v-icon small>mdi-eye</v-icon>
        </v-btn>
      </template>
      <template #[`item.actions`]="{ item }">
        <div class="d-flex flex-nowrap justify-center">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn outlined color="primary" fab x-small class="mr-1" v-bind="attrs" v-on="on" @click="edit(item)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Editar</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn outlined color="error" fab x-small v-bind="attrs" v-on="on" @click="remove(item)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Eliminar</span>
          </v-tooltip>
        </div>
      </template>
      <template #no-data>
        <v-card-text>No hay datos</v-card-text>
      </template>
      <!-- Fecha formatted -->
      <template #[`item.created_at`]="{ item }">
        <span>{{ $moment(item.created_at).format("DD MMM YYYY HH:mm").toUpperCase() }}</span>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "TestimonyTable",
  props: {
    options: { type: Object, required: true },
    response: { type: Object, required: true },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      optionsTable: {},
      headers: [
        // { text: "ID", value: "id" },
        { text: "", value: "review", sortable: false },
        { text: "Nombre", value: "name" },
        // { text: "Teléfono", value: "phone_number" },
        { text: "Categorías", value: "categories" },
        { text: "Fecha", value: "created_at" },
        { text: "Acciones", value: "actions", sortable: false },
      ],
      isFirstWatch: true,
      localItems: [],
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
        if (this.isFirstWatch) {
          this.isFirstWatch = false
          return
        }

        if (this.hasOptionsChanged(newValue, oldValue)) {
          this.$emit("sorting", newValue)
        }
      },
      deep: true,
    },
    // keep localItems in sync with incoming prop
    response: {
      handler(newVal) {
        this.localItems = newVal && newVal.data ? (Array.isArray(newVal.data) ? [...newVal.data] : []) : []
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    hasOptionsChanged(newVal, oldVal) {
      if (!oldVal) return true

      const relevantProps = ["page", "itemsPerPage", "sortBy", "sortDesc"]

      return relevantProps.some((prop) => {
        if (Array.isArray(newVal[prop]) && Array.isArray(oldVal[prop])) {
          return JSON.stringify(newVal[prop]) !== JSON.stringify(oldVal[prop])
        }
        return newVal[prop] !== oldVal[prop]
      })
    },

    edit(item) {
      this.$emit("edit", item)
    },

    show(item) {
      this.$emit("show", item)
    },

    remove(item) {
      this.$emit("delete", item)
    },

    // allow parent to update/insert a single row by id
    updateRow(item) {
      if (!item) return
      const id = item.id
      const idx = this.localItems.findIndex((d) => d.id === id)
      if (idx !== -1) {
        this.$set(this.localItems, idx, item)
      } else {
        this.localItems.unshift(item)
      }
    },
  },
}
</script>

<style scoped></style>
