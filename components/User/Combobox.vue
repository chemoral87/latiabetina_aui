<template>
  <div>
    <v-combobox
      v-model="model"
      :filter="filter"
      item-value="id"
      item-text="name"
      :label="label ? label : 'Usuarios'"
      hide-selected
      :hide-no-data="!search"
      :items="items"
      :search-input.sync="search"
      v-bind="$attrs"
      multiple
    >
      <template #no-data>
        <v-list-item v-if="!searching">Intente con otra búsqueda</v-list-item>
        <v-list-item v-else>Buscando...</v-list-item>
      </template>
      <template #selection="{ attrs, item, parent, selected }">
        <v-chip v-if="item === Object(item)" v-bind="attrs" color="primary" :input-value="selected" label>
          <span class="pr-2">{{ item.name }} {{ item.last_name }} ({{ item.email }})</span>
          <v-icon small @click="parent.selectItem(item)">$delete</v-icon>
        </v-chip>
      </template>
      <template #item="{ item }">
        <v-chip color="info" dark label small>{{ item.name }} {{ item.last_name }} ({{ item.email }})</v-chip>
        <v-spacer></v-spacer>
      </template>
    </v-combobox>
  </div>
</template>
<script>
export default {
  name: "UserCombobox",
  props: ["users", "label"],
  data: () => ({
    items: [],
    model: [],
    search: null,
    searching: false,
  }),
  computed: {
    user_ids() {
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
        const itemz = await this.$repository.User.filter({ queryText: val, ids: this.user_ids }, { loading: false })
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
    this.model = this.users || []
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
