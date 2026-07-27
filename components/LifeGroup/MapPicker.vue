<template>
  <div>
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-text-field id="tf-lifeg-mappi-locallat-1" v-model="localLat" label="Latitud" type="number" step="0.0000001" outlined dense
          hide-details="auto" @input="onCoordChange" />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field id="tf-lifeg-mappi-locallng-2" v-model="localLng" label="Longitud" type="number" step="0.0000001" outlined dense
          hide-details="auto" @input="onCoordChange" />
      </v-col>
      <v-col cols="12">
        <v-text-field id="tf-lifeg-mappi-addressquery-3" v-model="addressQuery" label="Buscar dirección" outlined dense hide-details="auto"
          append-icon="mdi-magnify" placeholder="Ej: Calle Principal #123, Colonia Centro" @click:append="searchAddress"
          @keyup.enter="searchAddress" />
      </v-col>
      <v-col cols="12">
        <div ref="mapContainer" class="map-container" style="height: 350px; border-radius: 4px; overflow: hidden; border: 1px solid #ddd;"></div>
        <div class="text-caption grey--text mt-1">
          Arrastra el marcador o haz clic en el mapa para ajustar la ubicación
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "LifeGroupMapPicker",

  props: {
    latitude: { type: [Number, String], default: null },
    longitude: { type: [Number, String], default: null },
  },

  data() {
    return {
      localLat: this.latitude || "",
      localLng: this.longitude || "",
      addressQuery: "",
      map: null,
      marker: null,
    }
  },

  watch: {
    latitude(val) {
      this.localLat = val || ""
    },
    longitude(val) {
      this.localLng = val || ""
    },
  },

  mounted() {
    this.loadLeaflet()
  },

  beforeDestroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  },

  methods: {
    async loadLeaflet() {
      if (typeof window === "undefined") return

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load Leaflet JS (with dedup check)
      if (typeof window.L === "undefined") {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })
      }

      this.$nextTick(() => this.initMap())
    },

    initMap() {
      if (!this.$refs.mapContainer || typeof window.L === "undefined") return

      const leaflet = window.L
      const lat = parseFloat(this.localLat) || 19.4326
      const lng = parseFloat(this.localLng) || -99.1332

      // Fix for Leaflet icon paths when loaded from CDN
      delete leaflet.Icon.Default.prototype._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      this.map = leaflet.map(this.$refs.mapContainer, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      })

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map)

      // Create draggable marker
      this.marker = leaflet.marker([lat, lng], { draggable: true }).addTo(this.map)

      // Update coordinates when marker is dragged
      this.marker.on("dragend", (e) => {
        const pos = e.target.getLatLng()
        this.localLat = pos.lat.toFixed(7)
        this.localLng = pos.lng.toFixed(7)
        this.emitValues()
      })

      // Update marker position when clicking on the map
      this.map.on("click", (e) => {
        this.localLat = e.latlng.lat.toFixed(7)
        this.localLng = e.latlng.lng.toFixed(7)
        this.marker.setLatLng([this.localLat, this.localLng])
        this.emitValues()
      })

      // Invalidate size after mount to fix rendering
      setTimeout(() => {
        if (this.map) this.map.invalidateSize()
      }, 200)
    },

    onCoordChange() {
      const lat = parseFloat(this.localLat)
      const lng = parseFloat(this.localLng)

      if (lat && lng && this.map && this.marker) {
        this.marker.setLatLng([lat, lng])
        this.map.setView([lat, lng], this.map.getZoom())
      }

      this.emitValues()
    },

    emitValues() {
      this.$emit("update:latitude", this.localLat || null)
      this.$emit("update:longitude", this.localLng || null)
    },

    searchAddress() {
      if (!this.addressQuery || this.addressQuery.length < 5) return

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.addressQuery)}&limit=1&countrycodes=mx`,
        { headers: { "User-Agent": "LatiabetinaApp/1.0" } }
      )
        .then((r) => {
          if (!r.ok) throw new Error("Error de red")
          return r.json()
        })
        .then((data) => {
          if (data && data.length > 0) {
            this.localLat = data[0].lat
            this.localLng = data[0].lon
            this.emitValues()

            // Update map marker and center
            if (this.map && this.marker) {
              const lat = parseFloat(this.localLat)
              const lng = parseFloat(this.localLng)
              this.marker.setLatLng([lat, lng])
              this.map.setView([lat, lng], 16)
            }
          } else {
            this.$notify({ type: "warning", message: "No se encontró la dirección" })
          }
        })
        .catch(() => {
          this.$notify({ type: "error", message: "Error al buscar dirección. Verifique su conexión." })
        })
    },
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
  min-height: 350px;
}
</style>
