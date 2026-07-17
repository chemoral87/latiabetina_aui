<template>

  <div class="d-flex align-center">
    <v-icon large color="primary" class="mr-2">{{ icon }}</v-icon>
    <div>
      <div class="text-h5 font-weight-bold primary--text">{{ title }}</div>
      <div class="text-caption grey--text">{{ subtitle }}</div>
    </div>
  </div>

</template>

<script>
export default {
  name: 'QuizHeaderTitle',
  props: {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
}
</script>
