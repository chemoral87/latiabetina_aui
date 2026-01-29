import Echo from "laravel-echo"
import Pusher from "pusher-js"

export default ({ app, store }, inject) => {
  // Configure Pusher
  window.Pusher = Pusher

  // Create Echo instance with Laravel Reverb configuration
  const echo = new Echo({
    broadcaster: "reverb",
    key: "c4k4ojg6jh3olvof8pgo",
    wsHost: window.location.hostname,
    wsPort: 6001,
    wssPort: 6001,
    forceTLS: false,
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
