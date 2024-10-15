<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <div class="text-h5">
          Nombre: {{ user.name }} {{ user.last_name }}
          {{ user.second_last_name }}
        </div>
        <div class="text-h6">Email: {{ user.email }}</div>
        v.2.2.16
      </v-col>
      <v-col>
        <!-- <v-btn color="primary">Editar Nombre</v-btn> -->
        <v-btn color="success" @click="dialogPassword = true">Cambiar contraseña</v-btn>
      </v-col>
      <v-col cols="12">
        <div class="text-h6">Permisos:</div>
        <ul>
          <!-- <li v-for="(permission, ix) in permissions" :key="ix">{{ ix }} {{ permission }}</li> -->
          <li v-for="(permission, ix) in permissions" :key="ix">{{ ix }}</li>
        </ul>
      </v-col>
    </v-row>
    <UserDialogPassword v-if="dialogPassword" @close="dialogPassword = false" @save="changePassword($event)">
    </UserDialogPassword>
  </v-container>
</template>

<script>
export default {
  created() {
    this.$nuxt.$emit("setNavBar", { title: "Perfil", icon: "account" });
  },
  methods: {
    async changePassword(payload) {
      await this.$repository.User.change(payload)
        .then(res => {
          // me.getUsers();
          // me.userDialog = false;
          this.$auth.logout();
        })
        .catch(e => {});
    }
  },

  data: () => ({
    dialogPassword: false
  })
};
</script>
