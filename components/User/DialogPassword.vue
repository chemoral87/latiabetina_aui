<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <v-btn icon @click.native="close()"><v-icon>$delete</v-icon></v-btn>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="item.password" label="Contraseña" type="password" hide-details @keyup.enter="save"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="item.confirm_password" label="Confirme Contraseña" :error-messages="error.confirm_password" type="password" @keyup.enter="save"></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" class="mr-1" outlined @click.native="close">Cancelar</v-btn>
        <v-btn color="primary" @click.native="save">Guardar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "userx"],
  data() {
    return {
      item: {},
      error: {},
    }
  },
  computed: {
    iconTitle() {
      return "mdi-account-plus"
    },
    formTitle() {
      return "Cambiar Contraseña"
    },
  },
  mounted() {},
  methods: {
    close() {
      this.$emit("close")
    },
    save() {
      this.error = {}

      if (this.item.password !== this.item.confirm_password) {
        this.error.confirm_password = "No coinciden las contraseñas"
        return
      }
      if (this.item.confirm_password.length < 8) {
        this.error.confirm_password = "Mínimo debe ser de 8 caracteres"
        return
      }
      this.$emit("save", this.item)
    },
  },
}
</script>
