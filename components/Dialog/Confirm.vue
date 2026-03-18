<template>
  <v-dialog :value="true" persistent max-width="450px">
    <v-card>
      <v-card-title class="headline">
        <v-icon left color="warning">mdi-alert</v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text class="text-body-1 py-4">
        {{ message }}
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn text color="grey darken-1" @click="$emit('cancel')">
          Cancelar
        </v-btn>
        <v-btn text color="error" @click="$emit('no')">
          No guardar
        </v-btn>
        <v-btn color="primary" depressed @click="$emit('yes')">
          <v-icon left small>mdi-content-save</v-icon>
          Guardar y salir
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'DialogConfirm',
  props: {
    title: {
      type: String,
      default: 'Confirmación',
    },
    message: {
      type: String,
      default: '¿Desea guardar los cambios?',
    },
  },
};
</script>
