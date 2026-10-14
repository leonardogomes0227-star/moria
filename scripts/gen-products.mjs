// Gera as ilustrações de produto (SVG 800x600) em public/menu/. Uso: node scripts/gen-products.mjs
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'public/menu'
mkdirSync(OUT, { recursive: true })

/* ───────── fundo de estúdio: brilho quente, sombra no chão, brasas ───────── */
const studio = (
  tint,
  art,
  { steam = true } = {},
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <radialGradient id="bg" cx="50%" cy="58%" r="78%"><stop offset="0" stop-color="${tint}"/><stop offset=".5" stop-color="#1c0e0e"/><stop offset="1" stop-color="#0a0d12"/></radialGradient>
  <radialGradient id="rim" cx="50%" cy="100%" r="60%"><stop offset="0" stop-color="#ff6a1a" stop-opacity=".28"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></radialGradient>
  <filter id="b4"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="b12"><feGaussianBlur stdDeviation="12"/></filter>
  <filter id="b2"><feGaussianBlur stdDeviation="1.6"/></filter>
  <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<rect width="800" height="600" fill="url(#rim)"/>
<g fill="#ff7a22" filter="url(#b2)" opacity=".75">
  <circle cx="120" cy="140" r="3"/><circle cx="690" cy="110" r="2.6"/><circle cx="610" cy="250" r="2"/><circle cx="170" cy="330" r="2.4"/><circle cx="730" cy="380" r="3"/><circle cx="90" cy="450" r="2"/><circle cx="560" cy="60" r="2"/><circle cx="260" cy="70" r="2.2"/>
</g>
${steam ? `<g fill="none" stroke="#fff" stroke-linecap="round" opacity=".16" filter="url(#b4)"><path d="M330 190c-30-40 30-60 0-100" stroke-width="14"/><path d="M410 170c-30-40 30-60 0-100" stroke-width="12"/><path d="M480 195c-26-34 26-52 0-90" stroke-width="12"/></g>` : ''}
<ellipse cx="400" cy="505" rx="270" ry="30" fill="#000" opacity=".55" filter="url(#b12)"/>
${art}
</svg>`

/* ───────── hambúrguer vetorial (frango / veggie / combos) ───────── */
const burger = ({ patty = 'beef', cheese = true, bacon = false } = {}) => {
  const pattyArt =
    patty === 'chicken'
      ? `<path d="M222 378c-12-22 8-44 40-46 40-4 76 4 138 2s110-8 140 0c30 8 40 34 22 52-16 18-52 18-96 16-60-3-120 4-170 2-40-2-62-6-74-26z" fill="url(#chk)"/>
         <g fill="#f6c76a" opacity=".7"><circle cx="270" cy="350" r="5"/><circle cx="330" cy="360" r="4"/><circle cx="410" cy="348" r="5"/><circle cx="480" cy="362" r="4"/><circle cx="540" cy="352" r="5"/><circle cx="300" cy="384" r="4"/><circle cx="450" cy="386" r="4"/></g>`
      : `<rect x="218" y="352" width="364" height="50" rx="24" fill="url(#${patty === 'veggie' ? 'veg' : 'pty'})"/>
         <g stroke="#1a0c06" stroke-width="3" opacity=".5" stroke-linecap="round"><path d="M260 368l22 22M312 366l22 24M364 366l22 24M416 366l22 24M468 366l22 24M520 368l22 22"/></g>
         <g fill="${patty === 'veggie' ? '#8bbf5a' : '#8a4a28'}" opacity=".7"><circle cx="280" cy="372" r="3"/><circle cx="350" cy="384" r="2.6"/><circle cx="430" cy="372" r="3"/><circle cx="510" cy="384" r="2.6"/></g>`
  const seeds = [
    [320, 232, -20],
    [380, 214, 0],
    [440, 226, 15],
    [488, 252, 30],
    [290, 268, -35],
    [352, 262, -10],
    [418, 258, 12],
    [470, 284, 25],
    [330, 300, -15],
    [396, 296, 5],
    [450, 316, 20],
    [356, 332, -5],
    [300, 318, -25],
    [500, 310, 35],
  ]
  return `<g>
  <defs>
    <linearGradient id="bunT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7b955"/><stop offset=".6" stop-color="#d98a2b"/><stop offset="1" stop-color="#a95f17"/></linearGradient>
    <linearGradient id="bunB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e49a35"/><stop offset="1" stop-color="#9a5614"/></linearGradient>
    <linearGradient id="pty" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3419"/><stop offset="1" stop-color="#2a1208"/></linearGradient>
    <linearGradient id="veg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5a2a"/><stop offset="1" stop-color="#3b2a12"/></linearGradient>
    <linearGradient id="chk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a63a"/><stop offset="1" stop-color="#b8661c"/></linearGradient>
    <linearGradient id="chs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd34d"/><stop offset="1" stop-color="#f2970f"/></linearGradient>
    <linearGradient id="lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd14f"/><stop offset="1" stop-color="#3f8f2a"/></linearGradient>
    <linearGradient id="tm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0453a"/><stop offset="1" stop-color="#b3191a"/></linearGradient>
  </defs>
  <path d="M232 436c-8 0-12-6-8-16 4-10 16-14 30-14h292c14 0 26 4 30 14 4 10 0 16-8 16-30 14-90 18-166 18s-140-4-170-18z" fill="url(#bunB)"/>
  <path d="M250 424c40 8 100 12 150 12s110-4 150-12" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${pattyArt}
  ${cheese ? `<path d="M212 348h376l-8 12-30 4-18 22-20-20-50 6-18 18-20-20-50 4-24 20-18-22-34-4z" fill="url(#chs)"/><path d="M230 352h340" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>` : ''}
  ${bacon ? `<path d="M226 346c34 14 56-12 90 0s56-12 90 0 56-12 90 0 40-8 60 2" stroke="#c43a2c" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M226 346c34 14 56-12 90 0s56-12 90 0 56-12 90 0 40-8 60 2" stroke="#ee8a6f" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>` : ''}
  <rect x="236" y="330" width="328" height="20" rx="10" fill="url(#tm)"/>
  <ellipse cx="300" cy="335" rx="30" ry="3.5" fill="#fff" opacity=".35"/>
  <path d="M204 322Q226 304 248 322T292 322T336 322T380 322T424 322T468 322T512 322T556 322T596 322L596 336L204 336Z" fill="url(#lt)"/>
  <path d="M214 326Q236 312 258 326T302 326T346 326" stroke="#c6ee9a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
  <path d="M226 322c-4-96 70-146 174-146s178 50 174 146z" fill="url(#bunT)"/>
  <path d="M262 244c28-34 70-50 112-50" stroke="#fff" stroke-opacity=".5" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  <g fill="#fff3d6">${seeds.map(([sx, sy, r]) => `<ellipse cx="${sx}" cy="${sy}" rx="9" ry="4.4" transform="rotate(${r} ${sx} ${sy})"/>`).join('')}</g>
  <g fill="#c98a3c" opacity=".55">${seeds.map(([sx, sy, r]) => `<ellipse cx="${sx + 2}" cy="${sy + 3}" rx="9" ry="3" transform="rotate(${r} ${sx} ${sy})"/>`).join('')}</g>
  </g>`
}

/* ───────── baguete recheada (vista lateral inclinada) ───────── */
const baguette = (kind) => {
  const fill = {
    costela: `<g>${Array.from({ length: 16 }, (_, i) => `<ellipse cx="${210 + i * 24}" cy="${300 + Math.sin(i * 1.7) * 7}" rx="${16 + (i % 3) * 3}" ry="${10 + (i % 2) * 3}" fill="${i % 2 ? '#6a2f17' : '#8c4322'}" transform="rotate(${((i * 23) % 40) - 20} ${210 + i * 24} 300)"/>`).join('')}</g>
       <path d="M190 312c40 14 70-8 110 4s70-8 110 4 70-8 110 4 50-4 70 4" stroke="#ffb400" stroke-width="12" fill="none" stroke-linecap="round"/>`,
    frango: `<g>${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${216 + i * 26}" cy="${298 + Math.sin(i * 2) * 8}" rx="17" ry="11" fill="${i % 2 ? '#f2d9a8' : '#e6c283'}" transform="rotate(${((i * 31) % 50) - 25} ${216 + i * 26} 298)"/>`).join('')}</g>
       <path d="M190 308c30 16 60-6 90 6s60-6 90 6 60-6 90 6 60-6 90 6 40-4 60 2" stroke="#fff6e0" stroke-width="18" fill="none" stroke-linecap="round"/>
       <g fill="#ffd23a">${Array.from({ length: 16 }, (_, i) => `<circle cx="${220 + i * 22}" cy="${284 + (i % 3) * 6}" r="4.5"/>`).join('')}</g>`,
    calabresa: `<g>${Array.from({ length: 9 }, (_, i) => `<g><ellipse cx="${226 + i * 40}" cy="${298 + (i % 2) * 8}" rx="19" ry="16" fill="#a8301f"/><ellipse cx="${226 + i * 40}" cy="${298 + (i % 2) * 8}" rx="14" ry="11" fill="#c9482e"/><circle cx="${220 + i * 40}" cy="${294 + (i % 2) * 8}" r="2.4" fill="#f1a08a"/><circle cx="${232 + i * 40}" cy="${301 + (i % 2) * 8}" r="2.2" fill="#f1a08a"/></g>`).join('')}</g>
       <g>${Array.from({ length: 22 }, (_, i) => `<rect x="${200 + i * 17}" y="${314 + (i % 3) * 4}" width="9" height="9" rx="2" fill="${i % 3 === 0 ? '#e23b2e' : i % 3 === 1 ? '#7ec24a' : '#f3c93a'}"/>`).join('')}</g>`,
    bacon: `<rect x="196" y="288" width="420" height="34" rx="16" fill="url(#pty)"/>
       <path d="M190 280c30 12 50-12 80 0s50-12 80 0 50-12 80 0 50-12 80 0 40-8 58 2" stroke="#c43a2c" stroke-width="14" fill="none" stroke-linecap="round"/>
       <path d="M200 304c34 16 56-10 90 4s56-12 90 2 56-12 90 2 50-10 74 2" stroke="#ffb400" stroke-width="14" fill="none" stroke-linecap="round"/>
       <g fill="#ffb400">${[250, 360, 470, 560].map((cx) => `<path d="M${cx} 318l14 0 -7 32z"/>`).join('')}</g>`,
  }[kind]
  return `<g transform="translate(-10 40) rotate(-14 400 300)">
  <defs>
    <linearGradient id="crust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b45a"/><stop offset=".5" stop-color="#d98d34"/><stop offset="1" stop-color="#a9611b"/></linearGradient>
    <linearGradient id="crustB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d18a35"/><stop offset="1" stop-color="#8e4f14"/></linearGradient>
    <linearGradient id="pty" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3419"/><stop offset="1" stop-color="#2a1208"/></linearGradient>
    <linearGradient id="lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd14f"/><stop offset="1" stop-color="#3f8f2a"/></linearGradient>
  </defs>
  <path d="M130 330c-18-4-20-26 0-34 60-24 480-24 540 0 20 8 18 30 0 34-60 22-480 22-540 0z" fill="url(#crustB)"/>
  <path d="M150 318c80 12 420 12 500 0" stroke="#fff" stroke-opacity=".2" stroke-width="4" fill="none" stroke-linecap="round"/>
  ${fill}
  <path d="M126 292c-16-4-20-18-6-28 20-18 100-40 280-40s260 22 280 40c14 10 10 24-6 28-70-16-480-16-548 0z" fill="url(#lt)"/>
  <path d="M130 284c-6-10-8-24 8-34 30-26 110-44 262-44s232 18 262 44c16 10 14 24 8 34-30-20-130-26-270-26s-240 6-270 26z" fill="url(#crust)"/>
  <path d="M164 236c60-24 150-34 236-34 90 0 170 12 236 36" stroke="#fff" stroke-opacity=".55" stroke-width="9" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  <g stroke="#a35d17" stroke-width="7" stroke-linecap="round" opacity=".75"><path d="M230 232l22 26M320 224l22 26M410 222l22 26M500 224l22 26M590 232l22 26"/></g>
  <g stroke="#ffe3b0" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M236 230l18 22M326 222l18 22M416 220l18 22M506 222l18 22M596 230l18 22"/></g>
  </g>`
}

/* ───────── batata / anéis de cebola ───────── */
const fries = (variant) => {
  const sticks = Array.from({ length: 26 }, (_, i) => {
    const a = (i - 12.5) * 4.4
    const h = 150 + ((i * 37) % 60)
    return `<g transform="rotate(${a} 400 330)"><rect x="${392 + ((i * 13) % 14) - 7}" y="${330 - h}" width="16" height="${h}" rx="5" fill="url(#fr)"/><rect x="${392 + ((i * 13) % 14) - 7 + 3}" y="${330 - h + 6}" width="4" height="${h - 30}" rx="2" fill="#fff" opacity=".35"/></g>`
  }).join('')
  const sauce =
    variant === 'cheddar'
      ? `<path d="M300 248c14 16 28-4 44 8s26-8 44 4 28-10 44 4 26-6 44 6 20-4 34 2c-10 26-30 8-44 22s-30-6-46 10-30-4-44 10-28-6-44 8-26-2-40 10c-6-30 8-40 8-82z" fill="#ffa81c"/><path d="M308 252c20 8 40-6 60 4s40-8 60 2" stroke="#fff" stroke-opacity=".55" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#a82a1c">${Array.from({ length: 14 }, (_, i) => `<rect x="${310 + i * 18}" y="${250 + ((i * 7) % 28)}" width="11" height="6" rx="2" transform="rotate(${((i * 29) % 60) - 30} ${310 + i * 18} 255)"/>`).join('')}</g>`
      : ''
  return `<g>
  <defs><linearGradient id="fr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f6c744"/><stop offset=".5" stop-color="#ffdf6b"/><stop offset="1" stop-color="#d99a1c"/></linearGradient>
  <linearGradient id="box" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a81818"/><stop offset=".5" stop-color="#e02a22"/><stop offset="1" stop-color="#8d1212"/></linearGradient></defs>
  ${sticks}${sauce}
  <path d="M258 300h284l-34 190q-2 12-14 12H306q-12 0-14-12z" fill="url(#box)"/>
  <path d="M258 300h284l-4 22H262z" fill="#fff" opacity=".18"/>
  <path d="M300 340h200" stroke="#fff" stroke-width="3" stroke-opacity=".5"/>
  <path d="M400 360c-22 24-6 38 0 52 4-14 22-26 0-52z" fill="#ffd23a"/><path d="M400 374c-8 12-2 20 0 28 3-8 10-14 0-28z" fill="#ff6a1a"/>
  <text x="400" y="452" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="30" fill="#fff" letter-spacing="3">MORIÁ</text>
  </g>`
}

const rings = () => `<g>
  <defs><radialGradient id="rg" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffdf7a"/><stop offset="1" stop-color="#c8801a"/></radialGradient></defs>
  ${[
    [300, 410, 118],
    [500, 410, 118],
    [400, 330, 126],
    [330, 250, 112],
    [470, 250, 112],
  ]
    .map(
      ([cx, cy, r], i) =>
        `<g transform="rotate(${i * 9 - 18} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="url(#rg)"/><ellipse cx="${cx}" cy="${cy + 4}" rx="${r * 0.55}" ry="${r * 0.3}" fill="#1c0e0e"/><ellipse cx="${cx - r * 0.2}" cy="${cy - r * 0.28}" rx="${r * 0.4}" ry="${r * 0.07}" fill="#fff" opacity=".5"/><g fill="#a2600f" opacity=".6">${Array.from({ length: 9 }, (_, k) => `<circle cx="${cx - r * 0.8 + k * r * 0.2}" cy="${cy + Math.sin(k) * r * 0.2}" r="3"/>`).join('')}</g></g>`,
    )
    .join('')}</g>`

/* ───────── molhos: pote kraft + bisnaga ───────── */
const sauce = (c1, c2, label, labelColor = '#fff') => `<g>
  <defs><linearGradient id="sc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c2}"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
  <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6a3a"/><stop offset=".5" stop-color="#c9955c"/><stop offset="1" stop-color="#85582c"/></linearGradient></defs>
  <path d="M470 170h60l8 40c14 6 22 14 22 26v220c0 22-14 40-34 40h-52c-20 0-34-18-34-40V236c0-12 8-20 22-26z" fill="url(#sc)"/>
  <path d="M488 222c-6 40-6 150 0 214" stroke="#fff" stroke-opacity=".4" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  <rect x="478" y="140" width="44" height="40" rx="8" fill="#e8e8e8"/><rect x="486" y="118" width="28" height="30" rx="6" fill="#f4f4f4"/>
  <rect x="456" y="290" width="88" height="84" rx="10" fill="#f6efe2"/><rect x="456" y="290" width="88" height="22" rx="10" fill="${c2}"/>
  <text x="500" y="352" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${label.length > 7 ? 13 : 18}" fill="#2a1208">${label}</text>
  <path d="M190 316h200l-16 160q-2 14-16 14H222q-14 0-16-14z" fill="url(#kraft)"/>
  <path d="M184 316h212c4 0 6-4 6-8v-14c0-4-2-8-6-8H184c-4 0-6 4-6 8v14c0 4 2 8 6 8z" fill="#e9d8bf"/>
  <path d="M196 292c14-24 40-36 94-36s80 12 94 36z" fill="url(#sc)"/>
  <path d="M230 272c20-10 50-14 80-10" stroke="#fff" stroke-opacity=".55" stroke-width="8" fill="none" stroke-linecap="round"/>
  <text x="290" y="412" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="24" fill="${labelColor}" letter-spacing="2">MORIÁ</text>
  <path d="M232 430h116" stroke="${labelColor}" stroke-opacity=".6" stroke-width="3"/>
  </g>`

/* ───────── bebidas ───────── */
const can = () => `<g>
  <defs><linearGradient id="cn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d1212"/><stop offset=".3" stop-color="#ee3a2c"/><stop offset=".6" stop-color="#c91f1c"/><stop offset="1" stop-color="#7a0f0f"/></linearGradient>
  <linearGradient id="al" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9aa4b2"/><stop offset=".5" stop-color="#f1f4f8"/><stop offset="1" stop-color="#8b95a3"/></linearGradient></defs>
  <rect x="300" y="160" width="200" height="340" rx="22" fill="url(#cn)"/>
  <path d="M300 190c0-24 14-30 28-30h144c14 0 28 6 28 30z" fill="url(#al)"/><rect x="300" y="470" width="200" height="30" rx="14" fill="url(#al)"/>
  <ellipse cx="400" cy="162" rx="84" ry="14" fill="#d9dee6"/><ellipse cx="400" cy="160" rx="62" ry="9" fill="#aab3bf"/><rect x="374" y="154" width="52" height="8" rx="4" fill="#8d97a5"/>
  <path d="M312 330c60-60 120 40 176-20v70c-56 60-116-40-176 20z" fill="#fff" opacity=".92"/>
  <text x="400" y="278" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="44" fill="#fff" letter-spacing="2">REFRI</text>
  <text x="400" y="440" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="22" fill="#fff" opacity=".85">350 ml</text>
  <path d="M326 200c-8 80-8 220 0 280" stroke="#fff" stroke-opacity=".55" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  <g fill="#fff" fill-opacity=".55">${Array.from({ length: 22 }, (_, i) => `<ellipse cx="${318 + ((i * 53) % 164)}" cy="${210 + ((i * 71) % 260)}" rx="${2 + (i % 3)}" ry="${3 + (i % 3)}"/>`).join('')}</g>
  </g>`

const bottle = () => `<g>
  <defs><linearGradient id="bt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a0f0a"/><stop offset=".4" stop-color="#6a2a14"/><stop offset="1" stop-color="#1f0a07"/></linearGradient></defs>
  <path d="M360 110h80v40c0 10 36 30 36 70v250c0 24-16 40-40 40H364c-24 0-40-16-40-40V220c0-40 36-60 36-70z" fill="url(#bt)" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>
  <rect x="356" y="84" width="88" height="36" rx="8" fill="#d61f1f"/><path d="M366 84v36M378 84v36M390 84v36M402 84v36M414 84v36M426 84v36" stroke="#8d1212" stroke-width="3"/>
  <rect x="326" y="270" width="148" height="130" fill="#d61f1f"/><path d="M326 300c50-26 98 26 148 0v40c-50 26-98-26-148 0z" fill="#fff"/>
  <text x="400" y="372" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="34" fill="#fff" letter-spacing="2">1 L</text>
  <path d="M344 200c-8 60-8 230 0 320" stroke="#fff" stroke-opacity=".45" stroke-width="12" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  <g fill="#fff" fill-opacity=".5">${Array.from({ length: 18 }, (_, i) => `<ellipse cx="${336 + ((i * 47) % 128)}" cy="${420 + ((i * 29) % 90)}" rx="2.4" ry="3.4"/>`).join('')}</g>
  </g>`

const juice = () => `<g>
  <defs><linearGradient id="jc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb52e"/><stop offset="1" stop-color="#f07a0a"/></linearGradient></defs>
  <path d="M330 150h140l-18 350q-1 14-15 14h-74q-14 0-15-14z" fill="#fff" fill-opacity=".1" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>
  <path d="M338 210h124l-14 288q-1 10-12 10h-72q-11 0-12-10z" fill="url(#jc)"/>
  <ellipse cx="400" cy="210" rx="62" ry="9" fill="#ffd27a"/>
  <g fill="#fff" fill-opacity=".35"><rect x="352" y="240" width="38" height="38" rx="6" transform="rotate(-12 371 259)"/><rect x="410" y="300" width="34" height="34" rx="6" transform="rotate(14 427 317)"/><rect x="360" y="370" width="36" height="36" rx="6" transform="rotate(8 378 388)"/></g>
  <path d="M430 60l-20 160" stroke="#d61f1f" stroke-width="12" stroke-linecap="round"/><path d="M430 60l-20 160" stroke="#fff" stroke-width="4" stroke-dasharray="14 14" stroke-linecap="round" opacity=".8"/>
  <circle cx="468" cy="168" r="44" fill="#d6e24a"/><circle cx="468" cy="168" r="35" fill="#eaf27a"/><path d="M468 168l0-35M468 168l30-18M468 168l30 18M468 168l0 35M468 168l-30 18M468 168l-30-18" stroke="#c9d33a" stroke-width="3"/>
  <path d="M352 190c-6 90-8 220 0 300" stroke="#fff" stroke-opacity=".6" stroke-width="10" fill="none" stroke-linecap="round" filter="url(#b4)"/>
  </g>`

/** Escala a arte em torno do centro do quadro (e desloca no eixo Y). */
const fit = (art, k, dy = 0) =>
  `<g transform="translate(400 ${330 + dy}) scale(${k}) translate(-400 -330)">${art}</g>`

/** Posiciona uma arte (centrada em 400,330) no ponto (cx, cy) com escala k. */
const place = (art, cx, cy, k) =>
  `<g transform="translate(${cx} ${cy}) scale(${k}) translate(-400 -330)">${art}</g>`

/* ───────── montagem ───────── */
const files = {
  'baguete-costela': studio('#7a3a12', fit(baguette('costela'), 1.15, -10)),
  'baguete-frango': studio('#6f4a1a', fit(baguette('frango'), 1.15, -10)),
  'baguete-calabresa': studio('#7a1d12', fit(baguette('calabresa'), 1.15, -10)),
  'baguete-bacon': studio('#7a2a12', fit(baguette('bacon'), 1.15, -10)),
  batata: studio('#6b3a10', fit(fries('simples'), 1.12, -5)),
  'batata-cheddar': studio('#7a3a10', fit(fries('cheddar'), 1.12, -5)),
  'aneis-cebola': studio('#6b3a10', rings()),
  'molho-artesanal': studio(
    '#7a2a12',
    fit(sauce('#ff7a1a', '#c4400a', 'ARTESANAL'), 1.12, 0),
  ),
  'molho-barbecue': studio(
    '#4a1a0a',
    fit(sauce('#6b2a12', '#2a0f08', 'BARBECUE'), 1.12, 0),
  ),
  'molho-alho': studio(
    '#5a4a30',
    fit(sauce('#fbf3e0', '#d9c9a0', 'ALHO', '#3a2a12'), 1.12, 0),
  ),
  'refrigerante-lata': studio('#7a1212', can()),
  'refrigerante-1l': studio('#4a1a0e', bottle()),
  suco: studio('#7a3a0a', juice()),
  'x-burguer': studio('#7a2a12', burger({ patty: 'beef', cheese: true })),
  'x-bacon': studio('#7a1d12', burger({ patty: 'beef', cheese: true, bacon: true })),
  'x-frango': studio('#7a3a12', burger({ patty: 'chicken', cheese: true })),
  frango: studio('#7a3a12', burger({ patty: 'chicken', cheese: false })),
  veggie: studio('#2a4a1a', burger({ patty: 'veggie', cheese: false })),
  'combo-classico': studio(
    '#7a1d12',
    `${place(fries('simples'), 590, 290, 0.66)}${place(burger(), 285, 350, 0.82)}${place(can(), 628, 420, 0.5)}`,
  ),
  'combo-casal': studio(
    '#7a1d12',
    `${place(fries('cheddar'), 600, 290, 0.6)}${place(burger({ bacon: true }), 235, 330, 0.6)}${place(burger(), 400, 390, 0.62)}${place(can(), 560, 450, 0.4)}${place(can(), 650, 455, 0.4)}`,
  ),
  'combo-baguete': studio(
    '#7a3a12',
    `${place(fries('simples'), 610, 290, 0.62)}${place(baguette('costela'), 320, 340, 0.82)}${place(can(), 640, 440, 0.46)}`,
  ),
}

for (const [name, svg] of Object.entries(files)) writeFileSync(`${OUT}/${name}.svg`, svg)
console.log(Object.keys(files).length + ' ilustrações geradas em ' + OUT)
