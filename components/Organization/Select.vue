<template>
  <v-select v-show="showSelect" v-model="selected" :disabled="disabled" :items="items" :label="label" item-text="name" item-value="id" v-bind="$attrs"></v-select>
</template>
<script>
export default {
  name: "OrganizationSelect",
  props: {
    permission: {
      type: String,
      required: true,
    },
    hideOne: {
      type: Boolean,
      default: false,
    },
    preventAutoSelect: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [String, Number],
      default: null,
    },
    label: {
      type: String,
      default: "Org",
    },
  },
  data() {
    return {
      items: [],
      selected: null,
      disabled: false,
    }
  },
  computed: {
    showSelect() {
      // Si hideOne está presente y disabled es true, ocultar el select
      if (this.hideOne && this.disabled) {
        console.log("Hiding select because hideOne is true and disabled is true")
        return false
      }
      // De lo contrario, mostrar solo si no está disabled
      return true
    },
  },
  watch: {
    selected(val) {
      this.$emit("input", val)
    },
    value: {
      immediate: true,
      handler(val) {
        this.selected = val
      },
    },
  },
  mounted() {
    const me = this
    const orgIds = this.permissions[this.permission]

    const filterOrgs = this.orgs.filter((org) => orgIds.includes(org.id))

    me.items = filterOrgs

    // select if only one and no existing value and not preventing auto-select
    if (filterOrgs.length === 1 && !this.preventAutoSelect && (this.value === null || this.value === "" || this.value === undefined)) {
      me.$nextTick(() => {
        me.selected = filterOrgs[0].id
        me.disabled = true
      })
      // set disabled if only one
    }
  },
  methods: {},
}
</script>
