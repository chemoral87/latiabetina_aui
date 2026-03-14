<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <v-icon @click.native="close">$delete</v-icon>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="item.name"
              label="Nombre"
              :error-messages="errors?.name"
              :rules="[$vrules.required]"
              @keyup.enter="save"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="item.short_code"
              label="Código"
              :error-messages="errors?.short_code"
              :rules="[$vrules.required]"
              @keyup.enter="save"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="item.description"
              label="Descripción"
              :error-messages="errors?.description"
              @keyup.enter="save"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" class="mr-1" outlined @click.native="close"> Cancelar </v-btn>
        <v-btn color="primary" @click.native="save"> Guardar </v-btn>
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
      if (this.item.id) {
        return "mdi-pencil";
      } else {
        return "mdi-plus";
      }
    },
    formTitle() {
      if (this.item.id) {
        return "Editar Organización";
      } else {
        return "Nuevo Organización";
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
      this.$emit("save", this.item);
    }
  }
};
</script>
