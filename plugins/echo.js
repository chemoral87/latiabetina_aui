import Echo from "laravel-echo"
import Pusher from "pusher-js"

export default ({ app, store }, inject) => {
  // Configure Pusher
  window.Pusher = Pusher

  // Create Echo instance with Laravel Reverb configuration
  const reverbKey = process.env.REVERB_APP_KEY
  const reverbHost = process.env.REVERB_HOST || window.location.hostname
  const reverbPort = parseInt(process.env.REVERB_PORT || "6001")
  const reverbScheme = process.env.REVERB_SCHEME || "http"
  const useTLS = reverbScheme === "https"

  console.log("🔧 Reverb Config:", { key: reverbKey, host: reverbHost, port: reverbPort, scheme: reverbScheme, forceTLS: useTLS })

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
