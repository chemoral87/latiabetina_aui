<template>
  <v-dialog :value="true" persistent max-width="450px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="warning">mdi-alert</v-icon>
        {{ title }}
        <v-spacer />
        <v-btn icon x-small @click="$emit('cancel')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="text-body-1 py-4">
        {{ message }}
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" @click="$emit('cancel')">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="error" outlined class="mr-2" @click="$emit('no')">
          <v-icon left>mdi-close</v-icon>
          No guardar
        </v-btn>
        <v-btn color="primary" @click="$emit('yes')">
          <v-icon left>mdi-content-save</v-icon>
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
