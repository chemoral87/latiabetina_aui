<template>
  <v-dialog :value="true" persistent max-width="600px">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer />
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field v-model="item.name" label="Nombre" :disabled="loading" required autofocus />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="item.last_name" label="Apellido Paterno" :disabled="loading" required />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="item.second_last_name" label="Apellido Materno" :disabled="loading" />
            </v-col>
            <v-col cols="12" md="3" lg="2">
              <v-text-field v-model="item.years_old" label="Edad" type="number" min="0" :disabled="loading" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field v-model="item.number_of_children" label="Núm. Hijos" type="number" min="0"
                :disabled="loading" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="item.cellphone" label="Celular" :disabled="loading" />
            </v-col>
            <v-col cols="12" md="5">
              <v-select v-model="item.marriage_status" :items="marriageStatuses" label="Estado Civil"
                :disabled="loading" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="item.address" label="Dirección" :disabled="loading" @keyup.enter="save" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text :disabled="loading" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="loading" :disabled="!isValid" @click="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConsolidationMemberDialog',

  props: {
    member: {
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
      item: {
        conso_sheet_id: null,
        name: '',
        last_name: '',
        second_last_name: '',
        years_old: null,
        number_of_children: null,
        cellphone: '',
        address: '',
        marriage_status: '',
      },
      marriageStatuses: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre'],
    };
  },

  computed: {
    isEditMode() {
      return !!this.item.id;
    },
    iconTitle() {
      return this.isEditMode ? 'mdi-pencil' : 'mdi-plus';
    },
    formTitle() {
      return this.isEditMode ? 'Editar Miembro' : 'Nuevo Miembro';
    },
    isValid() {
      return !!(this.item.name && this.item.last_name);
    },
  },

  watch: {
    member: {
      handler(newValue) {
        if(newValue && Object.keys(newValue).length > 0) {
          this.item = Object.assign({}, newValue);
        }
      },
      immediate: true,
      deep: true,
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },
    save() {
      if(!this.isValid || this.loading) return;
      this.$emit('save', Object.assign({}, this.item));
    },
  },
};
</script>
