<template>
  <div>
    <v-combobox v-model="model" :filter="filter" item-value="id" item-text="name" hide-selected :hide-no-data="!search" :items="items" :search-input.sync="search" v-bind="$attrs" multiple>
      <template #no-data>
        <v-list-item>Intente con otra búsqueda...</v-list-item>
      </template>
      <template #selection="{ attrs, item, parent, selected }">
        <v-chip v-if="item === Object(item)" v-bind="attrs" color="info" :input-value="selected" label>
          <span class="pr-2">
            {{ item.name }}
          </span>
          <v-icon small @click="parent.selectItem(item)">$delete</v-icon>
        </v-chip>
      </template>
      <template #item="{ item }">
        <v-chip color="info" dark label small>
          {{ item.name }}
        </v-chip>
        <v-spacer></v-spacer>
      </template>
    </v-combobox>
  </div>
</template>
<script>
export default {
  name: "PermissionCombobox",
  props: ["permissionsx"],
  data: () => ({
    items: [],
    model: [],
    // x: 0,
    // y: 0,
    search: null,
  }),
  computed: {
    permissions_id() {
      const ids = []
      this.model.forEach((element) => {
        ids.push(element.id)
      })
      return ids
    },
  },
  watch: {
    async search(val, prev) {
      this.$store.dispatch("hideNextLoading")
      if (!(val == null || val.trim() === "")) {
        const itemz = await this.$repository.Permission.filter({ queryText: val, ids: this.permissions_id }, { loading: false })
        this.items = itemz
      }
    },
    model(val, prev) {
      if (val.length === prev.length) return
      let i = val.length
      while (i--) {
        if (typeof val[i] === "string") {
          val.splice(i, 1)
        }
      }
      this.model = val
      this.$emit("modelChange", val)
    },
  },
  mounted() {
    this.model = this.permissionsx || []
  },
  methods: {
    filter(item, queryText, itemText) {
      const hasValue = (val) => (val != null ? val : "")
      const text = hasValue(itemText)
      const query = hasValue(queryText)
      return text.toString().toLowerCase().includes(query.toString().toLowerCase())
    },
  },
}
</script>
