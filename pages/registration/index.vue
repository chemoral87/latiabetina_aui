<template>
  <v-container>
    <v-form ref="formRegistration" @submit.prevent="save">
      <v-row dense>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.name" label="Nombre" :rules="[rules.required]" :error-messages="errors?.name" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.last_name" label="Ap. Paterno" :rules="[rules.required]" :error-messages="errors?.last_name" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.second_last_name" label="Ap. materno" :error-messages="errors?.second_last_name" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.email" :rules="[rules.required]" label="E-mail" :error-messages="errors?.email" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.cellphone" label="Celular" :error-messages="errors?.cellphone" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.password" :rules="[rules.required]" label="Contraseña" type="password" :error-messages="errors?.password" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="item.password_confirmation" :rules="[rules.required]" label="Confirma Contraseña" type="password" @keyup.enter="save"></v-text-field>
        </v-col>
        <v-col cols="auto"></v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col cols="auto">
          <span class="red--text">
            {{ errors?.status }}
          </span>
          <v-btn color="primary" class="mr-1" outlined @click="gotoMain">Cancelar</v-btn>
          <v-btn color="primary" type="submit">Guardar</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>
<script>
export default {
  middleware: ["guest"],
  props: {},
  data() {
    return {
      item: {
        second_last_name: "",
      },
      rules: {
        required: (value) => {
          return !!value || "Requerido."
        },
        min: (v) => v.length >= 8 || "Min 8 characters",
      },
    }
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Registro",
      icon: "mdi-pencil",
    })
  },
  methods: {
    async save() {
      const me = this
      if (!me.$refs.formRegistration.validate()) return
      await me.$repository.User.register(me.item)
        .then((res) => {
          me.$router.push("/login")
        })
        .catch((e) => {})
    },
    gotoMain() {
      this.$router.push("/landing")
    },
  },
}
</script>
