<template>
  <v-row dense align="center">
    <!-- Filtro / búsqueda -->
    <v-col v-if="showSearch" :cols="cols" :sm="sm" :md="md">
      <v-text-field
        :id="searchId"
        :value="value"
        :append-icon="searchIcon"
        :placeholder="searchPlaceholder"
        clearable
        hide-details
        dense
        outlined
        @input="$emit('input', $event)"
      />
    </v-col>

    <!-- Filtros adicionales (estado, fechas, etc.) -->
    <slot name="filters" />

    <!-- Botones de acción -->
    <v-col cols="auto" class="d-flex align-center">
      <v-btn
        v-if="showRefresh"
        :id="refreshId"
        color="primary"
        :loading="loading"
        class="mr-1"
        @click="$emit('refresh')"
      >
        <v-icon left>mdi-reload</v-icon>
        {{ refreshLabel }}
      </v-btn>
      <v-btn
        v-if="showNew"
        :id="newId"
        color="success"
        class="mr-1"
        @click="$emit('create')"
      >
        <v-icon left>{{ newIcon }}</v-icon>
        {{ newLabel }}
      </v-btn>
      <!-- Botones adicionales (Dashboard, Calendario, etc.) -->
      <slot name="actions" />
    </v-col>

    <!-- Elementos al final (filtro de organización, etc.) -->
    <slot name="append" />
  </v-row>
</template>

<script>
export default {
  name: "FilterRow",
  props: {
    // v-model del filtro de búsqueda
    value: {
      type: [String, Number, Array],
      default: "",
    },
    showSearch: {
      type: Boolean,
      default: true,
    },
    searchPlaceholder: {
      type: String,
      default: "Filtro",
    },
    searchIcon: {
      type: String,
      default: "mdi-magnify",
    },
    searchId: {
      type: String,
      default: null,
    },
    // Anchos responsivos del campo de búsqueda
    cols: {
      type: [Number, String],
      default: 12,
    },
    sm: {
      type: [Number, String],
      default: null,
    },
    md: {
      type: [Number, String],
      default: 4,
    },
    showRefresh: {
      type: Boolean,
      default: true,
    },
    showNew: {
      type: Boolean,
      default: true,
    },
    refreshLabel: {
      type: String,
      default: "Refrescar",
    },
    newLabel: {
      type: String,
      default: "Nuevo",
    },
    newIcon: {
      type: String,
      default: "mdi-plus",
    },
    refreshId: {
      type: String,
      default: null,
    },
    newId: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
