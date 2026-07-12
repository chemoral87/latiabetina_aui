<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filter" append-icon="mdi-magnify" clearable hide-details placeholder="Buscar artículo"
          dense />
      </v-col>

      <v-col cols="auto">
        <v-btn v-if="hasInsertPermission" color="primary" class="mr-2" @click="newProduct">
          <v-icon left>mdi-plus</v-icon>
          Nuevo
        </v-btn>
        <v-btn color="primary" :loading="loading" class="mr-2" @click="refreshProducts">
          <v-icon left>mdi-reload</v-icon>
          Refrescar
        </v-btn>
      </v-col>

      <v-col cols="auto">
        <v-btn-toggle v-model="viewMode" mandatory dense color="primary">
          <v-btn value="table">
            <v-icon left>mdi-table</v-icon>
            Tabla
          </v-btn>
          <v-btn value="cards">
            <v-icon left>mdi-view-grid</v-icon>
            Tarjetas
          </v-btn>
        </v-btn-toggle>
      </v-col>

      <v-col cols="auto" v-if="showOrgSelect">
        <organization-select v-model="filterOrgId" permission="product-insert" hide-one dense hide-details clearable
          outlined />
      </v-col>

      <v-col cols="12" v-if="viewMode === 'table'">
        <ProductTable :options="options" :response="response" :loading="loading" permission="product-index"
          @sorting="handleSorting" @edit="editProduct" @delete="beforeDeleteProduct" />
      </v-col>

      <v-col cols="12" v-else>
        <v-row dense>
          <v-col v-for="(product, index) in response.data" :key="product.id" cols="6" sm="4" md="4">
            <ProductCard :product="product" :is-first="index === 0" :is-last="index === response.data.length - 1"
              @toggle-preparation="toggleRequiresPreparation" @toggle-hidden="toggleHidden" @edit="editProduct"
              @delete="beforeDeleteProduct" @move-left="moveProduct(index, -1)" @move-right="moveProduct(index, 1)" />
          </v-col>
          <v-col cols="12" v-if="response.data.length === 0" class="text-center pa-8">
            <v-icon color="grey lighten-1" size="48">mdi-package-variant</v-icon>
            <div class="text-body-1 grey--text mt-2">No se encontraron artículos</div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <DialogDelete v-if="productDialogDelete" :dialog="dialogDelete" :loading="deleting" @ok="deleteProduct"
      @close="productDialogDelete = false" />
  </v-container>
</template>

<script>
import { debounce } from 'lodash-es'
import ProductTable from '@/components/Product/ProductTable.vue'
import ProductCard from '@/components/Product/ProductCard.vue'

export default {
  components: { ProductTable, ProductCard },

  middleware: ['authenticated', 'permission'],
  meta: { permission: 'product-index' },
  async asyncData({ app, error }) {
    const options = {
      page: 1,
      sortBy: ['order'],
      sortDesc: [false],
      itemsPerPage: 20,
    }

    const response = await app.$repository.Product.index(options)
    return { response, options }
  },

  data() {
    return {
      viewMode: 'table',
      filter: '',
      filterOrgId: null,
      response: { data: [], total: 0 },
      options: {},
      productDialogDelete: false,
      dialogDelete: {},
      deleting: false,
      loading: false,
      skipFilterWatch: false,
    }
  },

  computed: {
    hasInsertPermission() {
      return this.hasPermission('product-insert')
    },

    showOrgSelect() {
      const orgIds = this.$store.getters.permissions['product-insert']
      return Array.isArray(orgIds) && orgIds.length > 1
    },
  },

  watch: {
    filter: {
      handler: debounce(function (value) {
        if (this.skipFilterWatch) {
          this.skipFilterWatch = false
          return
        }
        this.handleFilterChange(value)
      }, 500),
    },
    filterOrgId(value) {
      const overrides = { page: 1 }
      if (value) {
        overrides.org_id = value
      } else {
        overrides.org_id = undefined
      }
      this.loadProducts(overrides)
    },
    viewMode(newMode) {
      if (newMode === 'cards') {
        this.options.page = 1
        this.options.sortBy = ['order']
        this.options.sortDesc = [false]
        this.options.itemsPerPage = 100
      } else {
        this.options.page = 1
        this.options.sortBy = ['name']
        this.options.sortDesc = [false]
        this.options.itemsPerPage = 10
      }
      this.loadProducts()
    },
  },

  mounted() {
    this.setNavBar()
  },

  methods: {
    setNavBar() {
      const eventBus = this.$eventBus || this.$nuxt
      eventBus.$emit('setNavBar', {
        title: 'Productos',
        icon: 'mdi-package-variant',
      })
    },

    async handleFilterChange(value) {
      await this.loadProducts({ filter: value || '', page: 1 })
    },

    async loadProducts(overrides = {}) {
      try {
        this.loading = true

        const requestOptions = {
          ...this.options,
          ...overrides,
        }

        if (this.filter && !Object.prototype.hasOwnProperty.call(overrides, 'filter')) {
          requestOptions.filter = this.filter
        }

        if (this.filterOrgId && !Object.prototype.hasOwnProperty.call(overrides, 'org_id')) {
          requestOptions.org_id = this.filterOrgId
        }

        if (Object.prototype.hasOwnProperty.call(overrides, 'org_id') && !overrides.org_id) {
          delete requestOptions.org_id
        }

        let response = await this.$repository.Product.index(requestOptions)

        if (Array.isArray(response)) {
          response = { data: response, total: response.length }
        }

        this.response = response
        this.options = requestOptions
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        }
      } finally {
        this.loading = false
      }
    },

    async refreshProducts() {
      await this.loadProducts()
    },

    async handleSorting(options) {
      this.options = options
      await this.loadProducts()
    },

    newProduct() {
      this.$router.push({ path: '/pos/products/new' })
    },

    editProduct(item) {
      this.$router.push(`/pos/${item.id}`)
    },

    beforeDeleteProduct(item) {
      this.dialogDelete = {
        text: 'Desea eliminar el producto',
        strong: item.name,
        text2: '?',
        payload: item,
      }
      this.productDialogDelete = true
    },

    async deleteProduct() {
      const item = this.dialogDelete.payload
      try {
        this.deleting = true
        await this.$repository.Product.delete(item.id)

        this.skipFilterWatch = true
        this.filter = ''
        await this.loadProducts({ filter: '', page: 1 })

        this.productDialogDelete = false
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        }
      } finally {
        this.deleting = false
      }
    },

    async toggleRequiresPreparation(product) {
      try {
        await this.$repository.Product.update(product.id, {
          requires_preparation: product.requires_preparation,
        })
      } catch (error) {
        product.requires_preparation = !product.requires_preparation
        if (this.$handleError) {
          this.$handleError(error)
        }
      }
    },

    async toggleHidden(product) {
      try {
        const nextValue = !product.hidden
        await this.$repository.Product.update(product.id, {
          hidden: nextValue,
        })
        product.hidden = nextValue
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        }
      }
    },

    moveProduct(index, direction) {
      const data = this.response.data
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= data.length) return

      const item = data.splice(index, 1)[0]
      data.splice(targetIndex, 0, item)

      this.sendReorder()
    },

    async sendReorder() {
      try {
        const ids = this.response.data.map((p) => p.id)
        await this.$repository.Product.reorder(ids)
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        }
      }
    },
  },
}
</script>
