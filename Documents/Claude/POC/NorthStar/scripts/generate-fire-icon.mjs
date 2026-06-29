// Generates apple-touch-icon.png using sharp (installed on server)
// Run on the EC2 server: node scripts/generate-fire-icon.mjs
import { writeFileSync } from 'fs'

// Create a rich fire SVG that renders well as a rasterised PNG
const fireSvg = (size) => {
  const r = size / 192  // scale ratio
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="40" fill="#0f0f1a"/>
  <!-- glow -->
  <ellipse cx="96" cy="152" rx="40" ry="12" fill="#e8934a" opacity="0.3"/>
  <!-- outer flame -->
  <path d="M96 24 C96 24 68 58 64 90 C60 114 70 128 80 134
           C76 118 82 106 90 100
           C88 114 92 126 96 132
           C100 126 104 114 102 100
           C110 106 116 118 112 134
           C122 128 132 114 128 90
           C124 58 96 24 96 24Z"
        fill="#e8934a"/>
  <!-- mid flame -->
  <path d="M96 52 C96 52 78 78 76 100 C74 116 82 126 88 130
           C86 120 88 110 94 106
           C92 118 94 128 96 132
           C98 128 100 118 98 106
           C104 110 106 120 104 130
           C110 126 118 116 116 100
           C114 78 96 52 96 52Z"
        fill="#f5b942"/>
  <!-- inner flame -->
  <path d="M96 80 C96 80 84 96 84 110 C84 122 90 130 95 132
           C94 124 95 116 96 113
           C97 116 98 124 97 132
           C102 130 108 122 108 110
           C108 96 96 80 96 80Z"
        fill="#fde68a"/>
  <!-- sparkle -->
  <ellipse cx="89" cy="97" rx="4" ry="7" fill="white" opacity="0.4" transform="rotate(-10 89 97)"/>
</svg>`
}

// Write SVGs (the server will convert to PNG using sharp)
writeFileSync('public/apple-touch-icon.svg', fireSvg(180))
writeFileSync('public/icon-fire-192.svg', fireSvg(192))
writeFileSync('public/icon-fire-512.svg', fireSvg(512))
console.log('SVGs written — run sharp conversion on server')
