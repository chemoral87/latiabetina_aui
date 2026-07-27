<template>
  <v-data-table id="dt-lifeg-table-items-1"
    fixed-header
    :page.sync="page"
    dense
    mobile-breakpoint="0"
    :must-sort="true"
    :headers="headers"
    :items="items"
    :options.sync="optionsTable"
    :server-items-length="total"
    :loading="loading"
    class="elevation-1"
    @page-count="pageCount = $event"
  >
    <template #[`item.status`]="{ item }">
      <v-chip :color="statusColor(item.status)" small>
        {{ statusLabel(item.status) }}
      </v-chip>
    </template>

    <template #[`item.day_of_week`]="{ item }">
      {{ capitalize(item.day_of_week) }}
    </template>

    <template #[`item.time`]="{ item }">
      {{ item.time }}
    </template>

    <template #[`item.actions`]="{ item }">
      <v-btn title="Editar" outlined class="mr-1 my-1" color="primary" fab small id="btn-lifegroup-table-edit" @click="$emit('edit', item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn title="Sesiones" outlined class="mr-1 my-1" color="success" fab small id="btn-lifegroup-table-sessions" @click="$emit('sessions', item)">
        <v-icon>mdi-calendar</v-icon>
      </v-btn>
      <v-btn title="Eliminar" outlined color="error" class="my-1" fab small id="btn-lifegroup-table-delete" @click="$emit('delete', item)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "LifeGroupTable",

  props: {
    response: {
      type: Object,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
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
        { text: "Nombre", align: "start", value: "name", width: "8rem" },
        { text: "Inicio", align: "start", value: "start_date", width: "6rem" },
        { text: "Día", align: "start", value: "day_of_week", width: "6rem" },
        { text: "Hora", align: "center", value: "time", width: "4rem" },
        { text: "Estado", align: "center", value: "status", width: "6rem" },
        { text: "Acciones", value: "actions", sortable: false, width: "12rem" },
      ],
      page: 1,
      pageCount: 1,
    }
  },

  computed: {
    total() {
      return this.response?.total || (this.response?.data ? this.response.data.length : 0)
    },

    items() {
      return this.response?.data || []
    },
  },

  mounted() {
    this.optionsTable = this.options
    this.$nextTick(() => {
      this.options_watch = this.$watch(
        "optionsTable",
        () => {
          this.$emit("sorting", this.optionsTable)
        },
        { immediate: false }
      )
    })
  },

  methods: {
    statusColor(status) {
      const map = { active: "success", finished: "grey", cancelled: "error" }
      return map[status] || "primary"
    },

    statusLabel(status) {
      const map = { active: "Activa", finished: "Finalizada", cancelled: "Cancelada" }
      return map[status] || status
    },

    capitalize(str) {
      if (!str) return ""
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
  },
}
</script>
