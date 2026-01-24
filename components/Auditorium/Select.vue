<template>
  <v-select v-model="selected" :disabled="disabled" :items="items" :loading="loading" label="Auditorio" item-text="name" item-value="id" v-bind="$attrs" />
</template>

<script>
export default {
  name: "AuditoriumSelect",

  props: {
    orgId: {
      type: [String, Number],
      default: null,
    },
    value: {
      type: [String, Number],
      default: null,
    },
  },

  data() {
    return {
      items: [],
      selected: null,
      disabled: false,
      loading: false,
    }
  },

  watch: {
    selected(val) {
      this.$emit("input", val)
    },

    value: {
      immediate: true,
      handler(val) {
        this.selected = val
      },
    },

    orgId: {
      immediate: true,
      handler(newOrgId) {
        if (newOrgId) {
          this.loadAuditoriums()
        } else {
          this.items = []
          this.selected = null
        }
      },
    },
  },

  mounted() {
    if (this.orgId) {
      this.loadAuditoriums()
    }
  },

  methods: {
    async loadAuditoriums() {
      if (!this.orgId) {
        this.items = []
        return
      }

      this.loading = true
      try {
        if (this.$repository?.Auditorium?.index) {
          const response = await this.$repository.Auditorium.index({
            org_id: this.orgId,
            sortBy: ["name"],
            sortDesc: [false],
            itemsPerPage: 15,
          })
          this.items = response?.data || []

          // Auto-select if only one auditorium
          if (this.items.length === 1 && !this.selected) {
            this.selected = this.items[0].id
          }
        } else {
          this.items = []
        }
      } catch (error) {
        this.items = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
