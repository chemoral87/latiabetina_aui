/**
 * Module-level tracker to prevent duplicate channel subscriptions across
 * component instances (e.g. on SPA page refresh when beforeDestroy hasn't
 * fully completed before a new component subscribes).
 */
const channelSubscriptions = new Set()

/**
 * Create Echo real-time listeners for one or more channels.
 *
 * @param {object}   echo              - The Echo instance ($echo)
 * @param {Array}    channelConfigs    - Array of { name: string, events: object }
 *        name:   The channel name, e.g. "pos.kds.3" or "auditorium-event.42"
 *        events: Map of event names → handler, e.g.
 *                { ".sale.created": (data) => handleSale(data) }
 * @param {object}   [callbacks]       - Optional lifecycle callbacks
 * @param {function} [callbacks.onConnected]
 * @param {function} [callbacks.onDisconnected]
 * @param {function} [callbacks.onError]
 * @returns {function} A cleanup function that leaves all subscribed channels.
 *
 * @example
 *   // In mounted():
 *   this._realtimeCleanup = createRealtimeListeners(this.$echo, [
 *     { name: `pos.kds.${orgId}`, events: { '.sale.created': this.handleSale } },
 *   ], {
 *     onConnected: () => { this.echoConnected = true },
 *     onDisconnected: () => { this.echoConnected = false },
 *   })
 *
 *   // In beforeDestroy():
 *   if (this._realtimeCleanup) this._realtimeCleanup()
 */
export function createRealtimeListeners(echo, channelConfigs, callbacks = {}) {
  if (!echo || !channelConfigs || channelConfigs.length === 0) return () => {}

  /** @type {Record<string, object>} */
  const channels = {}

  channelConfigs.forEach(({ name, events }) => {
    if (!name) return
    if (channels[name]) return

    // ── Global duplicate guard ───────────────────────────────────────────
    // If this channel is already tracked from a previous component instance
    // (e.g. beforeDestroy didn't fully clear it yet on page refresh), leave
    // it first and clean the tracker before re-subscribing.
    if (channelSubscriptions.has(name)) {
      echo.leave(name)
      channelSubscriptions.delete(name)
    }

    const channel = echo.channel(name)

    channel
      .subscribed(() => {
        callbacks.onConnected?.()
      })
      .error(() => {
        callbacks.onError?.()
        callbacks.onDisconnected?.()
      })

    channelSubscriptions.add(name)

    if (events) {
      Object.keys(events).forEach((eventName) => {
        const handler = events[eventName]
        if (typeof handler === 'function') {
          // Remove any existing callback for this event before adding a new one.
          // This provides defense-in-depth against stale listeners that may
          // survive across component instances due to async lifecycle overlap
          // or Echo channel cache timing.
          channel.stopListening(eventName)
          channel.listen(eventName, handler)
        }
      })
    }

    channels[name] = channel
  })

  // Reflect current connection state
  const state = echo?.connector?.pusher?.connection?.state
  if (state === 'connected') {
    callbacks.onConnected?.()
  }

  // Return a cleanup function that also clears the global tracker
  return () => {
    Object.keys(channels).forEach((name) => {
      echo.leave(name)
      channelSubscriptions.delete(name)
      delete channels[name]
    })
  }
}

export default createRealtimeListeners
