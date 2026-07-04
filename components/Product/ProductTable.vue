<template>
  <v-data-table :headers="headers" :items="items" :options.sync="optionsTable" dense :server-items-length="total"
    :loading="loading" :must-sort="true" mobile-breakpoint="0" class="elevation-1 xwidth800">
    <template #[`item.actions`]="{ item }">
      <div class="d-flex flex-nowrap justify-center">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn outlined color="primary" fab x-small class="mr-1" v-bind="attrs" v-on="on" @click="editProduct(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Editar</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn outlined color="error" fab x-small v-bind="attrs" v-on="on" @click="deleteProduct(item)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
          <span>Eliminar</span>
        </v-tooltip>
      </div>
    </template>

    <template #[`item.org_code`]="{ item }">
      {{ orgCodeById(item.org_id) }}
    </template>

    <template #[`item.hidden`]="{ item }">
      {{ item.hidden ? 'Sí' : 'No' }}
    </template>

    <template #no-data>
      <div class="text-center pa-4">
        <v-icon color="grey lighten-1">mdi-package-variant</v-icon>
        <span class="text-body-1 grey--text">No se encontraron artículos</span>
      </div>
    </template>
  </v-data-table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProductTable',
  props: {
    response: {
      type: Object,
      default: () => ({ data: [], total: 0 }),
    },
    options: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    permission: {
      type: String,
      default: 'product-index',
    },
  },
  data() {
    return {
      optionsTable: {},
      isFirstWatch: true,
    }
  },
  computed: {
    ...mapGetters(['orgCodeById']),

    total() {
      return this.response && this.response.total ? this.response.total : 0
    },
    items() {
      return this.response && this.response.data ? this.response.data : []
    },
    showOrgColumn() {
      const orgIds = this.$store.getters.permissions[this.permission]
      return Array.isArray(orgIds) && orgIds.length > 1
    },
    headers() {
      const cols = [
        { text: 'Nombre', align: 'start', value: 'name' },
      ]
      if (this.showOrgColumn) {
        cols.push({ text: 'Org', value: 'org_code', sortable: false })
      }
      cols.push(
        { text: 'SKU', value: 'sku', sortable: false },
        { text: 'Oculto', value: 'hidden', sortable: false },
        { text: 'Precio', value: 'price', align: 'right' },
        { text: 'Stock', value: 'stock', align: 'right' },
        { text: 'Acciones', value: 'actions', sortable: false, align: 'center', width: '160px' },
      )
      return cols
    },
  },
  watch: {
    options: {
      handler(newOptions) {
        if (newOptions) {
          this.optionsTable = Object.assign({}, newOptions)
        }
      },
      immediate: true,
      deep: true,
    },
    optionsTable: {
      handler(newValue, oldValue) {
        if (this.isFirstWatch) {
          this.isFirstWatch = false
          return
        }
        if (this.hasOptionsChanged(newValue, oldValue)) {
          this.$emit('sorting', newValue)
        }
      },
      deep: true,
    },
  },
  methods: {
    hasOptionsChanged(newVal, oldVal) {
      if (!oldVal) return true
      const relevantProps = ['page', 'itemsPerPage', 'sortBy', 'sortDesc']
      return relevantProps.some((prop) => {
        if (Array.isArray(newVal[prop]) && Array.isArray(oldVal[prop])) {
          return JSON.stringify(newVal[prop]) !== JSON.stringify(oldVal[prop])
        }
        return newVal[prop] !== oldVal[prop]
      })
    },
    editProduct(item) {
      this.$emit('edit', item)
    },
    deleteProduct(item) {
      this.$emit('delete', item)
    },
  },
}
</script>

<style scoped>
</style>
