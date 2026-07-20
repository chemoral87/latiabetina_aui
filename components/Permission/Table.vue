<template>

    <v-data-table dense mobile-breakpoint="0" :must-sort="true" :headers="headers" :items="items" :options.sync="optionsTable" :server-items-length="total" class="elevation-1">
      <template #[`item.actions`]="{ item }">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn color="primary" fab x-small outlined class="mr-1 my-1" v-bind="attrs" v-on="on" @click="editItem(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn color="info" fab x-small outlined class="mr-1 my-1" v-bind="attrs" v-on="on" @click="distributePermission(item)">
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <span>Distribuir</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn color="error" fab x-small outlined class="my-1" v-bind="attrs" v-on="on" @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </template>
    </v-data-table>
 
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

    distributePermission(item) {
      this.$emit("distribution", item)
    },
  },
}
</script>
