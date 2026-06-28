<template>
  <v-row justify="center" class="mb-2" dense>
    <v-col cols="12">
      <v-card elevation="1">
        <div class="d-flex align-center justify-space-between px-4 py-1 calendar-toolbar">
          <button class="month-nav-btn" aria-label="Mes anterior" @click="$emit('prev-month')">
            <v-icon size="22" color="white">mdi-chevron-left</v-icon>
          </button>
          <span class="text-body-1 font-weight-medium text-capitalize calendar-toolbar-title">
            {{ monthNames[calMonth] }} {{ calYear }}
          </span>
          <button class="month-nav-btn" aria-label="Mes siguiente" @click="$emit('next-month')">
            <v-icon size="22" color="white">mdi-chevron-right</v-icon>
          </button>
        </div>

        <div class="big-cal-grid">
          <div v-for="day in weekdayNames" :key="day" class="big-cal-header text-caption font-weight-bold">
            {{ day }}
          </div>

          <div v-for="cell in allCells" :key="cell.iso" class="big-cal-cell" :class="{
            'big-cal-today': cell.isToday,
            'big-cal-other-month': cell.otherMonth,
            'big-cal-has-events': cell.events.length,
            'big-cal-selected': selectedDayIso === cell.iso,
          }" role="button" tabindex="0" @click="selectDay(cell)" @keydown.enter="selectDay(cell)">
            <div class="big-cal-day-header">
              <div class="big-cal-day-number font-weight-bold" :class="{ 'today-badge': cell.isToday }">
                {{ cell.day }}
              </div>
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <button class="cell-add-btn" aria-label="Nuevo evento" v-bind="attrs" v-on="on"
                    @click.stop="$emit('new', cell.iso)">
                    <v-icon size="20" color="success">mdi-plus-circle</v-icon>
                  </button>
                </template>
                <span>Nuevo evento</span>
              </v-tooltip>
            </div>

            <div v-for="event in cell.events" :key="event.id" class="event-pill text-caption d-none d-sm-flex"
              :style="{ borderColor: classificationColor(event.classification) }" :title="event.name">
              <div v-if="event.url_image_s3 || event.url_image" class="event-pill-thumb"
                @click.stop="$emit('edit', event)">
                <img :src="event.url_image_s3 || event.url_image" class="event-thumb-img" />
              </div>
              <div class="event-pill-main" @click.stop="$emit('edit', event)">
                <span class="event-pill-name">{{ event.name }}</span>
                <span v-if="event.time_start" class="event-pill-time">{{ formatEventTime(event.time_start) }}</span>
              </div>
              <div class="event-actions">
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon x-small color="primary" v-bind="attrs" v-on="on" @click.stop="$emit('edit', event)">
                      <v-icon size="14">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Editar</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon x-small color="orange" v-bind="attrs" v-on="on" @click.stop="$emit('copy', event)">
                      <v-icon size="14">mdi-content-copy</v-icon>
                    </v-btn>
                  </template>
                  <span>Copiar</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn icon x-small color="error" v-bind="attrs" v-on="on" @click.stop="$emit('delete', event)">
                      <v-icon size="14">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Eliminar</span>
                </v-tooltip>
              </div>
            </div>

            <div v-if="cell.events.length" class="event-dots d-flex d-sm-none">
              <span v-for="event in cell.events" :key="event.id" class="event-dot"
                :style="{ backgroundColor: classificationColor(event.classification) }"></span>
            </div>
          </div>
        </div>

        <div v-if="!selectedDayIso" class="d-flex d-sm-none align-center justify-center px-4 py-3 mobile-hint">
          <v-icon size="16" class="mr-1 calendar-hint-icon">mdi-calendar-cursor</v-icon>
          <span class="text-caption text-center">Seleccione una fecha con punto para ver los eventos</span>
        </div>

        <div v-if="selectedDayEvents.length" class="d-flex d-sm-none flex-column px-3 pb-3 pt-2 mobile-events">
          <div v-for="event in selectedDayEvents" :key="event.id" class="mobile-event-card"
            :style="{ borderColor: classificationColor(event.classification) }">
            <div class="d-flex align-start justify-space-between">
              <div class="mobile-event-main" @click="$emit('edit', event)">
                <div class="font-weight-bold text-body-2 calendar-primary-text">{{ event.name }}</div>
                <div v-if="event.time_start" class="text-caption grey--text">
                  {{ formatEventTime(event.time_start) }}
                </div>
              </div>
              <div class="d-flex flex-nowrap ml-2">
                <v-btn icon x-small color="primary" aria-label="Editar" @click.stop="$emit('edit', event)">
                  <v-icon size="16">mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon x-small color="orange" aria-label="Copiar" @click.stop="$emit('copy', event)">
                  <v-icon size="16">mdi-content-copy</v-icon>
                </v-btn>
                <v-btn icon x-small color="error" aria-label="Eliminar" @click.stop="$emit('delete', event)">
                  <v-icon size="16">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeClassifications.length" class="d-flex align-center flex-wrap px-4 pb-3 pt-2 legend-row">
          <span v-for="classification in activeClassifications" :key="classification.value"
            class="d-flex align-center legend-item">
            <span class="legend-dot" :style="{ borderColor: classification.hex }"></span>
            <span class="text-caption grey--text text--darken-1">{{ classification.label }}</span>
          </span>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { classifications, classificationColor } from "./classifications.js"

const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

const weekdayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

export default {
  name: "ChurchEventCalendarView",

  props: {
    calYear: { type: Number, required: true },
    calMonth: { type: Number, required: true },
    events: { type: Array, default: () => [] },
  },

  data() {
    return {
      monthNames,
      weekdayNames,
      selectedDayIso: null,
      isMobile: false,
      today: new Date(),
    }
  },

  computed: {
    activeClassifications() {
      const usedValues = new Set(this.events.map(event => event.classification).filter(Boolean))
      return classifications.filter(classification => usedValues.has(classification.value))
    },

    eventsByDate() {
      return this.events.reduce((map, event) => {
        const eventDate = event.event_date || event.end_date || event.start_date || event.publish_date
        if (!eventDate) return map

        const key = eventDate.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key].push(event)
        return map
      }, {})
    },

    selectedDayEvents() {
      if (!this.selectedDayIso) return []
      return this.eventsByDate[this.selectedDayIso] || []
    },

    allCells() {
      return [...this.leadingCells, ...this.monthCells]
    },

    leadingCells() {
      const firstDayOfWeek = new Date(this.calYear, this.calMonth, 1).getDay()
      if (firstDayOfWeek === 0) return []

      const prevMonth = this.calMonth === 0 ? 11 : this.calMonth - 1
      const prevYear = this.calMonth === 0 ? this.calYear - 1 : this.calYear
      const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

      return Array.from({ length: firstDayOfWeek }, (_, index) => {
        const day = daysInPrevMonth - (firstDayOfWeek - 1 - index)
        const iso = this.toIso(prevYear, prevMonth, day)
        return {
          day,
          iso,
          isToday: false,
          otherMonth: true,
          events: this.eventsByDate[iso] || [],
        }
      })
    },

    monthCells() {
      const daysInMonth = new Date(this.calYear, this.calMonth + 1, 0).getDate()
      const result = []

      for (let day = 1; day <= daysInMonth; day += 1) {
        const iso = this.toIso(this.calYear, this.calMonth, day)
        result.push({
          day,
          iso,
          isToday:
            this.calYear === this.today.getFullYear() &&
            this.calMonth === this.today.getMonth() &&
            day === this.today.getDate(),
          otherMonth: false,
          events: this.eventsByDate[iso] || [],
        })
      }

      const lastDayOfWeek = new Date(this.calYear, this.calMonth, daysInMonth).getDay()
      if (lastDayOfWeek < 6) {
        const nextMonth = this.calMonth === 11 ? 0 : this.calMonth + 1
        const nextYear = this.calMonth === 11 ? this.calYear + 1 : this.calYear

        for (let day = 1; day <= 6 - lastDayOfWeek; day += 1) {
          const iso = this.toIso(nextYear, nextMonth, day)
          result.push({
            day,
            iso,
            isToday: false,
            otherMonth: true,
            events: this.eventsByDate[iso] || [],
          })
        }
      }

      return result
    },
  },

  mounted() {
    this.updateIsMobile()
    window.addEventListener("resize", this.updateIsMobile)
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.updateIsMobile)
  },

  methods: {
    updateIsMobile() {
      this.isMobile = window.innerWidth < 600
    },

    selectDay(cell) {
      if (!this.isMobile) return

      if (!cell.events.length) {
        this.selectedDayIso = null
        return
      }

      this.selectedDayIso = this.selectedDayIso === cell.iso ? null : cell.iso
    },

    toIso(year, month, day) {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    },

    classificationColor(value) {
      return classificationColor(value)
    },

    formatEventTime(value) {
      if (!value) return ""

      const [hour = "0", minute = "00"] = String(value).split(":")
      const date = new Date()
      date.setHours(Number(hour), Number(minute), 0, 0)
      return date.toLocaleTimeString("es-MX", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    },
  },
}
</script>

<style scoped>
.calendar-toolbar {
  background: #041845;
}

.calendar-toolbar-title {
  color: #ffffff !important;
}

.big-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 28px;
  grid-auto-rows: minmax(92px, auto);
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
}

.big-cal-header {
  padding: 3px 4px;
  line-height: 22px;
  text-align: center;
  color: #444;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.big-cal-cell {
  min-height: 0;
  padding: 4px;
  border-right: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}

.big-cal-today {
  background: #f5f7fc;
  box-shadow: inset 0 0 0 2px orange;
}

.big-cal-other-month .big-cal-day-number {
  color: #bbb;
}

.big-cal-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
}

.big-cal-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  font-size: 11px;
  color: #444;
  flex-shrink: 0;
}

.today-badge {
  background: #041845;
  color: #fff !important;
}

.cell-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 1;
  line-height: 1;
}

.event-pill {
  position: relative;
  align-items: stretch;
  background: transparent;
  color: #333;
  border-radius: 3px;
  padding: 2px 4px;
  margin-bottom: 2px;
  font-size: 10px;
  line-height: 1.3;
  overflow: hidden;
  border-width: 3px;
  border-style: solid;
  display: flex;
  gap: 4px;
}

.event-pill-thumb {
  flex: 0 0 28%;
  max-width: 28%;
  display: flex;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  border-radius: 2px;
}

.event-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 2px;
}

.event-pill-main {
  flex: 1 1 0;
  min-width: 0;
  padding-right: 38px;
  cursor: pointer;
}

.event-pill-name {
  display: block;
  width: 100%;
  font-weight: 600;
  word-break: break-word;
}

.event-pill-time {
  display: block;
  font-size: 11px;
  opacity: 0.8;
}

.event-actions {
  position: absolute;
  top: 0;
  right: 2px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 0 0 0 4px;
}

.legend-row {
  gap: 12px;
}

.legend-item {
  gap: 5px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: 2px solid;
  background: transparent;
  flex-shrink: 0;
}

.mobile-hint,
.mobile-events {
  border-top: 1px solid #f0f0f0;
}

.calendar-hint-icon {
  color: #041845;
  opacity: 0.6;
}

.calendar-primary-text {
  color: #041845;
}

.event-dots {
  gap: 3px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2px;
}

.event-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mobile-event-card {
  border: 2px solid;
  border-radius: 6px;
  padding: 8px 10px;
  background: #fff;
}

.mobile-event-main {
  min-width: 0;
  flex: 1 1 auto;
  cursor: pointer;
}

.month-nav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
}

.month-nav-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: #fff;
  transform: scale(1.08);
}

.month-nav-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.35);
}

@media (max-width: 600px) {
  .big-cal-grid {
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: 20px;
    grid-auto-rows: 40px;
    border-left: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }

  .big-cal-header {
    padding: 0;
    line-height: 20px;
    height: 20px;
    font-size: 10px;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .big-cal-cell {
    padding: 1px;
    min-height: 0;
    cursor: pointer;
    border-right: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  }

  .big-cal-has-events {
    cursor: pointer;
  }

  .cell-add-btn {
    display: none;
  }
}

.big-cal-selected {
  background: #eef1fa;
  box-shadow: inset 0 0 0 2px #041845;
}
</style>
