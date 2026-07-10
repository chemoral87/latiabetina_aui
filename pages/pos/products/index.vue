<template>
  <v-container fluid>
    <v-row dense>
      <v-col cols="12" md="2">
        <v-text-field v-model="filter" append-icon="mdi-magnify" clearable hide-details
          placeholder="Buscar artículo" dense />
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
        <v-row dense>          <v-col v-for="product in response.data" :key="product.id" cols="12" sm="6" md="4" lg="3">
            <v-card outlined class="d-flex flex-column fill-height">
              <div class="d-flex flex-column flex-grow-1" :style="product.hidden ? 'opacity: 0.7; background-color: #b0b0b0;' : ''">
                <v-img
                  :src="product.image_s3 || ''"
                  height="180px"
                  contain
                  :style="product.hidden ? 'filter: brightness(0.7);' : ''"
                  class="grey lighten-4"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-icon color="grey lighten-1">mdi-package-variant</v-icon>
                    </v-row>
                  </template>
                </v-img>
                
                <v-card-title class="text-subtitle-1 font-weight-bold pb-1 text-truncate d-block">
                  {{ product.name }}
                </v-card-title>
                
                <v-card-subtitle class="pb-1">
                  <span class="grey--text text-caption">SKU: {{ product.sku }}</span>
                </v-card-subtitle>
                
                <v-card-text class="flex-grow-1 pt-0">
                  <div class="text-h6 primary--text font-weight-black">${{ product.price }}</div>
                  <div class="text-caption grey--text text--darken-1 text-truncate mb-2" v-if="product.description">
                    {{ product.description }}
                  </div>
                  <div class="text-body-2 mb-2">
                    Stock: <strong :class="product.stock > 0 ? 'success--text' : 'error--text'">{{ product.stock }}</strong>
                  </div>
                  <v-switch
                    v-model="product.requires_preparation"
                    label="Requiere preparar"
                    dense
                    hide-details
                    class="mt-0 pt-0"
                    @change="toggleRequiresPreparation(product)"
                  />
                </v-card-text>
              </div>
 
              <v-divider></v-divider>
 
              <v-card-actions class="justify-end">
                <v-btn icon small class="mr-1" @click="toggleHidden(product)">
                  <v-icon small :color="product.hidden ? 'warning' : 'grey'">{{ product.hidden ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>
                <v-btn text small color="primary" @click="editProduct(product)">
                  <v-icon left small>mdi-pencil</v-icon>
                  Editar
                </v-btn>
                <v-btn text small color="error" @click="beforeDeleteProduct(product)">
                  <v-icon left small>mdi-delete</v-icon>
                  Eliminar
                </v-btn>
              </v-card-actions>
            </v-card>
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

export default {
  components: { ProductTable },
  middleware: ['authenticated', 'permission'],
  meta: { permission: 'product-index' },
  async asyncData({ app, error }) {
    const options = {
      page: 1,
      sortBy: ['name'],
      sortDesc: [false],
      itemsPerPage: 10,
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
  },
}
</script>
