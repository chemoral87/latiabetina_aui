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
}
