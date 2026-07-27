<template>
  <v-container fluid>
    <v-form ref="form" @submit.prevent="saveStore">
      <v-row dense>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-name-1" v-model="store.name" outlined label="name" :rules="[(v) => !!v || 'Campo requerido']" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-address-2" v-model="store.address" outlined label="address" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-city-3" v-model="store.city" outlined label="city" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-state-4" v-model="store.state" outlined label="state" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-zip-5" v-model="store.zip" outlined label="zip" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-country-6" v-model="store.country" outlined label="country" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-phone-7" v-model="store.phone" outlined label="phone" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-latitude-8" v-model="store.latitude" outlined label="latitude" :rules="[]" />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field id="tf-store-index-store-longitude-9" v-model="store.longitude" outlined label="longitude" :rules="[]" />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col cols="auto">
          <v-btn color="primary" outlined class="mr-1" id="btn-store-edit-cancel" @click.native="cancel">
            <span>Cancelar</span>
            <v-icon>mdi-cancel</v-icon>
          </v-btn>

          <v-btn type="submit" color="primary" class="mr-4" id="btn-store-edit-save">
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
    // const permission = "store-update"
    // if (store.getters.permissions.includes(permission)) return true
    // else
    //   throw error({
    //     statusCode: 403,
    //     message: `Permission required ${permission}`,
    //   })
  },
  async asyncData({ $axios, app, params }) {
    const store = await app.$repository.Store.show(params.id).catch((e) => {})
    return { store, id: params.id }
  },
  data() {
    return {
      store: {},
    }
  },
  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Editar Store",
      icon: "mdi-human-greeting-variant",
    })
  },
  methods: {
    async saveStore() {
      if (!this.$refs.form.validate()) return

      await this.$repository.Store.update(this.store.id, this.store)
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
