import Vue from "vue"

// Create a global event bus
export const EventBus = new Vue()

// Plugin to inject into Vue instance
export default (context, inject) => {
  inject("eventBus", EventBus)
}
