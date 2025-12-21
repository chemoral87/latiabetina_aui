const config = require("./nuxt.config.js")

console.log("🔍 Verificando configuración de optimización...\n")

const isDev = process.env.NODE_ENV !== "production"
console.log("Modo:", isDev ? "DESARROLLO" : "PRODUCCIÓN")
console.log("")

// Verificar PostCSS
if (config.default.postcss) {
  console.log("✅ PostCSS configurado")
  const plugins = Object.keys(config.default.postcss.plugins)
  console.log("   Plugins:", plugins.join(", "))
} else {
  console.log("❌ PostCSS no configurado")
}
console.log("")

// Verificar Terser
if (config.default.build.terser) {
  console.log("✅ Terser configurado para minificación")
  const terserConfig = config.default.build.terser
  if (terserConfig.terserOptions) {
    console.log("   - Drop console:", terserConfig.terserOptions.compress?.drop_console || false)
    console.log("   - Mangle:", terserConfig.terserOptions.mangle ? "Sí" : "No")
    console.log("   - Passes:", terserConfig.terserOptions.compress?.passes || 1)
  }
} else {
  console.log("❌ Terser no configurado")
}

// Verificar extractCSS
console.log("✅ ExtractCSS:", config.default.build.extractCSS ? "Habilitado" : "Deshabilitado")

// Verificar optimizeCSS
console.log("✅ OptimizeCSS:", config.default.build.optimizeCSS ? "Habilitado" : "Deshabilitado")
console.log("")

// Verificar chunks
if (config.default.build.optimization) {
  console.log("✅ Chunk optimization configurado")
  console.log("   Cache groups:", Object.keys(config.default.build.optimization.splitChunks.cacheGroups).join(", "))
} else {
  console.log("⚠️  Chunk optimization no configurado")
}
console.log("")

console.log("✨ Verificación completada")
console.log("\nPara hacer build de producción ejecuta:")
console.log("  npm run build:prod")
