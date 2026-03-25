<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" v-if="sheet.id">
        <v-card outlined class="mb-3">
          <v-card-title class="subtitle-1 font-weight-bold">
            <v-icon left>mdi-clipboard-list</v-icon>
            Consolidado #{{ sheet.folio_number }}
            <v-spacer />
            <v-btn color="primary" small :loading="savingSheet" :disabled="!isDirty || savingSheet" @click="saveSheet">
              <v-icon left small>mdi-content-save</v-icon>
              Guardar
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row dense align="center">
              <v-col cols="12" md="2">
                <div class="d-flex align-center">
                  <v-icon small class="mr-1">mdi-calendar</v-icon>
                  <span class="caption font-weight-bold grey--text text--darken-2 text-truncate">
                    Fecha: {{ sheet.date | moment('DD-MMM-YYYY') | uppercase }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="2">
                <div class="d-flex align-center">
                  <v-icon small class="mr-1">mdi-office-building</v-icon>
                  <span class="caption font-weight-bold grey--text text--darken-2 text-truncate">
                    Org: {{ sheet.organization ? sheet.organization.name : 'N/A' }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="2">
                <div class="d-flex align-center">
                  <v-icon small class="mr-1">mdi-account-plus</v-icon>
                  <span class="caption font-weight-bold grey--text text--darken-2 text-truncate">
                    Creador: {{ sheet.creator ? sheet.creator.name : 'N/A' }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field v-model="sheet.how_did_you_hear" label="¿Cómo se enteró?" dense hide-details
                  outlined prepend-inner-icon="mdi-bullhorn" :disabled="savingSheet" />
              </v-col>
              <v-col cols="12" md="2">
                <v-autocomplete v-model="sheet.consolidator_id" :items="users" item-value="id" item-text="name" outlined
                  label="Consolidador" clearable dense hide-details prepend-inner-icon="mdi-account-tie"
                  :disabled="savingSheet" />
              </v-col>
              <v-col cols="12" md="2">
                <v-select v-model="sheet.first_time_christian_church"
                  :items="[{ text: 'SI', value: true }, { text: 'NO', value: false }]"
                  label="¿Primera vez en iglesia cristiana?" outlined dense hide-details
                  prepend-inner-icon="mdi-help-circle-outline" :disabled="savingSheet" />
              </v-col>

              <v-col cols="12" class="mt-2">
                <v-divider />
              </v-col>

              <v-col cols="12" md="6" class="mt-1">
                <v-textarea v-model="sheet.comments" label="Comentarios" outlined rows="2" auto-grow dense hide-details
                  prepend-inner-icon="mdi-comment-text-outline" :disabled="savingSheet" />
              </v-col>
              <v-col cols="12" md="6" class="mt-1">
                <v-textarea v-model="sheet.special_request" label="Petición especial" rows="2" auto-grow dense outlined
                  hide-details prepend-inner-icon="mdi-heart-outline" :disabled="savingSheet" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-text-field v-model="filterTerm" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro" />
      </v-col>
      <v-col cols="12" md="4">
        <v-btn color="primary" class="mr-1" @click="newMember()">
          <v-icon>mdi-plus</v-icon>
          Nuevo Miembro
        </v-btn>
        <v-btn color="primary" :loading="loading" @click="fetchMembers()">
          <v-icon>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>

      <v-col cols="12">
        <ConsolidationMemberTable :members="filteredMembers" :loading="loading" @edit="editMember"
          @delete="deleteMemberPrompt" />
      </v-col>
    </v-row>

    <ConsolidationMemberDialog v-if="dialog" :member="member" :loading="saving" @close="closeDialog"
      @save="saveMember" />

    <DialogDelete v-if="dialogDelete" :dialog="deleteData" :loading="deleting" @ok="confirmDelete"
      @close="dialogDelete = false" />

    <DialogConfirm v-if="showConfirmDialog" title="Cambios sin guardar"
      message="Hay cambios sin guardar. ¿Desea guardarlos antes de salir?" @yes="confirmSave" @no="confirmDiscard"
      @cancel="confirmAbort" />
  </v-container>
</template>

<script>
export default {
  middleware: ['authenticated'],

  async asyncData({ $repository, params, error }) {
    try {
      const [sheet, dataMembers] = await Promise.all([
        $repository.ConsoSheet.show(params.id),
        $repository.ChurchMember.index({ conso_sheet_id: params.id }),
      ]);
      const members = Array.isArray(dataMembers) ? dataMembers : dataMembers.data || [];
      return { sheet, originalSheet: JSON.parse(JSON.stringify(sheet)), members };
    } catch(e) {
      error({ statusCode: 404, message: 'No se pudo cargar la información' });
    }
  },

  data() {
    return {
      filterTerm: '',
      loading: false,
      saving: false,
      savingSheet: false,
      deleting: false,
      dialog: false,
      dialogDelete: false,
      sheet: {},
      originalSheet: {},
      member: {},
      deleteData: {},
      members: [],
      users: [],
      showConfirmDialog: false,
      resolveNext: null,
    };
  },

  computed: {
    sheetId() {
      return this.$route.params.id;
    },
    isDirty() {
      return JSON.stringify(this.sheet) !== JSON.stringify(this.originalSheet);
    },
    filteredMembers() {
      if(!this.filterTerm) return this.members;
      const term = this.filterTerm.toLowerCase();
      return this.members.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(term)) ||
          (m.last_name && m.last_name.toLowerCase().includes(term)) ||
          (m.cellphone && m.cellphone.toLowerCase().includes(term))
      );
    },
  },

  beforeRouteLeave(to, from, next) {
    if(this.isDirty) {
      this.showConfirmDialog = true;
      this.resolveNext = next;
    } else {
      next();
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt;
    eventBus.$emit('setNavBar', { title: 'Detalles de Consolidado', icon: 'mdi-clipboard-list', back: '/consolidation' });
    // this.fetchUsers();
  },

  methods: {
    async fetchSheet() {
      try {
        this.sheet = await this.$repository.ConsoSheet.show(this.sheetId);
      } catch(error) {
        this.$notify({ type: 'error', text: 'Error al cargar el consolidado' });
      }
    },

    async fetchUsers() {
      try {
        const data = await this.$repository.User.index({ itemsPerPage: -1 });
        const list = Array.isArray(data) ? data : data.data || [];
        this.users = list.map((u) => ({
          id: u.id,
          name: [u.name, u.last_name].filter(Boolean).join(' '),
        }));
      } catch(e) {
        this.users = [];
      }
    },

    async saveSheet() {
      try {
        this.savingSheet = true;
        await this.$repository.ConsoSheet.update(this.sheetId, this.sheet);
        this.originalSheet = JSON.parse(JSON.stringify(this.sheet));
        this.$notify({ type: 'success', text: 'Consolidado actualizado exitosamente' });
      } catch(error) {
        this.$notify({ type: 'error', text: error.response?.data?.message || 'Error al guardar consolidado' });
      } finally {
        this.savingSheet = false;
      }
    },

    async fetchMembers() {
      try {
        this.loading = true;
        const data = await this.$repository.ChurchMember.index({ conso_sheet_id: this.sheetId });
        this.members = Array.isArray(data) ? data : data.data || [];
      } catch(error) {
        this.$notify({ type: 'error', text: 'Error al cargar los miembros' });
      } finally {
        this.loading = false;
      }
    },

    newMember() {
      this.member = { conso_sheet_id: this.sheetId };
      this.dialog = true;
    },

    editMember(item) {
      this.member = { ...item };
      this.dialog = true;
    },

    deleteMemberPrompt(item) {
      this.deleteData = {
        text: '¿Desea eliminar al miembro ',
        strong: `${item.name} ${item.last_name}`,
        text2: '?',
        payload: item,
      };
      this.dialogDelete = true;
    },

    async confirmDelete(item) {
      try {
        this.deleting = true;
        await this.$repository.ChurchMember.delete(item.id);
        this.fetchMembers();
        this.dialogDelete = false;
        this.$notify({ type: 'success', text: 'Miembro eliminado exitosamente' });
      } catch(error) {
        this.$notify({ type: 'error', text: error.response?.data?.message || 'Error al eliminar miembro' });
      } finally {
        this.deleting = false;
      }
    },

    async saveMember(item) {
      try {
        this.saving = true;
        const isUpdate = Boolean(item.id);
        if(isUpdate) {
          await this.$repository.ChurchMember.update(item.id, item);
        } else {
          await this.$repository.ChurchMember.create(item);
        }
        this.$notify({ type: 'success', text: `Miembro ${isUpdate ? 'actualizado' : 'creado'} exitosamente` });
        this.fetchMembers();
        this.dialog = false;
      } catch(error) {
        this.$notify({ type: 'error', text: error.response?.data?.message || `Error al ${item.id ? 'actualizar' : 'crear'} miembro` });
      } finally {
        this.saving = false;
      }
    },

    closeDialog() {
      this.dialog = false;
      this.member = {};
    },

    async confirmSave() {
      await this.saveSheet();
      this.showConfirmDialog = false;
      if(this.resolveNext) {
        if(!this.isDirty) {
          this.resolveNext();
        } else {
          this.resolveNext(false);
        }
        this.resolveNext = null;
      }
    },

    confirmDiscard() {
      this.showConfirmDialog = false;
      if(this.resolveNext) {
        this.resolveNext();
        this.resolveNext = null;
      }
    },

    confirmAbort() {
      this.showConfirmDialog = false;
      if(this.resolveNext) {
        this.resolveNext(false);
        this.resolveNext = null;
      }
    },
  },
};
</script>
