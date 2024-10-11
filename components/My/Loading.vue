<template>
  <v-layout row justify-center>
    <v-dialog :value.sync="value" persistent content content-class="centered-dialog">
      <v-container fill-height>
        <v-layout column justify-center align-center>
          <v-progress-circular indeterminate :size="70" :width="7" :color="progressColor"></v-progress-circular>
          <br />
          <span v-if="message != null" class="text-h5">{{ message }}</span>
        </v-layout>
      </v-container>
    </v-dialog>
  </v-layout>
</template>

<script>
export default {
  name: "MyLoading",
  props: {
    value: { type: Boolean, default: false },
    message: { type: String, default: "Espere..." },
    progressColor: { type: String, default: "white" },
  },
  data: function () {
    return {}
  },
}
</script>

<style>
.dialog.centered-dialog,
.v-dialog.centered-dialog {
  background: #282c2dad;
  box-shadow: none;
  border-radius: 6px;
  width: auto;
  color: whitesmoke;
}
</style>
