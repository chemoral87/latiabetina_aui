<template>
  <div v-if="quantity === 0" class="pos-ctrl-empty">
    <v-btn fab small depressed color="primary" class="pos-ctrl-fab" @click="$emit('add')">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
  <div v-else class="pos-ctrl-filled">
    <v-btn fab x-small outlined color="error" class="pos-ctrl-delete mr-2" @click="$emit('remove')">
      <v-icon small>mdi-delete</v-icon>
    </v-btn>
    <v-btn fab small depressed color="error" class="pos-ctrl-btn" @click="$emit('decrease')">
      <v-icon>mdi-minus</v-icon>
    </v-btn>
    <span class="pos-ctrl-qty">{{ quantity }}</span>
    <v-btn fab small depressed color="success" class="pos-ctrl-btn" @click="$emit('add')">
      <v-icon>mdi-plus</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'PosProductControls',
  props: {
    quantity: { type: Number, required: true },
  },
}
</script>

<style scoped>
.pos-ctrl-empty {
  display: flex;
  justify-content: flex-end;
}

.pos-ctrl-filled {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.pos-ctrl-fab {
  width: 38px !important;
  height: 38px !important;
}

.pos-ctrl-btn {
  width: 38px !important;
  height: 38px !important;
}

.pos-ctrl-qty {
  font-size: 1.4rem;
  font-weight: 900;
  min-width: 28px;
  text-align: center;
  color: #212121;
}

.pos-ctrl-delete {
  width: 26px !important;
  height: 26px !important;
}
</style>
