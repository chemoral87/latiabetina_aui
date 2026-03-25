<template>
  <v-data-table :headers="headers" :items="items" :options.sync="optionsTable" :server-items-length="total"
    :loading="loading" dense mobile-breakpoint="0" :must-sort="true" class="elevation-1">

    <template #[`item.actions`]="{ item }">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="success" fab class="mr-1" v-bind="attrs" x-small v-on="on" @click="viewSheet(item)">
            <v-icon small>mdi-clipboard-list</v-icon>
          </v-btn>
        </template>
        <span>Detalles</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="primary" fab class="mr-1" x-small v-bind="attrs" v-on="on" @click="editSheet(item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Editar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn x-small outlined color="error" fab v-bind="attrs" v-on="on" @click="deleteSheet(item)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Eliminar</span>
      </v-tooltip>
    </template>
    
    <template #[`item.creator`]="{ item }">
      {{ item.creator ? item.creator.name : 'N/A' }}
    </template>

    <template #[`item.organization`]="{ item }">
      {{ item.organization ? item.organization.name : 'N/A' }}
    </template>

    <template #no-data>
      <div class="text-center pa-4">
        <v-icon color="grey lighten-1">mdi-clipboard-list</v-icon>
        <span class="text-body-1 grey--text">No se encontraron consolidados</span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: "ConsolidationTable",

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
        { text: "Folio", value: "folio_number" },
        { text: "Fecha", value: "date" },
        { text: "Organización", value: "organization" },
        { text: "Creado por", value: "creator" },
        { text: "Acciones", value: "actions", sortable: false, align: "center", width: "200px" },
      ],
      isFirstWatch: true,
    };
  },

  computed: {
    total() {
      return this.response && this.response.total ? this.response.total : 0;
    },
    items() {
      // Sometimes APIs return the array directly or paginated in `data`
      if(Array.isArray(this.response)) {
        return this.response;
      }
      return this.response && this.response.data ? this.response.data : [];
    },
  },

  watch: {
    options: {
      handler(newOptions) {
        if(newOptions) {
          this.optionsTable = Object.assign({}, newOptions);
        }
      },
      immediate: true,
      deep: true,
    },

    optionsTable: {
      handler(newValue, oldValue) {
        if(this.isFirstWatch) {
          this.isFirstWatch = false;
          return;
        }

        if(this.hasOptionsChanged(newValue, oldValue)) {
          this.$emit("sorting", newValue);
        }
      },
      deep: true,
    },
  },

  methods: {
    hasOptionsChanged(newVal, oldVal) {
      if(!oldVal) return true;
      const relevantProps = ["page", "itemsPerPage", "sortBy", "sortDesc"];
      return relevantProps.some((prop) => {
        if(Array.isArray(newVal[prop]) && Array.isArray(oldVal[prop])) {
          return JSON.stringify(newVal[prop]) !== JSON.stringify(oldVal[prop]);
        }
        return newVal[prop] !== oldVal[prop];
      });
    },

    viewSheet(item) {
      this.$emit("view", item);
    },

    editSheet(item) {
      this.$emit("edit", item);
    },

    deleteSheet(item) {
      this.$emit("delete", item);
    },
  },
};
</script>
