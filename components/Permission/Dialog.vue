<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer />
        <v-icon @click.native="close">$delete</v-icon>
      </v-card-title>

      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <v-text-field v-model="item.name" label="Nombre" :error-messages="errors?.name" @keyup.enter="save"></v-text-field>
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
  name: "PermissionDialog",
  props: ["value", "permission"],
  data() {
    return {
      item: {},
    }
  },
  computed: {
    iconTitle() {
      if (this.item.id) {
        return "mdi-pencil"
      } else {
        return "mdi-plus"
      }
    },
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
      this.$emit("save", this.item)
    },
  },
}
</script>
