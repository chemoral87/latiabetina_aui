#!/bin/bash

echo "🚀 Iniciando build de producción optimizado..."
echo ""

# Limpiar build anterior
echo "🧹 Limpiando build anterior..."
rm -rf .nuxt
rm -rf dist

# Build de producción
echo ""
echo "📦 Compilando para producción..."
NODE_ENV=production npm run build

# Verificar archivos generados
echo ""
echo "✅ Build completado!"
echo ""
echo "📊 Estadísticas de archivos:"
echo ""

# CSS
echo "📄 Archivos CSS:"
find .nuxt/dist/client -name "*.css" -exec du -h {} \; | sort -h
echo ""

# CSS comprimido
echo "📦 Archivos CSS.GZ:"
find .nuxt/dist/client -name "*.css.gz" -exec du -h {} \; | sort -h
echo ""

# JavaScript
echo "📄 Archivos JS (top 10 más grandes):"
find .nuxt/dist/client -name "*.js" -exec du -h {} \; | sort -rh | head -10
echo ""

# JavaScript comprimido
echo "📦 Archivos JS.GZ (top 10 más grandes):"
find .nuxt/dist/client -name "*.js.gz" -exec du -h {} \; | sort -rh | head -10
echo ""

# Tamaño total
echo "💾 Tamaño total del build:"
du -sh .nuxt/dist/client
echo ""

echo "✨ Build optimizado completado!"
echo ""
echo "Para iniciar el servidor de producción:"
echo "npm start"
