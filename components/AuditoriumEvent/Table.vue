<template>
  <v-data-table
    fixed-header
    :page.sync="page"
    dense
    mobile-breakpoint="0"
    :must-sort="true"
    :headers="headers"
    :items="items"
    :options.sync="optionsTable"
    :server-items-length="total"
    class="elevation-1 xwidth800"
    @page-count="pageCount = $event"
  >
    <template #[`item.event_date`]="{ item }">
      {{ item.event_date | moment("DD MMM YYYY") }}
    </template>

    <template #[`item.marks`]="{ item }">
      <v-btn title="Marcar" outlined class="mr-1 my-1" color="primary" fab small @click="$emit('mark', item)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>

    <template #[`item.actions`]="{ item }">
      <v-btn title="Editar" outlined class="mr-1 my-1" color="primary" fab small @click="$emit('edit', item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn title="Eliminar" outlined color="error" class="my-1" fab small @click="$emit('delete', item)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "AuditoriumEventTable",
  props: ["response", "options"],
  data() {
    return {
      optionsTable: {},
      headers: [
        { text: "", value: "marks", sortable: false },

        { text: "Fecha del Evento", align: "start", value: "event_date" },
        { text: "Auditorio", align: "start", value: "auditorium_name" },
        { text: "Organización", align: "start", value: "org_name" },
        { text: "Acciones", value: "actions", sortable: false },
      ],
      page: 1,
      pageCount: 1,
    }
  },
  computed: {
    total() {
      if (this.response) return this.response.total || (this.response.data ? this.response.data.length : 0)
      else return 0
    },
    items() {
      if (this.response && this.response.data && Array.isArray(this.response.data)) {
        // Map data to include auditorium and organization names
        return this.response.data.map((event) => ({
          ...event,
          auditorium_name: event.auditorium_name || (event.auditorium_id && event.auditorium_id.name ? event.auditorium_id.name : ""),
          org_name: event.org_name || (event.org_id && event.org_id.name ? event.org_id.name : ""),
        }))
      } else return []
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
}
</script>
