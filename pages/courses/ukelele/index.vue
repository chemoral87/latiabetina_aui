<template>
  <v-container class="pa-4" style="max-width: 900px">
    <h2 class="text-h5 mb-4">Curso de Ukelele</h2>

    <v-alert v-if="error" type="error" dense outlined class="mb-4">
      {{ error }}
    </v-alert>

    <div v-else-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="mt-3 text-body-2 grey--text">Cargando lecciones…</p>
    </div>

    <v-alert v-else-if="!blocks.length" type="info" dense outlined>
      Usa parámetros en la URL:
      <code>?day=1</code> para todas las lecciones del día 1,
      <code>?order=TR,P</code> para priorizar carpetas (el resto va al final: P, TL, TR), o
      <code>?folder=practical</code> para todo el contenido de una carpeta.
    </v-alert>

    <section v-for="block in blocks" :key="block.key" class="mb-8">
      <!-- <h3 v-if="blocks.length > 1" class="text-subtitle-1 font-weight-medium mb-3">
        {{ block.title }}
      </h3> -->
      <component :is="block.component" />
    </section>
  </v-container>
</template>

<script>
const FOLDERS = ["practical", "theological", "theoretical"]
const DEFAULT_ORDER_CODES = ["P", "TL", "TR"]
const FOLDER_CODES = {
  P: "practical",
  TL: "theological",
  TR: "theoretical",
}
const FOLDER_LABELS = {
  practical: "Práctico",
  theological: "Teológico",
  theoretical: "Teórico",
}

function getFolderLabel(folder) {
  return FOLDER_LABELS[folder] || folder
}

const folderContexts = {
  practical: require.context("./practical", false, /\.vue$/),
  theological: require.context("./theological", false, /\.vue$/),
  theoretical: require.context("./theoretical", false, /\.vue$/),
}

export default {
  middleware: ["authenticated", "permission"],
  meta: { permission: "ukelele-course" },
  data() {
    return {
      loading: false,
      error: null,
      blocks: [],
    }
  },

  watch: {
    "$route.query": {
      handler() {
        this.loadContent()
      },
      immediate: true,
    },
  },

  methods: {
    loadContent() {
      this.error = null
      this.blocks = []
      this.loading = true

      try {
        const day = this.parseDay(this.$route.query.day)
        const folder = this.parseFolder(this.$route.query.folder)

        const folderOrder = this.parseOrder(this.$route.query.order)

        if(folder) {
          this.blocks = this.loadFromFolder(folder, day)
        } else if(day) {
          this.blocks = this.loadByDay(day, folderOrder)
        }
      } catch(err) {
        this.error = err.message || "No se pudo cargar el contenido."
      } finally {
        this.loading = false
      }
    },

    parseDay(value) {
      if(value === undefined || value === null || value === "") {
        return null
      }
      const day = parseInt(String(value), 10)
      if(!Number.isFinite(day) || day < 1) {
        throw new Error("El parámetro «day» debe ser un número mayor que 0.")
      }
      return day
    },

    parseFolder(value) {
      if(!value) {
        return null
      }
      const folder = String(value).toLowerCase().trim()
      if(!FOLDERS.includes(folder)) {
        const options = FOLDERS.map((name) => getFolderLabel(name)).join(", ")
        throw new Error(`Carpeta no válida. Usa: ${options}.`)
      }
      return folder
    },

    parseOrder(value) {
      const codes = value
        ? String(value)
          .split(",")
          .map((part) => part.trim().toUpperCase())
          .filter(Boolean)
        : [...DEFAULT_ORDER_CODES]

      const folders = []

      for(const code of codes) {
        const folder = FOLDER_CODES[code]
        if(!folder) {
          throw new Error(`Código de orden no válido: «${code}». Usa P, TL o TR.`)
        }
        if(!folders.includes(folder)) {
          folders.push(folder)
        }
      }

      for(const code of DEFAULT_ORDER_CODES) {
        const folder = FOLDER_CODES[code]
        if(!folders.includes(folder)) {
          folders.push(folder)
        }
      }

      return folders
    },

    loadByDay(day, folderOrder) {
      const fileName = `day${day}.vue`
      const blocks = []

      for(const folder of folderOrder) {
        const ctx = folderContexts[folder]
        const key = `./${fileName}`
        if(!ctx.keys().includes(key)) {
          continue
        }
        blocks.push(this.makeBlock(folder, key, ctx))
      }

      if(!blocks.length) {
        throw new Error(`No hay lecciones para el día ${day}.`)
      }

      return blocks
    },

    loadFromFolder(folder, day) {
      const ctx = folderContexts[folder]
      let keys = ctx.keys().sort()

      if(day) {
        const target = `./day${day}.vue`
        keys = keys.filter((key) => key === target)
        if(!keys.length) {
          throw new Error(`No existe day${day}.vue en «${getFolderLabel(folder)}».`)
        }
      }

      return keys.map((key) => this.makeBlock(folder, key, ctx))
    },

    makeBlock(folder, key, ctx) {
      const module = ctx(key)
      const component = module.default || module
      const fileName = key.replace(/^\.\//, "").replace(/\.vue$/, "")

      return {
        key: `${folder}-${fileName}`,
        title: this.formatTitle(folder, fileName),
        component,
      }
    },

    formatTitle(folder, fileName) {
      const folderLabel = getFolderLabel(folder)
      const dayMatch = fileName.match(/^day(\d+)$/i)
      const dayLabel = dayMatch ? ` — Día ${dayMatch[1]}` : ` — ${fileName}`
      return `${folderLabel}${dayLabel}`
    },
  },
}
</script>
