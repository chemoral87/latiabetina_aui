<template>
  <v-container fluid class="pa-2 pa-md-4">
    <!-- Header -->
    <v-row class="mb-2">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <span v-if="auditorium && auditorium.name" class="text-h6 text-md-h5">{{ auditorium.name }}</span>
          <v-btn color="primary" :small="$vuetify.breakpoint.mobile" @click="saveAuditorium">
            <v-icon :left="!$vuetify.breakpoint.mobile">mdi-content-save</v-icon>
            <span v-if="!$vuetify.breakpoint.mobile">Guardar</span>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Canvas de Asientos - Primero en mobile -->
      <v-col cols="12" :md="9" :order="$vuetify.breakpoint.mdAndUp ? 2 : 1">
        <AuditoriumSeatsStage :sections="sections" :settings="settings" :stage-config="stageConfig" :categories="stageCategories" />
      </v-col>

      <!-- Panel de Control - Segundo en mobile -->
      <v-col cols="12" :md="3" :order="$vuetify.breakpoint.mdAndUp ? 1 : 2">
        <!-- Botones de Acción -->
        <v-row dense class="mb-3">
          <v-col cols="6" md="12">
            <v-btn color="primary" block :small="$vuetify.breakpoint.mobile" class="mb-md-2" @click="addSection(false)">
              <v-icon :left="$vuetify.breakpoint.mdAndUp" :small="$vuetify.breakpoint.mobile">mdi-plus</v-icon>
              <span :class="{ 'd-none d-sm-inline': $vuetify.breakpoint.mobile }">Agregar sección</span>
            </v-btn>
          </v-col>
          <v-col cols="6" md="12">
            <v-btn color="secondary" block :small="$vuetify.breakpoint.mobile" class="mb-md-2" @click="addSection(true)">
              <v-icon :left="$vuetify.breakpoint.mdAndUp" :small="$vuetify.breakpoint.mobile">mdi-label</v-icon>
              <span :class="{ 'd-none d-sm-inline': $vuetify.breakpoint.mobile }">Agregar etiqueta sección</span>
            </v-btn>
          </v-col>
          <v-col cols="6" md="12">
            <v-btn color="warning" block :small="$vuetify.breakpoint.mobile" class="mb-md-2" @click="clearAllSeatStates">
              <v-icon :left="$vuetify.breakpoint.mdAndUp" :small="$vuetify.breakpoint.mobile">mdi-broom</v-icon>
              <span :class="{ 'd-none d-sm-inline': $vuetify.breakpoint.mobile }">Limpiar categorías</span>
            </v-btn>
          </v-col>
        </v-row>

        <!-- Configuración -->
        <v-card outlined class="mb-3 pa-2">
          <div class="text-subtitle-2 mb-2">Configuración</div>

          <!-- Save Format Toggle -->
          <div class="d-flex align-center mb-2">
            <span class="text-caption mr-2">Formato:</span>
            <v-btn-toggle v-model="saveFormat" mandatory dense borderless>
              <v-btn x-small value="csv" color="primary">
                <v-icon x-small left>mdi-file-delimited</v-icon>CSV
              </v-btn>
              <v-btn x-small value="json" color="primary">
                <v-icon x-small left>mdi-code-json</v-icon>JSON
              </v-btn>
            </v-btn-toggle>
            <v-chip x-small :color="saveFormat === 'csv' ? 'success' : 'info'" class="ml-2">
              {{ saveFormat === 'csv' ? 'Plano CSV' : 'JSON anidado' }}
            </v-chip>
          </div>

          <json-config
            :config-data="configData"
            :config-data-csv="configDataCsv"
            :save-format="saveFormat"
            @imported="handleImportedConfig"
            @import-error="$toast?.error('Error al importar configuración')"
          />

          <v-slider v-model="settings.SEAT_SIZE" :min="5" :max="20" :step="1" label="Tamaño de asiento" thumb-label dense class="mb-1" />

          <v-slider v-model="settings.SEATS_DISTANCE" :min="2" :max="8" :step="1" label="Distancia entre asientos" thumb-label dense class="mb-1" />

          <v-slider v-model="settings.SECTION_TOP_PADDING" :min="0" :max="160" :step="5" label="Padding superior sección" thumb-label dense class="mb-0" />
        </v-card>

        <!-- Lista de Secciones -->
        <div class="text-subtitle-2 mb-2">Secciones</div>
        <v-expansion-panels accordion>
          <v-expansion-panel v-for="(section, sIdx) in sections" :key="`section-${sIdx}`">
            <v-expansion-panel-header>
              <div class="d-flex align-center" style="width: 100%">
                <v-text-field v-model="section.name" dense solo hide-details :style="$vuetify.breakpoint.mobile ? 'max-width: 120px' : 'max-width: 140px'" @click.stop />
                <v-chip v-if="section.isLabel" x-small color="secondary" class="ml-1 ml-md-2">Etiqueta</v-chip>
                <v-spacer />
                <v-btn icon :small="$vuetify.breakpoint.mdAndUp" color="error" @click.stop="removeSection(sIdx)">
                  <v-icon :small="$vuetify.breakpoint.mdAndUp">mdi-delete</v-icon>
                </v-btn>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content v-if="!section.isLabel">
              <v-row dense class="mb-2">
                <v-col cols="6">
                  <v-btn :small="$vuetify.breakpoint.mobile" :x-small="$vuetify.breakpoint.xs" block color="secondary" @click="addSubsection(sIdx, false)">
                    <v-icon :left="$vuetify.breakpoint.smAndUp" :x-small="$vuetify.breakpoint.xs" small>mdi-plus</v-icon>
                    <span :class="{ 'd-none d-sm-inline': $vuetify.breakpoint.xs }">Agregar subsección</span>
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn :small="$vuetify.breakpoint.mobile" :x-small="$vuetify.breakpoint.xs" block color="accent" @click="addSubsection(sIdx, true)">
                    <v-icon :left="$vuetify.breakpoint.smAndUp" :x-small="$vuetify.breakpoint.xs" small>mdi-label-outline</v-icon>
                    <span :class="{ 'd-none d-sm-inline': $vuetify.breakpoint.xs }">Agregar área</span>
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Subsecciones -->
              <v-card v-for="(sub, subIdx) in section.subsections" :key="`sub-${subIdx}`" outlined class="mb-2" :class="$vuetify.breakpoint.mobile ? 'pa-1' : 'pa-2'">
                <div class="d-flex align-center mb-2">
                  <v-text-field v-model="sub.name" :label="sub.isLabel ? 'Nombre área' : 'Nombre subsección'" dense hide-details :style="$vuetify.breakpoint.mobile ? 'font-size: 14px' : ''" />
                  <v-chip v-if="sub.isLabel" x-small color="accent" class="ml-1 ml-md-2">Área</v-chip>
                </div>

                <!-- Ancho de área (solo para etiquetas) -->
                <v-slider v-if="sub.isLabel" v-model="sub.width" :min="50" :max="300" :step="10" label="Ancho del área" thumb-label dense hide-details class="mb-2" />

                <template v-if="!sub.isLabel">
                  <!-- Definir filas y columnas -->
                  <v-row dense class="mb-2">
                    <v-col cols="4" sm="3">
                      <v-text-field v-model.number="sub.tempRows" label="Filas" type="text" dense hide-details />
                    </v-col>
                    <v-col cols="4" sm="3">
                      <v-text-field v-model.number="sub.tempCols" label="Columnas" type="text" dense hide-details />
                    </v-col>
                    <v-col cols="4" sm="2">
                      <v-btn :x-small="$vuetify.breakpoint.xs" small color="primary" @click="setSubsectionGrid(sIdx, subIdx)">Set</v-btn>
                    </v-col>
                  </v-row>

                  <!-- Agregar asiento individual por fila -->
                  <v-divider class="my-2" />
                  <div class="text-caption mb-1">Agregar asiento individual:</div>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-select v-model="selectedRow[`${sIdx}-${subIdx}`]" :items="getRowOptions(sub)" label="Seleccionar fila" dense hide-details />
                    </v-col>
                    <v-col cols="12" sm="6" class="d-flex" style="gap: 4px">
                      <v-btn x-small color="primary" block :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'left')">
                        <v-icon x-small>mdi-arrow-left-circle</v-icon>
                        <span class="ml-1">Izq</span>
                      </v-btn>
                      <v-btn x-small color="primary" block :disabled="!isRowSelected(sIdx, subIdx)" @click="addSeatToRow(sIdx, subIdx, 'right')">
                        <v-icon x-small>mdi-arrow-right-circle</v-icon>
                        <span class="ml-1">Der</span>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-divider class="my-2" />
                </template>

                <div class="d-flex gap-2">
                  <v-spacer />
                  <v-btn icon x-small color="error" @click="removeSubsection(sIdx, subIdx)">
                    <v-icon x-small>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>

    <!-- Debug info (hidden by default) -->
    <div v-if="false">{{ configData }}</div>
  </v-container>
</template>

<script>
// import Vue from "vue"
// import VueKonva from "vue-konva"
import JsonConfig from "~/components/JsonConfig.vue"

import { STAGE_CATEGORIES, CLASS_STROKE_MAP } from "~/constants/auditorium.js"
// Vue.use(VueKonva)

const DEFAULT_SETTINGS = {
  SEAT_SIZE: 12,
  SEATS_DISTANCE: 8,
  SUBSECTION_SPACING: 30,
  SECTIONS_MARGIN: 10,
  SECTION_TOP_PADDING: 80,
  SECTION_SIDE_PADDING: 20,
  SECTION_BOTTOM_PADDING: 20,
}

const COLORS = {
  SEAT_SELECTED: "#1976d2",
  SEAT_FREE: "#1b728d",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
}
// reference https://codesandbox.io/p/sandbox/kind-waterfall-483dgv
export default {
  components: { JsonConfig },
  middleware: ["authenticated"],

  async asyncData({ params, app, error }) {
    let auditorium = {}
    try {
      auditorium = await app.$repository.Auditorium.show(params.id)
    } catch (e) {
      error(app.$handleError(e))
    }
    return { auditorium }
  },

  data() {
    return {
      auditorium: {},
      stageConfig: { width: 900, height: 700 },
      stageCategories: STAGE_CATEGORIES,
      activeSeat: null,
      sections: [],
      selectedRow: {},
      settings: { ...DEFAULT_SETTINGS },
      // 'csv' | 'json' — toggle to switch between flat CSV and nested JSON persistence
      saveFormat: 'csv',
    }
  },

  computed: {
    seatSpacing() {
      return this.settings.SEAT_SIZE + this.settings.SEATS_DISTANCE
    },
    tooltipPos() {
      if (!this.activeSeat) return { x: 0, y: 0 }
      try {
        const parts = String(this.activeSeat.id).split("-")
        // expected id like 'section-1-2-3' -> parts ['section','1','2','3']
        const sectionIdx = Math.max(0, parseInt(parts[1], 10) - 1)
        const subIdx = Math.max(0, parseInt(parts[2], 10) - 1)
        const section = this.sections[sectionIdx]
        if (!section) return { x: this.activeSeat.x, y: this.activeSeat.y }
        const sectionPos = this.getSectionConfig(sectionIdx)
        const subPos = this.getSubsectionPosition(section, subIdx)
        const x = sectionPos.x + subPos.x + this.activeSeat.x + (this.settings.SEAT_SIZE / 2 + 6)
        const y = sectionPos.y + subPos.y + this.activeSeat.y - (this.settings.SEAT_SIZE / 2 + 8)
        return { x, y }
      } catch (err) {
        return { x: this.activeSeat.x, y: this.activeSeat.y }
      }
    },
    configData() {
      // Return a cleaned copy so transient values like category="Ninguno" are not persisted
      const cleaned = JSON.parse(
        JSON.stringify({
          sections: this.sections,
        })
      )

      if (Array.isArray(cleaned.sections)) {
        const sections = cleaned.sections.map((section) => {
          const s = {
            i: section.id,
            n: section.name,
            l: section.isLabel ? 1 : 0,
            ss: [],
          }

          if (Array.isArray(section.subsections)) {
            s.ss = section.subsections.map((sub) => {
              const ss = {
                i: sub.id,
                n: sub.name,
                l: sub.isLabel ? 1 : 0,
                tr: sub.tempRows,
                tc: sub.tempCols,
              }
              if (sub.isLabel) {
                ss.w = sub.width
              } else if (Array.isArray(sub.seats)) {
                ss.s = sub.seats.map((row) => {
                  return row.map((seat) => {
                    if (!seat) return null
                    const rs = {
                      i: seat.id,
                      r: seat.row,
                      c: seat.col,
                    }
                    if (seat.category && seat.category !== "Ninguno") {
                      rs.k = seat.category
                    }
                    return rs
                  })
                })
              }
              return ss
            })
          }
          return s
        })
        return { s: sections }
      }

      return cleaned
    },

    /**
     * Flat CSV representation of the auditorium configuration.
     * Header: type,id,name,level,parent,tr,tc,r,c,k
     *
     * type values:
     *   s    = section
     *   ss   = subsection
     *   seat = individual seat
     */
    configDataCsv() {
      const csvEscape = (v) => {
        if (v === null || v === undefined) return ''
        const s = String(v)
        if (s.includes(',') || s.includes('"') || s.includes('|')) {
          return '"' + s.replace(/"/g, '""') + '"'
        }
        return s
      }

      const rows = ['type,id,name,level,parent,tr,tc,r,c,k']

      this.sections.forEach((section) => {
        rows.push([
          's',
          csvEscape(section.id),
          csvEscape(section.name),
          csvEscape(section.isLabel ? 1 : 0),
          '', '', '', '', '', ''
        ].join(','))

        if (Array.isArray(section.subsections)) {
          section.subsections.forEach((sub) => {
            rows.push([
              'ss',
              csvEscape(sub.id),
              csvEscape(sub.name),
              csvEscape(sub.isLabel ? 1 : 0),
              csvEscape(section.id),
              csvEscape(sub.isLabel ? '' : (sub.tempRows !== undefined ? sub.tempRows : '')),
              csvEscape(sub.isLabel ? '' : (sub.tempCols !== undefined ? sub.tempCols : '')),
              '', '', ''
            ].join(','))

            if (!sub.isLabel && Array.isArray(sub.seats)) {
              sub.seats.forEach((row) => {
                row.forEach((seat) => {
                  if (!seat) return
                  const cat = seat.category && seat.category !== 'Ninguno' ? seat.category : ''
                  rows.push([
                    'seat',
                    csvEscape(seat.id),
                    '', '', '', '', '',
                    csvEscape(seat.row),
                    csvEscape(seat.col),
                    csvEscape(cat)
                  ].join(','))
                })
              })
            }
          })
        }
      })

      return rows.join('|')
    },
  },

  watch: {
    "settings.SEAT_SIZE": "forceUpdate",
    "settings.SEATS_DISTANCE": "forceUpdate",
  },

  mounted() {
    // Configurar navbar directamente sin mixin
    const eventBus = this.$eventBus || this.$nuxt
    eventBus.$emit("setNavBar", {
      title: "Editor Auditorio",
      icon: "mdi-seat-outline",
      back: "/auditorium",
    })

    // Ajustar tamaño del canvas según el viewport
    this.updateStageSize()
    window.addEventListener("resize", this.updateStageSize)
    this.loadConfiguration()
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateStageSize)
  },

  methods: {
    updateStageSize() {
      // Ajustar el tamaño del canvas según el viewport
      const width = window.innerWidth
      if (width < 600) {
        // Mobile - restar padding del container (pa-2 = 8px * 2) + padding del sheet (pa-2 = 8px * 2)
        this.stageConfig.width = Math.max(width - 48, 280)
        this.stageConfig.height = 450
      } else if (width < 960) {
        // Tablet
        this.stageConfig.width = Math.min(width - 64, 700)
        this.stageConfig.height = 600
      } else {
        // Desktop
        this.stageConfig.width = 900
        this.stageConfig.height = 700
      }
    },
    forceUpdate() {
      this.$forceUpdate()
    },

    /**
     * Returns true when the raw config value is a CSV string (starts with our header).
     */
    _isCsvConfig(raw) {
      return typeof raw === 'string' && raw.trimStart().startsWith('type,id,name,')
    },

    /**
     * Parse a flat CSV config string back into the internal `sections` array.
     * Header: type,id,name,level,parent,tr,tc,r,c,k
     */
    _parseCsvConfig(csvString) {
      const lines = csvString.split('|').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) return []

      const parseCsvLine = (line) => {
        const fields = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const ch = line[i]
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
            else { inQuotes = !inQuotes }
          } else if (ch === ',' && !inQuotes) {
            fields.push(current); current = ''
          } else {
            current += ch
          }
        }
        fields.push(current)
        return fields
      }

      const header = lines[0].split(',')
      const idx = {}
      header.forEach((h, i) => { idx[h.trim()] = i })

      const sections = []
      let currentSection = null
      let currentSub = null

      for (let li = 1; li < lines.length; li++) {
        const f = parseCsvLine(lines[li])
        const type   = f[idx.type]   || ''
        const id     = f[idx.id]     || ''
        const name   = f[idx.name]   || ''
        const level  = parseInt(f[idx.level]  || '0', 10)
        const tr     = f[idx.tr] !== '' && f[idx.tr] !== undefined ? parseInt(f[idx.tr], 10) : undefined
        const tc     = f[idx.tc] !== '' && f[idx.tc] !== undefined ? parseInt(f[idx.tc], 10) : undefined
        const r      = f[idx.r]  !== '' && f[idx.r]  !== undefined ? parseInt(f[idx.r],  10) : undefined
        const c      = f[idx.c]  !== '' && f[idx.c]  !== undefined ? parseInt(f[idx.c],  10) : undefined
        const k      = (f[idx.k] || '').trim()

        if (type === 's') {
          currentSection = { id, name, isLabel: level === 1, subsections: [] }
          currentSub = null
          sections.push(currentSection)
        } else if (type === 'ss' && currentSection) {
          currentSub = { id, name, isLabel: level === 1 }
          if (currentSub.isLabel) {
            currentSub.width = 100
          } else {
            currentSub.tempRows = tr
            currentSub.tempCols = tc
            currentSub.seats = []
          }
          currentSection.subsections.push(currentSub)
        } else if (type === 'seat' && currentSub && !currentSub.isLabel) {
          const rowIdx = r
          while (currentSub.seats.length <= rowIdx) { currentSub.seats.push([]) }
          const seat = { id, row: r, col: c }
          if (k) seat.category = k
          currentSub.seats[rowIdx].push(seat)
        }
      }

      return sections
    },

    loadConfiguration() {
      if (!this.auditorium?.config) {
        console.warn("No se encontró configuración para cargar")
        return
      }

      const raw = this.auditorium.config

      // ── CSV path ──────────────────────────────────────────────────────────
      if (this._isCsvConfig(raw)) {
        this.saveFormat = 'csv'
        this.sections = this._parseCsvConfig(raw)
        return
      }

      // ── JSON path ─────────────────────────────────────────────────────────
      this.saveFormat = 'json'
      let config = raw
      if (typeof config === 'string') {
        try {
          config = JSON.parse(config)
        } catch (e) {
          console.error('Error parsing config:', e)
          return
        }
      }

      if (config.s || config.sections) {
        const rawSections = config.s || config.sections
        const cleanSections = rawSections.map((section, sIdx) => {
          const s = {
            id: section.i || section.id || `${sIdx + 1}`,
            name: section.n || section.name,
            isLabel: !!(section.l || section.isLabel),
            subsections: [],
          }

          if (section.ss || section.subsections) {
            const rawSubs = section.ss || section.subsections
            s.subsections = rawSubs.map((sub, subIdx) => {
              const ss = {
                id: sub.i || sub.id || `${s.id}-${subIdx + 1}`,
                name: sub.n || sub.name,
                isLabel: !!(sub.l || sub.isLabel),
              }
              if (ss.isLabel) {
                ss.width = sub.w || sub.width
              } else {
                ss.tempRows = sub.tr || sub.tempRows
                ss.tempCols = sub.tc || sub.tempCols
                const rawSeats = sub.s || sub.seats
                if (rawSeats) {
                  ss.seats = rawSeats.map((row, rowIdx) => {
                    return row.map((seat, colIdx) => {
                      if (!seat) return null
                      return {
                        id: seat.i || seat.id || `${ss.id}-${rowIdx + 1}-${colIdx + 1}`,
                        row: seat.r !== undefined ? seat.r : seat.row,
                        col: seat.c !== undefined ? seat.c : seat.col,
                        category: seat.k || seat.category,
                      }
                    })
                  })
                }
              }
              return ss
            })
          }
          return s
        })
        this.sections = cleanSections
      }
    },

    async saveAuditorium() {
      try {
        // Verify subsection IDs before saving
        this.verifySubsectionIds()

        let configString
        if (this.saveFormat === 'csv') {
          // Store as plain flat CSV string
          configString = this.configDataCsv
        } else {
          // Store as compact nested JSON string
          configString = JSON.stringify(this.configData)
        }

        this.auditorium.config = configString
        const payload = {
          ...this.auditorium,
          name: this.auditorium.name,
          org_id: this.auditorium.org_id?.id ?? this.auditorium.org_id,
          config: configString,
        }
        await this.$repository.Auditorium.update(this.auditorium.id, payload)
        this.$toast?.success && this.$toast.success('Configuración guardada')
      } catch (e) {
        this.$handleError(e)
      }
    },

    verifySubsectionIds() {
      let configModified = false

      this.sections.forEach((section, sIdx) => {
        const expectedSectionId = `${sIdx + 1}`
        if (section.id !== expectedSectionId) {
          console.warn(`Section ID mismatch: expected ${expectedSectionId}, got ${section.id}`)
          section.id = expectedSectionId
          configModified = true
        }

        if (section.subsections) {
          section.subsections.forEach((sub, subIdx) => {
            const expectedSubId = `${section.id}-${subIdx + 1}`
            if (sub.id !== expectedSubId) {
              console.warn(`Subsection ID mismatch: expected ${expectedSubId}, got ${sub.id}`)
              sub.id = expectedSubId
              configModified = true
            }

            // Also verify seat IDs if they exist
            if (sub.seats && Array.isArray(sub.seats)) {
              sub.seats.forEach((row, rowIdx) => {
                if (Array.isArray(row)) {
                  row.forEach((seat, colIdx) => {
                    if (seat) {
                      const expectedSeatId = `${section.id}-${subIdx + 1}-${rowIdx + 1}-${colIdx + 1}`
                      if (seat.id !== expectedSeatId) {
                        console.warn(`Seat ID mismatch: expected ${expectedSeatId}, got ${seat.id}`)
                        seat.id = expectedSeatId
                        seat.row = rowIdx
                        seat.col = colIdx
                        configModified = true
                      }
                    }
                  })
                }
              })
            }
          })
        }
      })

      if (configModified) {
        console.log("Configuration IDs were corrected")
        // Update the auditorium config to reflect the changes
        this.auditorium.config = this.configData
        this.$forceUpdate()
      }

      return configModified
    },

    // ============ OPERACIONES DE SECCIÓN ============
    addSection(isLabel) {
      const sectionIdx = this.sections.length
      const sectionId = `${sectionIdx + 1}`
      const section = {
        id: sectionId,
        name: `${isLabel ? "Etiqueta" : "Sección"} ${sectionIdx + 1}`,
        isLabel,
        subsections: [],
      }
      if (!isLabel) {
        section.subsections.push(this.createSubsection("Subsección 1", false, 4, 4, sectionIdx, 0, sectionId))
      }
      this.sections.push(section)
    },

    removeSection(sIdx) {
      this.sections.splice(sIdx, 1)
    },

    addSubsection(sIdx, isLabel) {
      const section = this.sections[sIdx]
      const subIdx = section.subsections.length
      const name = `${isLabel ? "Área" : "Subsección"} ${subIdx + 1}`
      section.subsections.push(this.createSubsection(name, isLabel, 3, 5, sIdx, subIdx, section.id))
    },

    removeSubsection(sIdx, subIdx) {
      this.sections[sIdx].subsections.splice(subIdx, 1)
    },

    createSubsection(name, isLabel, rows = 3, cols = 5, sectionIdx = "", subIdx = "", sectionId = "") {
      const subId = `${sectionId}-${subIdx + 1}`
      const sub = { id: subId, name, isLabel, seats: [] }
      if (isLabel) {
        sub.width = 100
      } else {
        sub.seats = this.createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId)
        sub.tempRows = rows
        sub.tempCols = cols
      }
      return sub
    },

    setSubsectionGrid(sIdx, subIdx) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const rows = Math.max(1, Math.min(20, parseInt(sub.tempRows) || 3))
      const cols = Math.max(1, Math.min(30, parseInt(sub.tempCols) || 5))
      sub.seats = this.createSeatsGrid(rows, cols, sIdx, subIdx, section.id)
      this.$forceUpdate()
    },

    clearAllSeatStates() {
      if (!Array.isArray(this.sections)) return
      this.sections.forEach((section) => {
        if (!Array.isArray(section.subsections)) return
        section.subsections.forEach((sub) => {
          if (!Array.isArray(sub.seats)) return
          sub.seats.forEach((row) => {
            if (!Array.isArray(row)) return
            row.forEach((seat) => {
              if (seat && "category" in seat) {
                this.$delete(seat, "category")
              }
            })
          })
        })
      })
      this.$forceUpdate()
      this.$toast?.success && this.$toast.success("Categorías eliminadas")
    },

    getRowOptions(sub) {
      return sub.seats.map((_, idx) => ({
        text: `Fila ${idx + 1}`,
        value: idx,
      }))
    },

    getMaxColumns(sub) {
      return sub.seats?.length ? Math.max(...sub.seats.map((row) => row.length)) : 0
    },

    isRowSelected(sIdx, subIdx) {
      const key = `${sIdx}-${subIdx}`
      return this.selectedRow[key] !== undefined && this.selectedRow[key] !== null
    },

    addSeatToRow(sIdx, subIdx, side) {
      const section = this.sections[sIdx]
      const sub = section.subsections[subIdx]
      const selectedRowIdx = this.selectedRow[`${sIdx}-${subIdx}`]
      if (!this.isRowSelected(sIdx, subIdx)) return
      const selectedRow = sub.seats[selectedRowIdx]
      if (side === "left") {
        selectedRow.unshift(this.createSeat(0, selectedRowIdx, sIdx, subIdx, section.id))
      } else {
        selectedRow.push(this.createSeat(selectedRow.length, selectedRowIdx, sIdx, subIdx, section.id))
      }
      this.$forceUpdate()
    },

    // ============ CREACIÓN DE ASIENTOS ============
    createSeatsGrid(rows, cols, sectionIdx, subIdx, sectionId = "") {
      return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => this.createSeat(c, r, sectionIdx, subIdx, sectionId)))
    },

    createSeat(col, row, sectionIdx = "", subIdx = "", sectionId = "") {
      // sectionId: 'section-1', subIdx: 0, row: 0, col: 0 => 'section-1-1-1-1'
      return {
        id: `${sectionId}-${subIdx + 1}-${row + 1}-${col + 1}`,
        row,
        col,
      }
    },

    // ============ MANEJO DE EVENTOS ============
    handleSeatClick(seat, e) {
      // Toggle selection if not reserved
      if (seat.state !== "reserved") {
        seat.state = seat.state === "selected" ? "free" : "selected"
      }
      // Open tooltip for this seat
      this.activeSeat = seat
      this.$forceUpdate()

      // After DOM update, move the tooltip group to top of its layer so it renders above seats
      this.$nextTick(() => {
        try {
          const stage = e && e.target && e.target.getStage ? e.target.getStage() : null
          if (!stage) return
          const tooltipNode = stage.findOne("." + ("tooltip-" + seat.id))
          if (tooltipNode && tooltipNode.moveToTop) {
            tooltipNode.moveToTop()
            const layer = tooltipNode.getLayer && tooltipNode.getLayer()
            if (layer && layer.draw) layer.draw()
          }
        } catch (err) {
          // ignore
        }
      })
    },

    setSeatCategory(seat, category) {
      if (!seat) return

      // Derive normalized category label from the page's `stageCategories`
      // Find original seat object in sections (getSubsectionSeats returns copies)
      const original = this.findSeatById(seat.id)
      let value
      if (category == null) {
        value = "Ninguno"
      } else {
        const match = (this.stageCategories || []).find((c) => String(c.value) === String(category) || String(c.label) === String(category))
        value = match ? match.label : category
      }

      if (original) {
        this.$set(original, "category", value)
      } else {
        this.$set(seat, "category", value)
      }

      // Close tooltip after selection
      this.activeSeat = null
      this.$forceUpdate()
    },

    findSeatById(id) {
      if (!id) return null
      for (let s = 0; s < this.sections.length; s++) {
        const section = this.sections[s]
        for (let subIdx = 0; subIdx < (section.subsections?.length || 0); subIdx++) {
          const sub = section.subsections[subIdx]
          if (!sub.seats) continue
          for (let r = 0; r < sub.seats.length; r++) {
            const row = sub.seats[r]
            for (let c = 0; c < row.length; c++) {
              const seat = row[c]
              if (seat && seat.id === id) return seat
            }
          }
        }
      }
      return null
    },

    handleStageClick(e) {
      // Close tooltip when clicking outside a seat (i.e. target is not a Circle nor inside one)
      let node = e.target
      while (node) {
        const cls = node.getClassName && node.getClassName()
        if (cls === "Circle") return
        if (cls === "Stage") break
        node = node.getParent()
      }
      this.activeSeat = null
      this.$forceUpdate()
    },

    handleSeatHover(e) {
      const container = e.target.getStage().container()
      container.style.cursor = e.target.attrs.opacity < 1 ? "not-allowed" : "pointer"
    },

    handleSeatLeave(e) {
      e.target.getStage().container().style.cursor = "default"
    },

    // ============ CONFIGURACIONES DE KONVA ============
    getSectionConfig(sIdx) {
      const section = this.sections[sIdx]
      const y = this.sections.slice(0, sIdx).reduce((acc, s) => acc + this.getSectionHeight(s) + this.settings.SECTIONS_MARGIN, this.settings.SECTION_TOP_PADDING)

      return {
        x: (this.stageConfig.width - this.getSectionWidth(section)) / 2,
        y,
      }
    },

    getSectionBgConfig(section) {
      return {
        width: this.getSectionWidth(section),
        height: this.getSectionHeight(section),
        fill: COLORS.SECTION_BG,
        strokeWidth: 1,
        stroke: "lightgrey",
        cornerRadius: 5,
      }
    },

    getSectionTitleConfig(section) {
      return {
        x: 0,
        y: section.isLabel ? 0 : this.settings.SECTION_TOP_PADDING / 4,
        text: section.name,
        fontSize: section.isLabel ? 24 : 20,
        fill: section.isLabel ? "#1976d2" : "#fff",
        fontStyle: "bold",
        fontFamily: "Arial",
        align: section.isLabel ? "left" : "center",
        width: section.isLabel ? undefined : this.getSectionWidth(section),
      }
    },

    getSubsectionPosition(section, subIdx) {
      const x = section.subsections.slice(0, subIdx).reduce((acc, s) => acc + (s.isLabel ? s.width || 100 : this.getSubsectionWidth(s)), 0) + subIdx * this.settings.SUBSECTION_SPACING + this.settings.SECTION_SIDE_PADDING

      return { x, y: this.settings.SECTION_TOP_PADDING }
    },

    getSubsectionRectConfig(sub) {
      return {
        width: this.getSubsectionWidth(sub),
        height: this.getSubsectionHeight(sub),
        fill: COLORS.SUBSECTION_BG,
        stroke: "green",
        strokeWidth: 2,
      }
    },

    getSubsectionTitleConfig(sub) {
      return {
        x: 0,
        y: -15,
        text: sub.name,
        fontSize: 11,
        fill: "#fff",
        fontFamily: "Arial",
        align: "left",
        width: this.getSubsectionWidth(sub),
      }
    },

    getSubsectionLabelBgConfig(sub, section) {
      return {
        width: sub.width || 100,
        height: this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING,
        fill: "#424242",
        opacity: 0.3,
        strokeWidth: 2,
        stroke: COLORS.LABEL_TEXT,
        strokeDashArray: [5, 5],
      }
    },

    getSubsectionLabelTextConfig(sub, section) {
      const width = sub.width || 100
      const height = this.getSectionHeight(section) - this.settings.SECTION_TOP_PADDING - this.settings.SECTION_BOTTOM_PADDING

      return {
        x: width / 2,
        y: height / 2,
        text: sub.name,
        fontSize: 14,
        fill: COLORS.LABEL_TEXT,
        fontStyle: "bold",
        fontFamily: "Arial",
        align: "center",
        offsetX: width / 2 - 5,
        offsetY: 7,
      }
    },

    getRowLabelConfig(rowIdx) {
      return {
        x: -15,
        y: rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
        text: (rowIdx + 1).toString(),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "right",
        verticalAlign: "middle",
        offsetY: 3,
      }
    },

    getColLabelConfig(colIdx, sub) {
      return {
        x: colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
        y: this.getSubsectionHeight(sub) + 5,
        text: String.fromCharCode(65 + colIdx),
        fontSize: 8,
        fill: "yellow",
        fontFamily: "Arial",
        align: "center",
        offsetX: 3,
      }
    },

    getSubsectionSeats(sub) {
      const allSeats = []
      sub.seats.forEach((row, rowIdx) => {
        row.forEach((seat, colIdx) => {
          if (seat.state !== "invisible") {
            allSeats.push({
              ...seat,
              x: colIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
              y: rowIdx * this.seatSpacing + this.settings.SEAT_SIZE / 2,
            })
          }
        })
      })
      return allSeats
    },

    getSeatConfig(seat) {
      const isReserved = seat.state === "reserved"
      const isSelected = seat.state === "selected"
      // Border color/width override when seat has a category
      const category = seat.category ? String(seat.category).toLowerCase() : null
      const classStrokeMap = CLASS_STROKE_MAP

      let stroke = isSelected ? COLORS.SEAT_SELECTED : "#757575"
      let strokeWidth = 1

      if (category && classStrokeMap[category]) {
        stroke = classStrokeMap[category]
        strokeWidth = 4
      }

      return {
        x: seat.x,
        y: seat.y,
        radius: this.settings.SEAT_SIZE / 2,
        fill: isSelected ? COLORS.SEAT_SELECTED : isReserved ? COLORS.SEAT_RESERVED : COLORS.SEAT_FREE,
        stroke,
        strokeWidth,
        opacity: isReserved ? 0.6 : 1,
      }
    },

    // ============ CÁLCULOS DE DIMENSIONES ============
    getSubsectionWidth(sub) {
      if (sub.isLabel) return sub.width || 100
      if (!sub.seats?.length) return 0
      const maxCols = Math.max(...sub.seats.map((row) => row.length))
      return maxCols * this.seatSpacing - this.settings.SEATS_DISTANCE
    },

    getSubsectionHeight(sub) {
      if (sub.isLabel) return 0
      if (!sub.seats?.length) return 40
      return sub.seats.length * this.seatSpacing - this.settings.SEATS_DISTANCE
    },

    getSectionWidth(section) {
      if (section.isLabel) return 0
      if (!section.subsections.length) return 0

      return (
        section.subsections.reduce((acc, s) => acc + (s.isLabel ? s.width || 100 : this.getSubsectionWidth(s)), 0) +
        (section.subsections.length - 1) * this.settings.SUBSECTION_SPACING +
        this.settings.SECTION_SIDE_PADDING * 2
      )
    },

    getSectionHeight(section) {
      if (section.isLabel) return 30
      if (!section.subsections?.length) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING

      const maxRows = Math.max(...section.subsections.map((sub) => (sub.isLabel ? 0 : sub.seats?.length || 0)))

      if (maxRows === 0) return this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING + 40

      return maxRows * this.seatSpacing - this.settings.SEATS_DISTANCE + this.settings.SECTION_TOP_PADDING + this.settings.SECTION_BOTTOM_PADDING
    },

    // Handle configuration object/string emitted by JsonConfig component
    handleImportedConfig(config) {
      try {
        // CSV string import path
        if (typeof config === 'string' && this._isCsvConfig(config)) {
          this.auditorium.config = config
          this.loadConfiguration()
          this.$forceUpdate()
          this.$toast?.success
            ? this.$toast.success('Configuración CSV importada')
            : alert('Configuración CSV importada correctamente')
          return
        }

        // JSON object import path
        if (!config || (!config.s && !config.sections)) {
          alert('Archivo inválido: falta estructura requerida')
          return
        }

        this.auditorium.config = config
        this.loadConfiguration()
        this.$forceUpdate()
        this.$toast?.success
          ? this.$toast.success('Configuración JSON importada')
          : alert('Configuración importada correctamente')
      } catch (error) {
        alert('Error al importar: ' + error.message)
      }
    },
  },
}
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}

/* Mejoras para mobile */
@media (max-width: 600px) {
  ::v-deep .v-expansion-panel-header {
    padding: 8px 12px;
    min-height: 48px !important;
  }

  ::v-deep .v-expansion-panel-content__wrap {
    padding: 8px 12px;
  }

  ::v-deep .v-text-field--dense {
    font-size: 14px;
  }

  ::v-deep .v-btn--small {
    height: 32px !important;
    font-size: 13px;
  }

  ::v-deep .v-btn--x-small {
    height: 24px !important;
    padding: 0 6px !important;
    font-size: 11px;
  }

  ::v-deep .v-slider {
    margin-top: 8px;
  }

  ::v-deep .v-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12) !important;
  }
}

/* Asegurar que los botones tengan buen tamaño táctil en mobile */
@media (max-width: 960px) {
  ::v-deep .v-btn {
    min-height: 36px;
  }

  ::v-deep .v-icon {
    font-size: 20px;
  }
}
</style>
