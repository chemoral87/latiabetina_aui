<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="3">
        <v-text-field v-model="filterTerm" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro" />
      </v-col>
      <v-col cols="12" md="4">
        <v-btn color="primary" class="mr-1" @click="newSheet()">
          <v-icon>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="fetchData()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>
      <v-col cols="12">
        <ConsolidationTable
          :response="response"
          :options="options"
          :loading="loading"
          @sorting="handleSorting"
          @view="viewSheet"
          @edit="editSheet"
          @delete="deleteSheet"
        />
      </v-col>
    </v-row>

    <ConsolidationDialog v-if="dialog" :sheet="sheet" :loading="saving" @close="closeDialog" @save="saveSheet" />
    <DialogDelete v-if="dialogDelete" :dialog="deleteData" :loading="deleting" @ok="confirmDelete"
      @close="dialogDelete = false" />
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  data() {
    return {
      filterTerm: "",
      loading: false,
      saving: false,
      deleting: false,
      dialog: false,
      dialogDelete: false,
      sheet: {},
      deleteData: {},
      response: { data: [], total: 0 },
      options: {
        page: 1,
        sortBy: ["id"],
        sortDesc: [false],
        itemsPerPage: 10,
      },
    };
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt;
    eventBus.$emit("setNavBar", { title: "Consolidación", icon: "mdi-clipboard-list" });
    this.fetchData();
  },
  methods: {
    newSheet() {
      this.sheet = {};
      this.dialog = true;
    },
    viewSheet(item) {
      this.$router.push(`/consolidation/${item.id}/details`);
    },
    editSheet(item) {
      this.sheet = { ...item };
      this.dialog = true;
    },
    deleteSheet(item) {
      this.deleteData = {
        text: "¿Desea eliminar el Consolidado con folio ",
        strong: item.folio_number,
        text2: "?",
        payload: item,
      };
      this.dialogDelete = true;
    },
    async confirmDelete(item) {
      try {
        this.deleting = true;
        await this.$repository.ConsoSheet.delete(item.id, item);
        this.fetchData();
        this.dialogDelete = false;
        this.$notify({ type: "success", text: "Consolidado eliminado exitosamente" });
      } catch(error) {
        this.$notify({ type: "error", text: error.response?.data?.message || "Error al eliminar consolidado" });
      } finally {
        this.deleting = false;
      }
    },
    async saveSheet(item) {
      try {
        this.saving = true;
        const isUpdate = Boolean(item.id);

        if(isUpdate) {
          await this.$repository.ConsoSheet.update(item.id, item);
        } else {
          await this.$repository.ConsoSheet.create(item);
        }

        this.$notify({ type: "success", text: `Consolidado ${isUpdate ? "actualizado" : "creado"} exitosamente` });
        this.fetchData();
        this.dialog = false;
      } catch(error) {
        this.$notify({ type: "error", text: error.response?.data?.message || `Error al ${item.id ? "actualizar" : "crear"} consolidado` });
      } finally {
        this.saving = false;
      }
    },
    closeDialog() {
      this.dialog = false;
      this.sheet = {};
    },
    async handleSorting(options) {
      if (options) {
        this.options = options;
      }
      await this.fetchData();
    },
    async fetchData() {
      this.loading = true;
      try {
        const queryParams = { 
          filter: this.filterTerm,
          ...this.options
        };
        const responseData = await this.$repository.ConsoSheet.index(queryParams);
        
        // Handle pagination response vs array format
        if (responseData && responseData.data) {
          this.response = responseData;
        } else {
          this.response = { data: responseData || [], total: (responseData || []).length };
        }
      } catch(error) {
        this.response = { data: [], total: 0 };
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
