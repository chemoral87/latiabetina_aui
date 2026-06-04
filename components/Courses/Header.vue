<template>
  <h1 class="d-inline-flex align-center" style="cursor: pointer" @click="$emit('input', !value)">
    <v-icon :color="value ? 'primary' : 'black'" class="mr-2">
      {{ value ? 'mdi-menu-down' : 'mdi-menu-right' }}
    </v-icon>
    {{ title }}
  </h1>
</template>

<script>
export default {
  name: "CoursesHeader",
  props: {
    value: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
};
</script>
