<template>
  <div>
    <v-data-table dense mobile-breakpoint="0" :must-sort="true" :headers="headers" :items="items"
      :options.sync="optionsTable" :server-items-length="total" :loading="loading" class="elevation-1">
      <template #[`item.roles`]="{ item }">
        <v-chip v-for="it in item.roles" :key="it.id" class="ma-2" color="primary">
          {{ it.name }}
        </v-chip>
      </template>
      <template #[`item.direct_permissions`]="{ item }">
        <v-chip v-for="it in item.permissions" :key="it.id" class="ma-2" color="info">
          {{ it.name }}
        </v-chip>
      </template>

      <template #[`item.actions`]="{ item }">
        <v-btn title="Editar" class="mr-1" color="primary" outlined fab x-small @click="edit(item)">
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>
        <v-btn title="Perfiles" class="mr-1" color="success" outlined fab x-small @click="editProfiles(item)">
          <v-icon small>mdi-redhat</v-icon>
        </v-btn>
        <!-- <v-btn title="Roles y Permisos" class="ma-1" color="info" outlined fab small @click="editRoles(item)">
          <v-icon> mdi-drama-masks </v-icon>
        </v-btn> -->
        <v-btn title="Eliminar" class="mr-1" color="error" outlined fab x-small @click="deleteItem(item)">
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  name: "UserTable",
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
        { text: "Nombre", align: "start", value: "name" },
        { text: "Ap. Paterno", value: "last_name" },
        { text: "Ap. Materno", value: "second_last_name" },
        { text: "E-Mail", value: "email" },
        { text: "Roles", value: "roles", sortable: false },
        { text: "Permisos Directos", value: "direct_permissions", sortable: false },
        { text: "Acciones", value: "actions", width: "200px", sortable: false },
      ],
    }
  },
  computed: {
    total() {
      if(this.response) return this.response.total
      else return 0
    },
    items() {
      if(this.response) return this.response.data
      else return []
    },
  },
  mounted() {
    const me = this
    this.optionsTable = this.options
    me.$nextTick(() => {
      me.options_watch = me.$watch(
        "optionsTable",
        function() {
          this.$emit("sorting", me.optionsTable)
        },
        {
          immediate: false,
        }
      )
    })
  },
  methods: {
    /* editRoles(item) {
      this.$emit("editRoles", item);
    }, */
    editProfiles(item) {
      this.$emit("editProfiles", item)
    },
    edit(item) {
      this.$emit("edit", item)
    },
    deleteItem(item) {
      this.$emit("delete", item)
    },
  },
}
</script>
