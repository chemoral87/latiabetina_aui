<template>
  <v-select v-model="selected" :disabled="disabled" :items="items" label="Org" item-text="name" item-value="id" v-bind="$attrs"></v-select>
</template>
<script>
export default {
  name: "OrganizationSelect",
  props: ["permission"],
  data() {
    return {
      items: [],
      selected: null,
      disabled: false,
    }
  },
  watch: {
    selected(val) {
      this.$emit("input", val)
    },
  },
  mounted() {
    const me = this
    const orgIds = this.permissions[this.permission]

    const filterOrgs = this.orgs.filter((org) => orgIds.includes(org.id))

    me.items = filterOrgs

    // select if only one
    if (filterOrgs.length === 1) {
      me.selected = filterOrgs[0].id
      me.disabled = true
      // set disabled if only one
    }
  },
  methods: {},
}
</script>
