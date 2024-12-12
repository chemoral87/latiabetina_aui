<template>
  <div>
    <v-data-table dense mobile-breakpoint="0" :must-sort="true" :headers="headers" :items="items" :options.sync="optionsTable" :server-items-length="total" class="elevation-1 xwidth1200" @update:sort-by="sortTable">
      <template #[`item.actions`]="{ item }">
        <v-btn title="Editar" class="ma-1" color="primary" outlined fab small @click="emitAction('edit', item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn title="Delete" class="ma-1" color="error" outlined fab small @click="confirmDelete(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteProp"
      @ok="
        (item) => {
          $emit('delete', item)
        }
      "
      @close="$emit('update:dialogDelete', false)"
    ></DialogDelete>
  </div>
</template>
<script>
export default {
  name: "StoreTable",
  props: ["dialogDelete", "response", "options", "tableHeaders"],
  data() {
    return {
      optionsTable: {},
      pageCountRule: 0,
      sortDesc: false,
      headers: [
        { text: "org_id", value: "org_id", sortable: true, firstSortDesc: true },
        { text: "name", value: "name", sortable: true, firstSortDesc: true },
        { text: "address", value: "address", sortable: true, firstSortDesc: true },
        { text: "city", value: "city", sortable: true, firstSortDesc: true },
        { text: "state", value: "state", sortable: true, firstSortDesc: true },
        { text: "zip", value: "zip", sortable: true, firstSortDesc: true },
        { text: "country", value: "country", sortable: true, firstSortDesc: true },
        { text: "phone", value: "phone", sortable: true, firstSortDesc: true },
        { text: "latitude", value: "latitude", sortable: true, firstSortDesc: true },
        { text: "longitude", value: "longitude", sortable: true, firstSortDesc: true },
        { text: "created_by", value: "created_by", sortable: true, firstSortDesc: true },
        { text: "updated_by", value: "updated_by", sortable: true, firstSortDesc: true },
        { text: "Acciones", value: "actions", width: "200px", sortable: false },
      ],
      dialogDeleteProp: {},
    }
  },
  computed: {
    total() {
      if (this.response) return this.response.total
      else return 0
    },
    items() {
      if (this.response) return this.response.data
      else return []
    },
  },
  mounted() {
    const me = this
    this.optionsTable = this.options
    if (this)
      me.$nextTick(() => {
        me.options_watch = me.$watch(
          "optionsTable",
          function () {
            this.$emit("sorting", this.optionsTable)
          },
          {
            immediate: false,
          }
        )
      })
  },
  methods: {
    confirmDelete(item) {
      this.dialogDeleteProp = {
        text: "Desea eliminar store",
        strong: item.name,
        payload: item,
      }
      this.$emit("update:dialogDelete", true)
    },
    sortTable(columnName) {
      const head = this.headers.find((x) => x.value === columnName)
      if (head.firstSortDesc) this.optionsTable.sortDesc[0] = true
    },
    emitAction(action, payload) {
      this.$emit(action, payload)
    },
  },
}
</script>
