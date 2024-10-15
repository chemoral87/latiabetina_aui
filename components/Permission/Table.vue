<template>
  <div>
    <v-data-table dense mobile-breakpoint="0" :must-sort="true" :headers="headers" :items="items" :options.sync="optionsTable" :server-items-length="total" class="elevation-1">
      <template #[`item.actions`]="{ item }">
        <v-btn color="primary" fab small outlined class="mr-1 my-1" @click="editItem(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" fab small outlined class="my-1" @click="deleteItem(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  name: "PermissionTable",
  props: ["response", "options"],
  data() {
    return {
      optionsTable: {},
      headers: [
        { text: "Nombre", value: "name" },
        { text: "Acciones", value: "actions", sortable: false },
      ],
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
    me.optionsTable = me.options
    me.$nextTick(() => {
      me.options_watch = me.$watch(
        "optionsTable",
        function () {
          me.$emit("sorting", me.optionsTable)
        },
        {
          immediate: false,
        }
      )
    })
  },
  methods: {
    editItem(item) {
      this.$emit("edit", item)
    },
    deleteItem(item) {
      this.$emit("delete", item)
    },
  },
}
</script>
