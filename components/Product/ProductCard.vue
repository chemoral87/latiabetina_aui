<template>
  <v-card outlined class="d-flex flex-column fill-height">
    <div
      class="d-flex flex-column flex-grow-1"
      :style="product.hidden ? 'opacity: 0.7; background-color: #b0b0b0;' : ''"
    >
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
        <div
          v-if="product.description"
          class="text-caption grey--text text--darken-1 text-truncate mb-2"
        >
          {{ product.description }}
        </div>
        <div class="text-body-2 mb-2">
          Stock:
          <strong :class="product.stock > 0 ? 'success--text' : 'error--text'">{{ product.stock }}</strong>
        </div>
        <v-switch
          v-model="product.requires_preparation"
          label="Requiere preparar"
          dense
          hide-details
          class="mt-0 pt-0"
          @change="$emit('toggle-preparation', product)"
        />
      </v-card-text>
    </div>

    <v-divider></v-divider>

    <v-card-actions class="justify-end">
      <v-btn icon small class="mr-1" @click="$emit('toggle-hidden', product)">
        <v-icon small :color="product.hidden ? 'warning' : 'grey'">
          {{ product.hidden ? 'mdi-eye-off' : 'mdi-eye' }}
        </v-icon>
      </v-btn>
      <v-btn text small color="primary" @click="$emit('edit', product)">
        <v-icon left small>mdi-pencil</v-icon>
        Editar
      </v-btn>
      <v-btn text small color="error" @click="$emit('delete', product)">
        <v-icon left small>mdi-delete</v-icon>
        Eliminar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'ProductCard',

  props: {
    product: {
      type: Object,
      required: true,
    },
  },

  emits: ['toggle-preparation', 'toggle-hidden', 'edit', 'delete'],
}
</script>
