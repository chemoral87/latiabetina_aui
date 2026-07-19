<template>
  <div
    v-if="value"
    ref="panel"
    class="drag-panel elevation-8"
    :style="panelStyle"
  >
    <div :class="enterAnimClass">
      <!-- Header / Drag Handle -->
      <div
        class="drag-panel-header"
        @mousedown="startDrag"
        @touchstart="startDrag"
      >
        <slot name="header">
          <span class="text-caption font-weight-bold">{{ title }}</span>
        </slot>
        <v-spacer />
        <v-btn
          outlined
          fab
          x-small
          icon
          color="white"
          title="Cerrar"
          class="ml-2"
          @click.stop="close"
        >
          <v-icon small>mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Body Content -->
      <div class="drag-panel-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyDragPanel',
  props: {
    // v-model for visibility
    value: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    initialX: {
      type: Number,
      default: 0
    },
    initialY: {
      type: Number,
      default: 0
    },
    anchor: {
      type: String,
      default: 'right' // 'left' or 'right' for default positioning
    },
    mode: {
      type: String,
      default: 'absolute' // 'absolute' or 'fixed'
    },
    top: { type: String, default: null },
    left: { type: String, default: null },
    right: { type: String, default: null },
    bottom: { type: String, default: null }
  },
  data() {
    return {
      isDragging: false,
      pos: { x: this.initialX, y: this.initialY },
      dragOffset: { x: 0, y: 0 },
      hasMoved: false,
      resizeObserver: null
    }
  },
  computed: {
    /**
     * Pick the slide direction based on initial position:
     * - `top` prop set → panel appears anchored at top → slide DOWN from above
     * - `bottom` prop set → panel appears anchored at bottom → slide UP from below
     * - No explicit vertical anchor → default slide up
     */
    enterAnimClass() {
      return {
        'anim-enter': true,
        'anim-from-top': !!this.top && !this.bottom,
        'anim-from-bottom': !!this.bottom || (!this.top && !this.bottom),
      }
    },

    panelStyle() {
      const style = {
        position: this.mode,
        zIndex: 2000,
        transform: 'none'
      }

      if (!this.hasMoved) {
        // Use custom initial positioning if provided
        if (this.top) style.top = this.top
        if (this.left) style.left = this.left
        if (this.right) style.right = this.right
        if (this.bottom) style.bottom = this.bottom

        // Defaults if nothing provided
        if (!this.top && !this.bottom) {
          style.top = '100%'
          style.marginTop = '4px'
        }
        if (!this.left && !this.right) {
          if (this.anchor === 'right') {
            style.right = '0px'
          } else {
            style.left = '0px'
          }
        }
      } else {
        style.left = `${this.pos.x}px`
        style.top = `${this.pos.y}px`
        style.right = 'auto'
        style.bottom = 'auto'
      }

      return style
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.onDrag)
    window.addEventListener('touchmove', this.onDrag, { passive: false })
    window.addEventListener('mouseup', this.stopDrag)
    window.addEventListener('touchend', this.stopDrag)

    this.$nextTick(() => {
      this.adjustPosition()

      // Observe the panel element so we re-adjust when content grows
      const panel = this.$refs.panel
      if(panel && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.adjustPosition()
        })
        this.resizeObserver.observe(panel)
      }
    })
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('touchmove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('touchend', this.stopDrag)

    if(this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },
  methods: {
    /**
     * Smart viewport-aware positioning.
     * Detects if the panel overflows the viewport edges and shifts it back into view.
     * Priority: keeps the panel fully visible without altering its initial CSS position
     * unless it actually overflows.
     *
     * - If the panel overflows ABOVE (top < 0), move it DOWN so the top edge is visible.
     * - If the panel overflows BELOW (bottom > vh), move it UP so the bottom edge is visible.
     * - Same logic for left/right edges.
     */
    adjustPosition() {
      const panel = this.$refs.panel
      if(!panel) return

      const rect = panel.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const margin = 8

      let dx = 0
      let dy = 0

      // Horizontal overflow
      if(rect.right > vw) dx = vw - rect.right - margin
      if(rect.left + dx < 0) dx = -rect.left + margin

      // Vertical overflow
      if(rect.top < 0) dy = -rect.top + margin
      if(rect.bottom > vh) dy = vh - rect.bottom - margin
      // If BOTH top and bottom overflow (panel taller than viewport), prefer showing the top portion
      if(rect.top < 0 && rect.bottom > vh) dy = -rect.top + margin

      if(dx !== 0 || dy !== 0) {
        if(!this.hasMoved) {
          // Switch from CSS positioning to pixel positioning
          let parentLeft = 0
          let parentTop = 0
          if(this.mode !== 'fixed' && panel.offsetParent) {
            const pRect = panel.offsetParent.getBoundingClientRect()
            parentLeft = pRect.left
            parentTop = pRect.top
          }
          this.pos.x = rect.left - parentLeft
          this.pos.y = rect.top - parentTop
          this.hasMoved = true
        }
        // Apply the offset to current position
        this.pos.x += dx
        this.pos.y += dy
      }
    },

    close() {
      this.$emit('input', false)
    },
    startDrag(e) {
      this.isDragging = true
      
      const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
      const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
      
      const panel = this.$refs.panel
      if (panel) {
        const rect = panel.getBoundingClientRect()
        
        // Initialize position on first move
        if (!this.hasMoved) {
          let parentLeft = 0
          let parentTop = 0
          if (this.mode !== 'fixed' && panel.offsetParent) {
            const pRect = panel.offsetParent.getBoundingClientRect()
            parentLeft = pRect.left
            parentTop = pRect.top
          }
          this.pos.x = rect.left - parentLeft
          this.pos.y = rect.top - parentTop
          this.hasMoved = true
        }
        
        this.dragOffset.x = clientX - rect.left
        this.dragOffset.y = clientY - rect.top
      }
    },
    onDrag(e) {
      if (!this.isDragging) return

      if (e.type === 'touchmove') e.preventDefault()

      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY

      const panel = this.$refs.panel
      if (panel) {
        let parentLeft = 0
        let parentTop = 0

        if (this.mode !== 'fixed' && panel.offsetParent) {
          const parentRect = panel.offsetParent.getBoundingClientRect()
          parentLeft = parentRect.left
          parentTop = parentRect.top
        }

        // Calculate raw position in parent-relative coordinates
        const rawX = clientX - parentLeft - this.dragOffset.x
        const rawY = clientY - parentTop - this.dragOffset.y

        // Clamp to keep the panel fully visible within the viewport
        const margin = 8
        const panelRect = panel.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight

        // Convert to viewport coordinates, clamp, then convert back
        const viewportX = rawX + parentLeft
        const viewportY = rawY + parentTop

        this.pos.x = Math.max(margin, Math.min(viewportX, vw - panelRect.width - margin)) - parentLeft
        this.pos.y = Math.max(margin, Math.min(viewportY, vh - panelRect.height - margin)) - parentTop
      }
    },
    stopDrag() {
      this.isDragging = false
      // Re-adjust position after drag in case panel size changed
      this.adjustPosition()
    }
  }
}
</script>

<style scoped>
.drag-panel {
  background: #fff;
  border-radius: 8px;
  min-width: 190px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
}

.drag-panel-header {
  display: flex;
  align-items: center;
  padding: 6px 8px 6px 12px;
  background: #1976d2;
  color: #fff;
  cursor: move;
  user-select: none;
  border-radius: 8px 8px 0 0;
}

.drag-panel-body {
  border-radius: 0 0 8px 8px;
}

/* ── Enter animation ─────────────────────────────────────── */

.anim-enter {
  animation-duration: 0.3s;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

/* Slide down from above — used when panel is anchored to the top */
.anim-from-top {
  animation-name: slideInDown;
}

/* Slide up from below — used when panel is anchored to the bottom or has no vertical anchor */
.anim-from-bottom {
  animation-name: slideInUp;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
