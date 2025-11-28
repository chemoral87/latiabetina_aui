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
            <v-select v-model="item.org_id" :items="orgs" item-text="name" item-value="id" label="Organización" :disabled="!!item.id" return-object="false" required />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="item.name" label="Nombre" @keyup.enter="save"></v-text-field>
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
  name: "AuditoriumDialog",
  props: ["value", "auditorium", "orgs"],
  data() {
    return {
      item: {},
    }
  },
  computed: {
    iconTitle() {
      return this.item.id ? "mdi-pencil" : "mdi-plus"
    },
    formTitle() {
      return this.item.id ? "Editar Auditorio" : "Nuevo Auditorio"
    },
  },
  mounted() {
    if (this.auditorium) {
      this.item = { ...this.auditorium }
    }
    if (!this.item.org_id && this.orgs && this.orgs.length > 0) {
      this.item.org_id = this.orgs[0].id
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
