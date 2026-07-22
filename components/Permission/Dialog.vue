<template>
  <v-dialog :value="true" persistent max-width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">mdi-key-variant</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="save">
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="item.name" label="Nombre *" dense :rules="[$vrules.requiredField('name')]" :error-messages="errors?.name" @keyup.enter="save" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "PermissionDialog",
  props: ["value", "permission"],
  data() {
    return {
      item: {},
    }
  },
  computed: {
    formTitle() {
      if (this.item.id) {
        return "Editar Permiso"
      } else {
        return "Nuevo Permiso"
      }
    },
  },
  mounted() {
    if (this.permission) {
      this.item = this.permission
    }
  },
  methods: {
    close() {
      this.$emit("close")
    },
    save() {
      if (!this.$refs.form.validate()) return
      this.$emit("save", this.item)
    },
  },
}
</script>
