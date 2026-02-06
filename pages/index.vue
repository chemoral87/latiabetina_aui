<template>
  <v-container fluid></v-container>
</template>
<script>
export default {
  props: {},
  data() {
    return {
      NAME_SECRET: "", // process.env.NAME_SECRET
    }
  },
  mounted() {
    // Redirect to dashboard
    this.$router.replace("/dashboard")
  },
}
</script>
