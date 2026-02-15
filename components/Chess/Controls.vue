<template>
  <v-card outlined class="controls-panel pa-3">
    <div class="controls-header text-subtitle-2 font-weight-medium mb-3">
      Controles
    </div>

    <div class="d-flex flex-column ga-2">
      <v-btn
        block
        outlined
        color="grey darken-2"
        :disabled="isRotated === false"
        @click="$emit('rotate-to-white')"
      >
        <v-icon left small>mdi-chess-king</v-icon>
        Ver Blancas
      </v-btn>
      
      <v-btn
        block
        outlined
        color="grey darken-2"
        :disabled="isRotated === true"
        @click="$emit('rotate-to-black')"
      >
        <v-icon left small>mdi-chess-king</v-icon>
        Ver Negras
      </v-btn>
      
      <v-divider class="my-2"></v-divider>
      
      <v-btn
        block
        color="success"
        @click="$emit('reset-board')"
      >
        <v-icon left small>mdi-refresh</v-icon>
        Nueva Partida
      </v-btn>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'ChessControls',
  props: {
    isRotated: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.v-btn {
  text-transform: none !important;
  font-weight: 500;
  letter-spacing: 0.25px;
}

.controls-panel {
  background: white !important;
  border-radius: 8px !important;
}

.controls-header {
  color: #424242;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}
</style>
