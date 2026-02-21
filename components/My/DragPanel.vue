<template>
  <div
    v-if="value"
    ref="panel"
    class="drag-panel elevation-8"
    :style="panelStyle"
  >
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
      hasMoved: false
    }
  },
  computed: {
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
  },
  beforeDestroy() {
    window.removeEventListener('mousemove', this.onDrag)
    window.removeEventListener('touchmove', this.onDrag)
    window.removeEventListener('mouseup', this.stopDrag)
    window.removeEventListener('touchend', this.stopDrag)
  },
  methods: {
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
        
        this.pos.x = clientX - parentLeft - this.dragOffset.x
        this.pos.y = clientY - parentTop - this.dragOffset.y

        // Keep within viewport (optional clamping)
        // const rect = panel.getBoundingClientRect();
        // if (this.pos.x < 0) this.pos.x = 0;
      }
    },
    stopDrag() {
      this.isDragging = false
    }
  }
}
</script>

<style scoped>
.drag-panel {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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
}

</style>
