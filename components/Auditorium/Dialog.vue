<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        {{ item.org_id }}
        <v-spacer></v-spacer>
        <v-icon @click.native="close">$delete</v-icon>
      </v-card-title>
      <v-card-text>
        <v-row dense>
          <v-col cols="12">
            <template v-if="item.id">
              <v-text-field :value="getOrgName()" label="Organización" disabled></v-text-field>
            </template>
            <template v-else>
              <organization-select v-model="item.org_id" :permission="'auditorium-index'" outlined :rules="[$vrules.required]" />
            </template>
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
    getOrgName() {
      if (!this.item.org_id) return ""
      if (typeof this.item.org_id === "object" && this.item.org_id.name) return this.item.org_id.name
      if (this.orgs && Array.isArray(this.orgs)) {
        const found = this.orgs.find((o) => o.id === this.item.org_id)
        return found ? found.name : this.item.org_id
      }
      return this.item.org_id
    },
    close() {
      this.$emit("close")
    },
    save() {
      this.$emit("save", this.item)
    },
  },
}
</script>
