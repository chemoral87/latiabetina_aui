<template>
  <v-card class="mb-8" :outlined="outlined" :elevation="outlined ? undefined : elevation">
    <v-card-title class="text-h6 font-weight-bold primary white--text py-3 px-4">
      <v-icon v-if="icon" left color="white">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text :class="textClass">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "CoursesSection",
  props: {
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    elevation: {
      type: [Number, String],
      default: 2,
    },
    textClass: {
      type: String,
      default: "pt-4",
    },
  },
};
</script>
