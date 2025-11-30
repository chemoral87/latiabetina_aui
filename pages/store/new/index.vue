<template>
  <v-container fluid>
    <v-form ref="form" @submit.prevent="saveStore">
      <v-row dense>
        <v-col cols="6" md="3">
          <!-- <v-text-field v-model="store.org_id" outlined label="org_id" :rules="[(v) => !!v || 'Campo requerido']" /> -->
          <organization-select v-model="store.org_id" :permission="'store-create'" outlined :rules="[$vrules.required]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.name" outlined label="name" :rules="[(v) => !!v || 'Campo requerido']" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.address" outlined label="address" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.city" outlined label="city" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.state" outlined label="state" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.zip" outlined label="zip" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.country" outlined label="country" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.phone" outlined label="phone" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.latitude" outlined label="latitude" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="store.longitude" outlined label="longitude" :rules="[]" />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col cols="auto">
          <v-btn color="primary" outlined class="mr-1" @click.native="cancel">
            <span>Cancelar</span>
            <v-icon>mdi-cancel</v-icon>
          </v-btn>

          <v-btn type="submit" color="primary" class="mr-4">
            <span>Guardar</span>
            <v-icon>mdi-check</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
export default {
  middleware: ["authenticated"],
  validate({ store, error }) {
    return true
    //   const permission = "store-create"
    // if (store.getters.permissions.includes(permission)) return true
    // else
    //   throw error({
    //     statusCode: 403,
    //     message: `Permission required ${permission}`,
    // //   })
  },
  data() {
    return {
      store: {},
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Nuevo Store",
      icon: "mdi-human-greeting-variant",
    })
  },
  methods: {
    async saveStore() {
      if (!this.$refs.form.validate()) return

      await this.$repository.Store.create(this.store)
        .then((res) => {
          this.$router.push("/store")
        })
        .catch((e) => {
          alert(e)
        })
    },
    cancel() {
      this.$router.push("/store")
    },
  },
}
</script>
