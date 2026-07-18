<template>
  <v-card outlined class="d-flex flex-column fill-height" style="position: relative;">
    <div class="product-card__order-btns">
      <v-btn icon x-small class="order-btn" :disabled="isFirst" @click="$emit('move-left', product)">
        <v-icon x-small>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn icon x-small class="order-btn" :disabled="isLast" @click="$emit('move-right', product)">
        <v-icon x-small>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

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

      <v-card-title class="text-subtitle-1 font-weight-bold pb-1 d-flex align-center">
        <span class="text-truncate d-block">{{ product.name }}</span>
        <v-icon
          v-if="product.requires_preparation"
          color="orange darken-1"
          small
          class="ml-1 flex-shrink-0"
        >
          mdi-chef-hat
        </v-icon>
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
      <v-btn icon small color="primary" @click="$emit('edit', product)">
        <v-icon small>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon small color="error" @click="$emit('delete', product)">
        <v-icon small>mdi-delete</v-icon>
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
    isFirst: {
      type: Boolean,
      default: false,
    },
    isLast: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['toggle-preparation', 'toggle-hidden', 'edit', 'delete', 'move-left', 'move-right'],
}
</script>

<style scoped>
.product-card__order-btns {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 1;
  display: flex;
  gap: 4px;
}

.order-btn {
  background-color: #ff6f00 !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4) !important;
}

.order-btn .v-icon {
  color: #ffffff !important;
}

.order-btn.v-btn--disabled {
  background-color: rgba(0, 0, 0, 0.18) !important;
  box-shadow: none !important;
}

.order-btn.v-btn--disabled .v-icon {
  color: rgba(255, 255, 255, 0.35) !important;
}
</style>
