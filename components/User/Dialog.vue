<template>
  <v-dialog id="dlg-user-dialo-1" :value="true" persistent width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">{{ iconTitle }}</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small id="btn-user-dialog-close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field id="tf-user-dialo-item-name-1" v-model="item.name" label="Nombre" :error-messages="errors?.name" @keyup.enter="save"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field id="tf-user-dialo-item-last_name-2" v-model="item.last_name" label="Ap. Paterno" :error-messages="errors?.last_name" @keyup.enter="save"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field id="tf-user-dialo-item-second_last_name-3" v-model="item.second_last_name" label="Ap. materno" :error-messages="errors?.second_last_name" @keyup.enter="save"></v-text-field>
          </v-col>
          <v-col v-if="!item.id" cols="12">
            <v-text-field id="tf-user-dialo-item-email-4" v-model="item.email" label="E-mail" :error-messages="errors?.email" @keyup.enter="save" />
          </v-col>
          <v-col cols="12">
            <v-text-field id="tf-user-dialo-item-cellphone-5" v-model="item.cellphone" label="Celular" :error-messages="errors?.cellphone" @keyup.enter="save" />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" id="btn-user-dialog-cancel" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" id="btn-user-dialog-save" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "UserDialog",
  props: ["value", "userx"],
  data() {
    return {
      item: {},
    }
  },
  computed: {
    iconTitle() {
      return "mdi-account"
    },
    formTitle() {
      if (this.item.id) {
        return "Editar Usuario"
      } else {
        return "Nuevo Usuario"
      }
    },
  },
  mounted() {
    if (this.userx) {
      this.item = this.userx
    }
  },
  methods: {
    close() {
      this.$emit("close")
    },
    save() {
      this.$emit("save", this.item)
    },
  },
}
</script>
