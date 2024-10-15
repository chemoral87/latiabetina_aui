<template>
  <v-dialog :value="true" persistent width="400px">
    <v-card>
      <v-card-title>
        <v-icon class="mr-2">{{ iconTitle }}</v-icon>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <v-icon @click.native="close">$delete</v-icon>
      </v-card-title>
      <v-form ref="formProfile" @submit.prevent="saveProfile">
        <v-card-text>
          <v-row dense>
            <v-col cols="12">
              <v-text-field v-model="filterProfile" append-icon="mdi-magnify" clearable hide-details placeholder="Filtro" />
            </v-col>
            <v-col cols="12">
              <v-select v-model="item.org_id" :items="organizations" item-value="id" item-text="name" label="Organizaciones" outlined :rules="[$vrules.required]"></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" class="mr-1" outlined @click.native="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Guardar</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ProfileDialog",
  props: ["value", "user_id"],
  data() {
    return {
      item: {},
      organizations: [],
      filterProfile: "",
      options: {},
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
        return "Editar Perfil"
      } else {
        return "Nuevo Perfil"
      }
    },
  },
  watch: {
    filterProfile(value) {
      this.$store.dispatch("hideNextLoading")
      const me = this
      const op = Object.assign(me.options, { queryText: value })
      // me.response = await me.$repository.User.index(op);
      me.indexOrganizations(op)
    },
  },

  mounted() {
    if (this.userx) {
      this.item = this.userx
    }
    this.indexOrganizations()
  },
  methods: {
    close() {
      this.$emit("close")
    },

    saveProfile() {
      if (!this.$refs.formProfile.validate()) return
      this.$emit("save", this.item)
    },
    indexOrganizations(options) {
      if (options) {
        this.options = options
      }
      const op = Object.assign({ queryText: this.filterUser }, this.options)

      op.user_id = this.user_id

      this.$repository.Organization.filter(op).then((res) => {
        this.organizations = res
      })
    },
  },
}
</script>
