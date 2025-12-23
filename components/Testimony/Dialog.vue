<template>
  <v-card>
    <v-card-title>
      <span class="text-h6">{{ localTestimony.id ? "Editar Testimonio" : "Nuevo Testimonio" }}</span>
    </v-card-title>

    <v-card-text>
      <v-form ref="form">
        <v-text-field v-model="localTestimony.title" label="Título" dense />
        <v-textarea v-model="localTestimony.body" label="Contenido" rows="4" dense />
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn text @click="$emit('close')">Cancelar</v-btn>
      <v-btn color="primary" :loading="loading" @click="handleSave">Guardar</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "TestimonyDialog",
  props: {
    testimony: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data() {
    return {
      localTestimony: { ...this.testimony },
    }
  },
  watch: {
    testimony: {
      handler(v) {
        this.localTestimony = { ...v }
      },
      deep: true,
    },
  },
  methods: {
    handleSave() {
      this.$emit("save", { ...this.localTestimony })
    },
  },
}
</script>

<style scoped></style>
