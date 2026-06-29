import fs from 'fs'
import path from 'path'

// Simple SVG icon — gold star on dark background
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f0f1a"/>
  <text x="50%" y="54%" font-size="${size * 0.55}" text-anchor="middle" dominant-baseline="middle" fill="#c9a96e" font-family="serif">✦</text>
</svg>`

const publicDir = path.join(process.cwd(), 'public')

fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg(192))
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg(512))
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg(32))

console.log('Icons written to public/')
