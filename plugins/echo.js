import Echo from "laravel-echo"
import Pusher from "pusher-js"

export default ({ app, store }, inject) => {
  // Configure Pusher
  window.Pusher = Pusher

  // Create Echo instance with Laravel Reverb configuration
  const reverbKey = app.$config.REVERB_APP_KEY
  // Use current hostname for flexibility (localhost or network IP)
  const reverbHost = app.$config.REVERB_HOST
  const reverbPort = parseInt(app.$config.REVERB_PORT || "6001")
  const reverbScheme = app.$config.REVERB_SCHEME || "http"
  const useTLS = reverbScheme === "https"

  const echo = new Echo({
    broadcaster: "reverb",
    key: reverbKey,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: useTLS,
    enabledTransports: ["ws", "wss"],
    // Auth configuration for private/presence channels if needed
    authEndpoint: `${process.env.BASE_URL}${process.env.SUFFIX_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${store.state.auth?.strategy?.token?.get()}`,
      },
    },
  })

  // Inject Echo instance into the app
  inject("echo", echo)

  // Listen for connection status
  echo.connector.pusher.connection.bind("connected", () => {
    console.log("✅ WebSocket connected successfully")
  })

  echo.connector.pusher.connection.bind("disconnected", () => {
    console.log("❌ WebSocket disconnected")
  })

  echo.connector.pusher.connection.bind("error", (err) => {
    console.error("❌ WebSocket error:", err)
  })
}
