<template>
  <v-menu offset-y max-width="400" :close-on-content-click="false">
    <template #activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-badge :content="notificationCount" :value="notificationCount > 0" color="error" overlap>
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Notificaciones en Tiempo Real</span>
        <v-spacer></v-spacer>
        <v-btn icon small @click="clearNotifications">
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-list v-if="notifications.length > 0" max-height="400" style="overflow-y: auto">
        <v-list-item v-for="(notification, index) in notifications" :key="index">
          <v-list-item-avatar>
            <v-icon :color="getNotificationColor(notification.type)">
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ notification.message }}</v-list-item-title>
            <v-list-item-subtitle>
              {{ formatTimestamp(notification.timestamp) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-card-text v-else class="text-center grey--text">No hay notificaciones</v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  computed: {
    notifications() {
      return this.$store.getters.notificationRealTimeArray
    },
    notificationCount() {
      return this.notifications.length
    },
  },
  methods: {
    clearNotifications() {
      this.$store.dispatch("clearNotificationsRealTime")
    },
    getNotificationColor(type) {
      const colors = {
        "seat.updated": "primary",
        "notification.created": "success",
        default: "grey",
      }
      return colors[type] || colors.default
    },
    getNotificationIcon(type) {
      const icons = {
        "seat.updated": "mdi-seat",
        "notification.created": "mdi-bell-ring",
        default: "mdi-information",
      }
      return icons[type] || icons.default
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return ""
      const date = new Date(timestamp)
      return date.toLocaleString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    },
  },
}
</script>
