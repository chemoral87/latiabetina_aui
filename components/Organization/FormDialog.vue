<template>
  <v-dialog id="dlg-organ-formd-1" :value="true" persistent width="400px">
    <v-card>
      <v-card-title class="text-subtitle-1 font-weight-medium pb-2 d-flex align-center">
        <v-icon left small color="primary">{{ iconTitle }}</v-icon>
        {{ formTitle }}
        <v-spacer />
        <v-btn icon x-small id="btn-organization-dialog-close" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field id="tf-organ-formd-item-name-1"
              v-model="item.name"
              label="Nombre"
              :error-messages="errors?.name"
              :rules="[$vrules.required]"
              @keyup.enter="save"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field id="tf-organ-formd-item-short_code-2"
              v-model="item.short_code"
              label="Código"
              :error-messages="errors?.short_code"
              :rules="[$vrules.required]"
              @keyup.enter="save"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field id="tf-organ-formd-item-description-3"
              v-model="item.description"
              label="Descripción"
              :error-messages="errors?.description"
              @keyup.enter="save"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" outlined class="mr-2" id="btn-organization-dialog-cancel" @click="close">
          <v-icon left>mdi-close</v-icon>
          Cancelar
        </v-btn>
        <v-btn color="primary" id="btn-organization-dialog-save" @click="save">
          <v-icon left>mdi-content-save</v-icon>
          Guardar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "organization"],
  data() {
    return {
      item: {}
    };
  },
  computed: {
    iconTitle() {
      return "mdi-domain";
    },
    formTitle() {
      if (this.item.id) {
        return "Editar Organización";
      } else {
        return "Nueva Organización";
      }
    }
  },
  mounted() {
    if (this.organization) {
      this.item = this.organization;
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    save() {
      this.$emit("save", Object.assign({}, this.item));
    }
  }
};
</script>
