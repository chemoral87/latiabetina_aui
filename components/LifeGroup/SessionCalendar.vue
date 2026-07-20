<template>
  <div>
    <FullCalendar
      ref="calendar"
      :options="calendarOptions"
    />
  </div>
</template>

<script>
import FullCalendar from "@fullcalendar/vue"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import timeGridPlugin from "@fullcalendar/timegrid"

export default {
  name: "LifeGroupSessionCalendar",

  components: {
    FullCalendar,
  },

  props: {
    sessions: {
      type: Array,
      default: () => [],
    },
    lifeGroupName: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
        initialView: "dayGridMonth",
        locale: "es",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek",
        },
        buttonText: {
          today: "Hoy",
          month: "Mes",
          week: "Semana",
        },
        editable: true,
        selectable: false,
        dayMaxEvents: true,
        weekends: true,
        eventClick: this.handleEventClick,
        eventDrop: this.handleEventDrop,
        eventResize: this.handleEventResize,
        eventDidMount: this.handleEventDidMount,
        events: [],
      },
    }
  },

  watch: {
    sessions: {
      immediate: true,
      handler(val) {
        this.updateEvents(val)
      },
    },
  },

  methods: {
    updateEvents(sessions) {
      if (!sessions || !sessions.length) {
        this.calendarOptions.events = []
        return
      }

      this.calendarOptions.events = sessions.map((s) => ({
        id: String(s.id),
        title: `Sem ${s.week_number} - ${this.lifeGroupName || "Red"}`,
        start: s.date,
        extendedProps: {
          week_number: s.week_number,
          status: s.status,
          notes: s.notes,
          session_id: s.id,
        },
        className: `fc-event-${s.status}`,
        backgroundColor: this.statusColor(s.status),
        borderColor: this.statusColor(s.status),
        textColor: "#fff",
      }))
    },

    statusColor(status) {
      const map = { scheduled: "#1976D2", completed: "#4CAF50", cancelled: "#f44336", rescheduled: "#FF9800" }
      return map[status] || "#9E9E9E"
    },

    handleEventClick(info) {
      const props = info.event.extendedProps
      this.$emit("session-click", {
        id: parseInt(info.event.id),
        week_number: props.week_number,
        status: props.status,
        notes: props.notes,
        date: info.event.startStr,
      })
    },

    handleEventDrop(info) {
      const sessionId = parseInt(info.event.id)
      const newDate = info.event.startStr
      this.$emit("session-drop", { id: sessionId, date: newDate })
    },

    handleEventResize(info) {
      // Not needed for our use case, but required by FullCalendar
    },

    handleEventDidMount(info) {
      // Add a tooltip or style based on status
      const status = info.event.extendedProps.status
      if (status === "completed") {
        info.el.style.opacity = "0.7"
      }
    },

    getApi() {
      return this.$refs.calendar?.getApi()
    },
  },
}
</script>

<style>
/* FullCalendar overrides for Vuetify */
.fc {
  font-family: "Roboto", sans-serif !important;
}
.fc .fc-toolbar-title {
  font-size: 1.2em !important;
  font-weight: 500 !important;
}
.fc .fc-button-primary {
  background-color: #1976D2 !important;
  border-color: #1976D2 !important;
}
.fc .fc-button-primary:not(:disabled).fc-button-active {
  background-color: #1565C0 !important;
  border-color: #1565C0 !important;
}
.fc .fc-daygrid-event {
  border-radius: 4px !important;
  padding: 2px 4px !important;
  font-size: 0.8em !important;
}
.fc-event-cancelled {
  text-decoration: line-through !important;
}
</style>
