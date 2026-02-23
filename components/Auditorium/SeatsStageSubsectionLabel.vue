<template>
  <v-group :config="{ y: 3 }">
    <v-rect :config="labelBgConfig" />
    <v-text :config="labelTextConfig" />
  </v-group>
</template>

<script>
import { DEFAULT_SETTINGS } from "~/constants/auditorium"

const COLORS = {
  LABEL_TEXT: "#ff9800",
}

export default {
  name: "SeatsStageSubsectionLabel",
  props: {
    subsection: {
      type: Object,
      required: true,
    },
    sectionHeight: {
      type: Number,
      required: true,
    },
  },
  computed: {
    labelBgConfig() {
      return {
        x: 0,
        y: 0,
        width: this.subsection.w || this.subsection.width || 40,
        height: this.sectionHeight - DEFAULT_SETTINGS.SECTION_TOP_PADDING - 30,
        fill: "#424242",
        opacity: 0.3,
        strokeWidth: 2,
        stroke: COLORS.LABEL_TEXT,
        strokeDashArray: [5, 5],
      }
    },

    labelTextConfig() {
      const width = this.subsection.w || this.subsection.width || 40
      const height = this.sectionHeight - DEFAULT_SETTINGS.SECTION_TOP_PADDING - DEFAULT_SETTINGS.SECTION_BOTTOM_PADDING
      return {
        x: width / 2,
        y: height / 2,
        text: this.subsection.n || this.subsection.name,
        fontSize: 14,
        fill: COLORS.LABEL_TEXT,
        fontStyle: "bold",
        align: "center",
        offsetX: width / 2 - 5,
        offsetY: 7,
      }
    },
  },
}
</script>
