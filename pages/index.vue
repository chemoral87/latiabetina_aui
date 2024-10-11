<template>
  <v-container fluid>
    <span class="text-h6 ml-2">Bienvenido {{ NAME_SECRET }}</span>
    <v-row>
      <template v-if="hasPermission('consolidador-index')">
        <v-col cols="auto">
          <v-btn
color="primary"
large
@click="$router.push('/consolidate')">
            <div class="wrapper">
              <v-icon>mdi-account-plus</v-icon>
              <div>Consolidar</div>
            </div>
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
color="success"
large
@click="$router.push('/consolidate/my')">
            <div class="wrapper">
              <div><v-icon>mdi-account-group</v-icon> Mis</div>
              <div>Consolidados</div>
            </div>
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn
color="info"
large
@click="$router.push('/consolidate/calls')">
            <div class="wrapper">
              <v-icon>mdi-phone</v-icon>
              <span>Seguimiento</span>
            </div>
          </v-btn>
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
<script>
export default {
  middleware: ['authenticated'],
  props: {},
  data() {
    return {
      NAME_SECRET: '', // process.env.NAME_SECRET
    }
  },
  mounted() {
    this.$nuxt.$emit('setNavBar', {
      title: 'Dashboard',
      icon: 'view-dashboard',
    })
  },
  methods: {
    hasPermission(permission) {
      // return this.permissions.hasOwnProperty(permission)
      return Object.prototype.hasOwnProperty.call(this.permissions, permission)
      // return this.permissions.includes(permission);
    },
  },
}
</script>
