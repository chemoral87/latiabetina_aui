<template>
  <v-data-table
    :headers="headers"
    :items="members"
    :loading="loading"
    dense
    mobile-breakpoint="0"
    class="elevation-1"
  >
    <template #[`item.actions`]="{ item }">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn outlined color="primary" fab class="mr-1" x-small v-bind="attrs" v-on="on" @click="$emit('edit', item)">
            <v-icon small>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <span>Editar</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn x-small outlined color="error" fab v-bind="attrs" v-on="on" @click="$emit('delete', item)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <span>Eliminar</span>
      </v-tooltip>
    </template>

    <template #no-data>
      <div class="text-center pa-4">
        <v-icon color="grey lighten-1">mdi-account-group</v-icon>
        <span class="text-body-1 grey--text ml-1">No hay miembros registrados</span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'ConsolidationMemberTable',

  props: {
    members: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      headers: [
        { text: 'Nombre', value: 'name' },
        { text: 'Apellido Paterno', value: 'last_name' },
        { text: 'Apellido Materno', value: 'second_last_name' },
        { text: 'Edad', value: 'years_old' },
        { text: 'Hijos', value: 'number_of_children' },
        { text: 'Celular', value: 'cellphone' },
        { text: 'Dirección', value: 'address' },
        { text: 'Estado Civil', value: 'marriage_status' },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center', width: '100px' },
      ],
    };
  },
};
</script>
