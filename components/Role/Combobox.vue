<template>
  <div>
    <v-combobox v-model="model" :filter="filter" item-value="id" item-text="name" :hide-no-data="!search" :items="items" :search-input.sync="search" hide-selected label="Roles" multiple>
      <template #no-data>
        <v-list-item v-if="!searching">Intente con otra búsqueda</v-list-item>
        <v-list-item v-else>Buscando...</v-list-item>
      </template>
      <template #selection="{ attrs, item, parent, selected }">
        <v-chip v-if="item === Object(item)" v-bind="attrs" color="primary" :input-value="selected" label>
          <span class="pr-2">
            {{ item.name }}
          </span>
          <v-icon small @click="parent.selectItem(item)">$delete</v-icon>
        </v-chip>
      </template>
      <template #item="{ item }">
        <v-chip color="primary" dark label small>
          {{ item.name }}
        </v-chip>
        <v-spacer></v-spacer>
      </template>
    </v-combobox>
  </div>
</template>
<script>
export default {
  name: "RoleCombobox",
  props: ["roles"],
  data: () => ({
    items: [],
    model: [],
    search: null,
    searching: false,
    // x: 0,
    // y: 0,
  }),
  computed: {
    roles_id() {
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
      this.searching = true
      if (!(val == null || val.trim() === "")) {
        const itemz = await this.$repository.Role.filter({ queryText: val, ids: this.roles_id })
        this.searching = false
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
    this.model = this.roles || []
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
