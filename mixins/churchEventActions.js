/**
 * Shared actions mixin for ChurchEvent pages (index & calendar).
 *
 * Each page must implement:
 *   - loadChurchEvents(overrides) — triggers a data reload
 *   - routeQuery()               — returns extra route query params for edit/new navigation
 *   - deleteReloadOverrides()    — returns extra overrides passed to loadChurchEvents after delete
 *
 * Each page must provide in data():
 *   - churchEventDialogCopy, copyingChurchEvent, copying
 *   - churchEventDialogDelete, dialogDelete, deleting
 *   - skipFilterWatch, filterChurchEvent
 */
export default {
  methods: {
    // ── Copy ────────────────────────────────────────────────────────────────

    openCopyDialog(item) {
      this.copyingChurchEvent = item
      this.churchEventDialogCopy = true
    },

    async copyChurchEvent({ churchEvent, dates }) {
      try {
        this.copying = true
        const result = await this.$repository.ChurchEvent.copy(churchEvent.id, { dates })

        this.churchEventDialogCopy = false

        const created = result?.created ?? []
        const skipped = result?.skipped ?? []

        if (created.length > 0) {
          this.$notify({ type: 'success', message: `${created.length} evento(s) copiado(s) correctamente.` })
        }

        if (skipped.length > 0) {
          const dateList = skipped.map(d => this.$moment(d).format('D MMM. YYYY')).join(', ')
          this.$notify({ type: 'warning', message: `Las siguientes fechas no se copiaron porque ya existe un evento con el mismo nombre: ${dateList}` })
        }

        if (created.length === 0 && skipped.length === 0) {
          this.$notify({ type: 'warning', message: 'No se copiaron eventos.' })
        }

        await this.loadChurchEvents()
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        } else {
          console.error(error)
        }
      } finally {
        this.copying = false
      }
    },

    // ── Edit ────────────────────────────────────────────────────────────────

    editChurchEvent(item) {
      this.$router.push({
        path: `/church-event/${item.id}`,
        query: this.routeQuery(),
      })
    },

    // ── Delete ──────────────────────────────────────────────────────────────

    beforeDeleteChurchEvent(item) {
      this.dialogDelete = {
        text: 'Desea eliminar el Evento ',
        strong: item.name,
        text2: '?',
        payload: item,
      }
      this.churchEventDialogDelete = true
    },

    async deleteChurchEvent(item) {
      try {
        this.deleting = true
        await this.$repository.ChurchEvent.delete(item.id, item)

        this.skipFilterWatch = true
        this.filterChurchEvent = ''
        await this.loadChurchEvents({ filter: '', ...this.deleteReloadOverrides() })

        this.churchEventDialogDelete = false
      } catch (error) {
        if (this.$handleError) {
          this.$handleError(error)
        } else {
          console.error(error)
        }
      } finally {
        this.deleting = false
      }
    },
  },
}
