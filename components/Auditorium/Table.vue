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
    class="elevation-1"
    @page-count="pageCount = $event"
  >
    <template #[`item.actions`]="{ item }">
      <v-btn title="Editar" outlined class="mr-1 my-1" color="primary" fab small @click="$emit('edit', item)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn title="Editar Auditorio" outlined class="mr-1 my-1" color="success" fab small @click="$emit('layout', item)">
        <v-icon>mdi-seat</v-icon>
      </v-btn>
      <v-btn title="Eliminar" outlined color="error" class="my-1" fab small @click="$emit('delete', item)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>
<script>
export default {
  name: "AuditoriumTable",
  props: ["response", "options"],
  data() {
    return {
      optionsTable: {},
      headers: [
        { text: "Nombre", align: "start", value: "name", width: "7rem" },
        { text: "Acciones", value: "actions", sortable: false, width: "15rem" },
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
      if (this.response) return this.response.data
      else return []
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
  // No extra methods needed, event is emitted directly
}
</script>
