<template>
  <v-container>
    <v-row dense>
      <v-col cols="12">
        <v-btn color="primary" @click="newProfile()">Nuevo Perfil</v-btn>
      </v-col>

      <v-col v-for="profile in profiles" :key="profile.id" cols="12">
        <v-card>
          <v-card-title class="py-0">
            <span class="text-subtitle-1 py-1">{{ profile.organization_name }} ({{ profile.organization_short_code }})</span>
            <v-spacer />

            <v-btn icon :color="getColorFavorite(profile.favorite)" @click="setFavProfile(profile)">
              <v-icon>mdi-star</v-icon>
            </v-btn>
            <v-btn icon color="primary" @click="editProfile(profile)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="error" @click="confirmDeleteProfile(profile)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="text-subtitle-2">Roles</div>

                <v-chip v-for="it in profile.roles" :key="it.id" class="ma-2" color="primary">
                  {{ it.name }}
                </v-chip>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-subtitle-2">Permisos Directos</div>

                <v-chip v-for="it in profile.permissions" :key="it.id" class="ma-2" color="info">
                  {{ it.name }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
          <!-- <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="profile.org_id" label="Organización" readonly></v-text-field>
              </v-col>
            </v-row>
          </v-card-text> -->
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <RoleCombobox :roles="mUser.roles" @modelChange="setRoles"></RoleCombobox>
      </v-col>
      <v-col cols="12" md="6">
        <PermissionCombobox :permissionsx="mUser.direct_permissions" label="Permisos Directos" @modelChange="setDirectPermissions"></PermissionCombobox>
      </v-col>

      <v-col cols="12" class="d-flex justify-end">
        <v-btn color="primary" outlined class="mr-1" @click="$router.push('/users')">Cancelar</v-btn>
        <v-btn color="primary" @click="saveUserRolesPermissions()">Guardar</v-btn>
      </v-col>
    </v-row>

    <ProfileDialog v-if="profileDialog" :user_id="user_id" @close="closeProfileDialog" @save="saveProfile" />
    <DialogDelete
      v-if="dialogDelete"
      :dialog="dialogDeleteProp"
      @ok="
        (item) => {
          deleteProfile(item)
        }
      "
      @close="dialogDelete = false"
    ></DialogDelete>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, params, store, error }) {
    // sconst org_ids = await store.dispatch("validatePermission", { permission: "user-update", error })

    const res = await app.$repository.User.show(params.id).catch((e) => {})
    const res2 = await app.$repository.Profile.index(params.id).catch((e) => {})
    return { mUser: res, profiles: res2 }
  },
  // validate({ store, error }) {
  //   if (store.getters.permissions.includes("user-update")) return true;
  //   else throw error({ statusCode: 403 });
  // },
  data() {
    return {
      mUser: {},
      profiles: [],
      profileDialog: false,
      dialogDelete: false,
      dialogDeleteProp: {},
      user_id: this.$route.params.id,
    }
  },

  created() {
    this.$nuxt.$emit("setNavBar", {
      title: `Perfiles de: ${this.mUser.name} ${this.mUser.last_name}`,
      icon: "account",
      back: `/users`,
      show_drawer: false,
    })
  },
  // computed: {
  //   user_id() {
  //     return this.$route.params.id;
  //   }
  // },
  methods: {
    getColorFavorite(profile) {
      return profile ? "orange" : "grey"
    },
    setFavProfile(profile) {
      this.$repository.Profile.favorite(this.user_id, profile.id).then((res) => {
        // update profile.favorite and set others false
        this.profiles = this.profiles.map((x) => {
          x.favorite = x.id === profile.id
          return x
        })
      })
    },
    editProfile(profile) {
      this.$router.push(`/users/${this.user_id}/profiles/${profile.id}`)
    },
    newProfile() {
      // this.$router.push(`/users/${this.user_id}/profiles/new`);
      this.profileDialog = true
    },
    closeProfileDialog() {
      this.profileDialog = false
    },
    setRoles(roles) {
      this.mUser.roles = roles
    },
    setDirectPermissions(permissions) {
      this.mUser.direct_permissions = permissions
    },
    saveProfile(item) {
      this.$repository.Profile.create(this.user_id, { org_id: item.org_id }).then((res) => {
        this.profileDialog = false
        // add profile to profiles
        this.profiles.push(res.profile)
        // this.$router.push(`/users/${this.user_id}`);
      })
    },
    async saveUserRolesPermissions() {
      const roleIds = this.mUser.roles.map((x) => x.id)
      const permissionsIds = this.mUser.direct_permissions.map((x) => x.id)
      const params = {
        roleIds,
        permissionsIds,
      }
      await this.$repository.User.children(this.mUser.id, params).then((res) => {
        // this.$auth.fetchUser(); // refresh permissions
        this.$router.push("/users")
      })
    },
    confirmDeleteProfile(profile) {
      this.dialogDeleteProp = {
        text: "Desea eliminar el Perfil ",
        strong: profile.organization_name,
        payload: profile,
      }
      this.dialogDelete = true
    },
    deleteProfile(profile) {
      this.$repository.Profile.delete(this.user_id, profile.id).then((res) => {
        // remove profile.id from profiles
        this.profiles = this.profiles.filter((x) => x.id !== profile.id)

        this.dialogDelete = false
      })
    },
  },
}
</script>
