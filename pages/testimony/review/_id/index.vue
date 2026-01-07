<template>
  <v-container>
    <v-row dense>
      <v-col cols="12" md="8" class="mx-auto">
        <v-card>
          <v-card-title class="d-flex flex-column align-start">
            <div class="d-flex align-center justify-space-between" style="width: 100%">
              <div>
                <div class="text-h6">{{ mTestimony.name || "Sin nombre" }}</div>
                <div class="grey--text text-caption">ID: {{ mTestimony.id }}</div>
              </div>
              <div class="text-right">
                <v-chip v-if="mTestimony.status === 'approved'" color="green" text-color="white" small>APROBADO</v-chip>
                <v-chip v-else-if="mTestimony.status === 'rejected'" color="red" text-color="white" small>RECHAZADO</v-chip>
                <v-chip v-else color="grey" small>Pendiente</v-chip>
                <div v-if="mTestimony.status_username" class="grey--text text-caption mt-1">Por: {{ mTestimony.status_username }}</div>
              </div>
            </div>
            <div class="mt-2">
              <v-chip v-for="(c, i) in mTestimony.categories || []" :key="i" class="ma-1" color="primary" small>{{ c }}</v-chip>
            </div>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>{{ mTestimony.phone_number || "—" }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>

                  <v-list-item v-if="mTestimony.link">
                    <v-list-item-icon>
                      <v-icon>mdi-link-variant</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <a :href="mTestimony.link" target="_blank" rel="noopener">Ver enlace</a>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <div v-if="mTestimony.link" class="mt-3">
                  <v-responsive v-if="embedSrc" aspect-ratio="16/9">
                    <iframe
                      :src="embedSrc"
                      frameborder="0"
                      style="width: 100%; height: 100%"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowfullscreen
                    ></iframe>
                  </v-responsive>
                  <div v-else class="grey--text text-caption">
                    Vista previa no disponible para este enlace.
                    <a :href="mTestimony.link" target="_blank" rel="noopener">Abrir enlace</a>
                  </div>
                </div>
              </v-col>

              <v-col cols="12" md="8">
                <div class="mb-4">
                  <div class="subtitle-1 font-weight-medium mb-1">Descripción</div>
                  <div class="body-1">{{ mTestimony.description || "—" }}</div>
                </div>
              </v-col>
            </v-row>

            <v-divider class="my-2" />

            <v-row>
              <v-col cols="12" md="6">
                <div class="grey--text text-caption">Creado</div>
                <div>{{ $moment(mTestimony.created_at).format("DD MMM YYYY HH:mm") }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="grey--text text-caption">Última actualización</div>
                <div>{{ $moment(mTestimony.updated_at).format("DD MMM YYYY HH:mm") }}</div>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn text color="primary" @click="$router.push('/testimony')">Volver</v-btn>

            <v-btn class="mr-5" outlined :loading="saving" color="error" @click="updateStatus('rejected')">Rechazar</v-btn>
            <v-btn :loading="saving" large color="success" class="mr-2" @click="updateStatus('approved')">Aprobar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      {{ mTestimony }}
    </v-row>
  </v-container>
</template>

<script>
export default {
  middleware: ["authenticated"],
  async asyncData({ $axios, app, params, store, error }) {
    // const orgIds = await store.dispatch("validatePermission", { permission: "role-update", error })

    const res = await app.$repository.Testimony.show(params.id).catch((e) => {})
    const testimony = res || {}
    return { mTestimony: testimony }
  },
  data() {
    return {
      mTestimony: {},
      saving: false,
    }
  },
  computed: {
    embedSrc() {
      const link = this.mTestimony?.link
      if (!link) return null

      // YouTube watch or short URL -> embed
      const ytMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
      if (ytMatch && ytMatch[1]) {
        return `https://www.youtube.com/embed/${ytMatch[1]}`
      }

      // Vimeo -> embed
      const vimeoMatch = link.match(/vimeo\.com\/(?:video\/)?(\d+)/)
      if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }

      // If it's already an embed url, allow it
      if (link.includes("youtube.com/embed") || link.includes("player.vimeo.com")) return link

      return null
    },
  },

  mounted() {
    const eventBus = this.$eventBus || this.$nuxt
    const roleName = this.mTestimony.name || ""
    eventBus.$emit("setNavBar", {
      title: "Testimonio " + roleName,
      icon: "mdi-comment-text",
      back: "/testimony",
      show_drawer: false,
    })
  },
  methods: {
    async updateStatus(status) {
      if (!this.mTestimony || !this.mTestimony.id) return
      try {
        this.saving = true
        const res = await this.$axios.$put(`/testimony/${this.mTestimony.id}/status`, { status })
        const testimony = res?.testimony || {}
        this.mTestimony = testimony || this.mTestimony
        // this.$notify({ type: "success", text: "Estado de testimonio actualizado" })
      } catch (error) {
        console.error("Error updating status:", error)
        this.$notify({ type: "error", text: error.response?.data?.message || "Error al actualizar estado" })
      } finally {
        this.saving = false
      }
    },
  },
}
</script>
