<template>
  <div class="kds-items-list pa-3 pt-0">
    <div
      v-for="(row, rowIndex) in preparationRows"
      :key="`${row.item.id}-${rowIndex}`"
      :id="`pos-kds-item-${order.id}-${row.item.id}-${rowIndex}`"
      class="kds-item-row"
      :class="{ 'kds-item-row-done': isRowDone(row) || isItemCompleted(row.item) }"
      :title="statusTitle(row.item)"
      @click="toggleRow(row.item.id, rowIndex)"
    >
      <div class="kds-item-thumb">
        <v-img
          v-if="row.item.product?.image_s3"
          :src="row.item.product.image_s3"
          height="36"
          width="36"
          class="rounded"
        >
          <template #placeholder>
            <v-sheet height="36" width="36" color="grey lighten-3" class="d-flex align-center justify-center rounded">
              <v-icon x-small color="grey lighten-1">mdi-food</v-icon>
            </v-sheet>
          </template>
        </v-img>
        <v-sheet v-else height="36" width="36" color="grey lighten-3" class="d-flex align-center justify-center rounded">
          <v-icon x-small color="grey lighten-1">mdi-food</v-icon>
        </v-sheet>
      </div>

      <div class="kds-item-info">
        <div class="kds-item-name">{{ row.item.product?.name }}</div>
        <div v-if="row.item.product?.description" class="kds-item-desc">{{ row.item.product.description }}</div>
        <div v-if="row.item.preparation_status" class="kds-item-status">
          {{ statusTitle(row.item) }}
        </div>
      </div>

      <v-btn
        v-if="isRowDone(row)"
        :id="`pos-kds-item-undo-${order.id}-${row.item.id}-${rowIndex}`"
        fab
        small
        class="kds-undo-button"
        @click.stop="undoRow(row.item.id, rowIndex)"
      >
        <v-icon small>mdi-undo-variant</v-icon>
      </v-btn>

      <v-chip
        small
        :color="isRowDone(row) || isItemCompleted(row.item) ? 'success' : 'orange darken-2'"
        dark
        class="font-weight-bold kds-item-qty"
      >
        <v-icon
          v-if="isRowDone(row) || isItemCompleted(row.item)"
          x-small
          class="mr-1"
        >mdi-check</v-icon>
        <v-icon v-else x-small class="mr-1">mdi-chef-hat</v-icon>
      </v-chip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KdsItemsList',

  props: {
    order: {
      type: Object,
      required: true,
    },
    doneMap: {
      type: Object,
      required: true,
    },
    isItemCompleted: {
      type: Function,
      required: true,
    },
    statusTitle: {
      type: Function,
      required: true,
    },
  },

  computed: {
    preparationRows() {
      const rows = []
      const items = this.order.items?.filter((item) => item.product?.requires_preparation === true) || []
      items.forEach((item) => {
        for (let i = 0; i < item.quantity; i++) {
          rows.push({ item, rowIndex: i })
        }
      })
      return rows
    },
  },

  methods: {
    rowKey(itemId, rowIndex) {
      return `${itemId}-${rowIndex}`
    },

    isRowDone(row) {
      const map = this.doneMap?.[this.order.id] || {}
      return !!map[this.rowKey(row.item.id, row.rowIndex)] || row.item?.completed_quantity > row.rowIndex
    },

    toggleRow(itemId, rowIndex) {
      this.$emit('toggle-row-done', this.order.id, itemId, rowIndex)
    },

    undoRow(itemId, rowIndex) {
      this.$emit('undo-row-done', this.order.id, itemId, rowIndex)
    },
  },
}
</script>

<style scoped>
.kds-items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kds-item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.kds-item-row:hover {
  background: #fff3e0;
}

.kds-item-row-done {
  opacity: 0.6;
  background: #e8f5e9 !important;
}

.kds-item-row-done:hover {
  background: #c8e6c9 !important;
}

.kds-undo-button {
  min-width: 28px;
  width: 28px;
  height: 28px;
  padding: 0;
  margin-left: auto;
  color: #fff;
  background-color: rgba(76, 175, 80, 0.9);
}

.kds-undo-button:hover {
  background-color: rgba(76, 175, 80, 1);
}

.kds-item-thumb {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
}

.kds-item-info {
  flex: 1;
  min-width: 0;
}

.kds-item-name {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.kds-item-desc {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kds-item-qty {
  flex-shrink: 0;
  min-width: 44px;
  justify-content: center;
  font-size: 12px;
}
</style>
