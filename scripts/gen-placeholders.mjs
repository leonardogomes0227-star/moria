// Gera ilustrações SVG placeholder (troque por fotos reais depois).
import { mkdirSync, writeFileSync } from 'node:fs'

const dir = 'public/placeholders'
mkdirSync(dir, { recursive: true })

const glyphs = {
  hamburguer: `<path d="M250 270c0-70 70-110 150-110s150 40 150 110z" fill="#E8892B"/><circle cx="330" cy="215" r="5" fill="#FFE2B0"/><circle cx="400" cy="195" r="5" fill="#FFE2B0"/><circle cx="465" cy="220" r="5" fill="#FFE2B0"/><path d="M240 285q40 24 80 0t80 0t80 0t80 0v18H240z" fill="#6DBE45"/><rect x="245" y="300" width="310" height="22" rx="11" fill="#FFB400"/><rect x="245" y="320" width="310" height="34" rx="17" fill="#4A2412"/><path d="M250 360h300v10q0 34-40 34H290q-40 0-40-34z" fill="#E8892B"/>`,
  baguete: `<g transform="rotate(-18 400 300)"><rect x="170" y="250" width="460" height="100" rx="50" fill="#D9963F"/><path d="M230 250l20 100M310 250l20 100M390 250l20 100M470 250l20 100M550 250l20 100" stroke="#B9722A" stroke-width="10" stroke-linecap="round"/><path d="M200 290q100-40 200-12t200-8" stroke="#6DBE45" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M210 312q100 24 190 0t190 4" stroke="#D61F1F" stroke-width="16" fill="none" stroke-linecap="round"/></g>`,
  acompanhamento: `<path d="M300 400l-20-180h240l-20 180z" fill="#D61F1F"/><g fill="#FFC83D"><rect x="310" y="130" width="26" height="140" rx="6" transform="rotate(-8 323 200)"/><rect x="350" y="110" width="26" height="160" rx="6"/><rect x="392" y="120" width="26" height="150" rx="6" transform="rotate(6 405 195)"/><rect x="434" y="135" width="26" height="135" rx="6" transform="rotate(14 447 200)"/><rect x="274" y="165" width="26" height="110" rx="6" transform="rotate(-18 287 220)"/></g>`,
  molho: `<rect x="355" y="130" width="90" height="40" rx="10" fill="#EEE"/><rect x="335" y="165" width="130" height="220" rx="28" fill="#D61F1F"/><rect x="335" y="230" width="130" height="90" fill="#FFE2B0"/><circle cx="400" cy="275" r="22" fill="#FF6A1A"/><rect x="380" y="100" width="40" height="36" rx="8" fill="#9AA4B2"/>`,
  bebida: `<path d="M310 160h180l-24 230q-2 18-20 18H354q-18 0-20-18z" fill="#D61F1F"/><rect x="300" y="146" width="200" height="22" rx="8" fill="#EEE"/><path d="M420 146l30-70 24 8" stroke="#FFF" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M322 250h156" stroke="#FFF" stroke-width="14" opacity=".85"/><circle cx="370" cy="320" r="10" fill="#fff" opacity=".4"/><circle cx="420" cy="350" r="7" fill="#fff" opacity=".4"/>`,
  combo: `<g transform="translate(-60 20) scale(.75)">${'<path d="M250 270c0-70 70-110 150-110s150 40 150 110z" fill="#E8892B"/><rect x="245" y="300" width="310" height="22" rx="11" fill="#FFB400"/><rect x="245" y="320" width="310" height="34" rx="17" fill="#4A2412"/><path d="M250 360h300v10q0 34-40 34H290q-40 0-40-34z" fill="#E8892B"/>'}</g><g transform="translate(300 110) scale(.7)"><path d="M300 400l-20-180h240l-20 180z" fill="#D61F1F"/><g fill="#FFC83D"><rect x="320" y="130" width="26" height="140" rx="6"/><rect x="360" y="110" width="26" height="160" rx="6"/><rect x="400" y="125" width="26" height="145" rx="6"/></g></g>`,
}

const palettes = [
  ['#2A0A0A', '#7A1212'],
  ['#1A1208', '#7A3A0A'],
  ['#0F1722', '#7A1212'],
  ['#220A0A', '#A32A0E'],
  ['#14100C', '#5C1A0A'],
  ['#1B0B0B', '#8A1B1B'],
]

const svg = (glyph, [a, b], label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${label}"><defs><radialGradient id="g" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs><rect width="800" height="600" fill="url(#g)"/><ellipse cx="400" cy="450" rx="190" ry="26" fill="#000" opacity=".35"/>${glyph}</svg>`

Object.entries(glyphs).forEach(([name, glyph], i) => {
  writeFileSync(
    `${dir}/${name}.svg`,
    svg(glyph, palettes[i % palettes.length], `Foto ilustrativa: ${name}`),
  )
})

const order = Object.keys(glyphs)
for (let i = 0; i < 8; i++) {
  const name = order[i % order.length]
  writeFileSync(
    `${dir}/galeria-${i + 1}.svg`,
    svg(glyphs[name], palettes[(i + 2) % palettes.length], `Foto ilustrativa ${i + 1}`),
  )
}
