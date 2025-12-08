export const state = () => ({
  sensitivity: 0.003,
  selectedRootNote: "C",
  latinNotation: false,
  showMicrotones: true,
  maxHistory: 400,
  totalNotes: 14,
  histogramHeight: 350,
})

export const getters = {
  selectedRootNote(state) {
    return state.selectedRootNote
  },
  sensitivity(state) {
    return state.sensitivity
  },
  latinNotation(state) {
    return state.latinNotation
  },
  maxHistory(state) {
    return state.maxHistory
  },
  totalNotes(state) {
    return state.totalNotes
  },
  showMicrotones(state) {
    return state.showMicrotones
  },
}

export const mutations = {
  SET_ROOT_NOTE(state, note) {
    state.selectedRootNote = note
  },
  SET_SENSITIVITY(state, sensitivity) {
    state.sensitivity = sensitivity
  },
  SET_LATIN_NOTATION(state, latinNotation) {
    state.latinNotation = latinNotation
  },
  SET_MAX_HISTORY(state, maxHistory) {
    if (maxHistory < 300) {
      maxHistory = 300
    } else if (maxHistory > 800) {
      maxHistory = 800
    }
    state.maxHistory = maxHistory
  },
  SET_TOTAL_NOTES(state, totalNotes) {
    if (totalNotes < 13) {
      totalNotes = 13
    } else if (totalNotes > 25) {
      totalNotes = 25
    }
    state.totalNotes = totalNotes
  },
  SET_HISTOGRAM_HEIGHT(state, histogramHeight) {
    if (histogramHeight < 300) {
      histogramHeight = 300
    } else if (histogramHeight > 600) {
      histogramHeight = 600
    }
    state.histogramHeight = histogramHeight
  },
  SET_SHOW_MICROTONES(state, showMicrotones) {
    state.showMicrotones = showMicrotones
  },
}

export const actions = {
  updateRootNote({ commit }, note) {
    commit("SET_ROOT_NOTE", note)
  },
  async hydrate({ commit }) {
    if (typeof process !== "undefined" && !process.client) return

    let localforage
    try {
      const lfModule = await import("localforage")
      localforage = lfModule.default || lfModule
    } catch (e) {
      // localforage not available
      // eslint-disable-next-line no-console
      console.warn("hydrate: localforage not available", e)
      return
    }

    const KEY = "mazapan_v1"
    try {
      const saved = await localforage.getItem(KEY)
      if (!saved || typeof saved !== "object") return
      const payload = saved.pitcher_store || saved.pitcherStore || saved.pitcher_store
      if (!payload || typeof payload !== "object") return

      const moduleKey = Object.keys(this.state).find((k) => k === "pitcher" || k === "pitcher_store" || k.includes("pitcher")) || null

      const mutationMap = {
        sensitivity: "SET_SENSITIVITY",
        selectedRootNote: "SET_ROOT_NOTE",
        latinNotation: "SET_LATIN_NOTATION",
        maxHistory: "SET_MAX_HISTORY",
        totalNotes: "SET_TOTAL_NOTES",
        histogramHeight: "SET_HISTOGRAM_HEIGHT",
        showMicrotones: "SET_SHOW_MICROTONES",
      }

      Object.keys(payload).forEach((prop) => {
        const mutation = mutationMap[prop]
        if (mutation && moduleKey) {
          const namespaced = `${moduleKey}/${mutation}`
          const canNamespaced = this._mutations && this._mutations[namespaced]
          try {
            if (canNamespaced) {
              commit(namespaced, payload[prop])
              return
            }
          } catch (err) {
            // fallthrough to commit root
          }
        }

        // fallback: try direct commit (non-namespaced) or set directly
        try {
          commit(mutation || prop, payload[prop])
        } catch (err) {
          try {
            if (moduleKey) this.state[moduleKey][prop] = payload[prop]
          } catch (e) {
            // ignore
          }
        }
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("hydrate: failed to read persisted state", err)
    }
  },
}
