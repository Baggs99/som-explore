import * as THREE from 'three'

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function tex(c, repeat) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1])
  }
  return t
}

export function rng(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296
}

// striped oatmeal carpet from the photos (pass darker `cols` for a gray carpet)
export function carpetTex(repeat = [0.25, 0.25], base = '#d6c9b3', cols) {
  const [c, g] = canvas(512, 512)
  g.fillStyle = base
  g.fillRect(0, 0, 512, 512)
  const r = rng(7)
  const palette = cols || ['#c4b59c', '#e4d9c6', '#b7b2aa', '#cdbfa8', '#efe6d6']
  for (let i = 0; i < 900; i++) {
    g.fillStyle = palette[Math.floor(r() * palette.length)]
    g.globalAlpha = 0.25 + r() * 0.4
    g.fillRect(r() * 512, 0, 0.6 + r() * 1.6, 512)
  }
  g.globalAlpha = 1
  return tex(c, repeat)
}

// glossy navy drum panels in horizontal bands
export function drumTex() {
  const [c, g] = canvas(512, 512)
  const grd = g.createLinearGradient(0, 0, 0, 512)
  grd.addColorStop(0, '#0a1644')
  grd.addColorStop(0.5, '#132c78')
  grd.addColorStop(1, '#0a1540')
  g.fillStyle = grd
  g.fillRect(0, 0, 512, 512)
  g.fillStyle = 'rgba(0,0,0,0.55)'
  for (let y = 0; y < 512; y += 128) g.fillRect(0, y, 512, 4)
  g.fillStyle = 'rgba(0,0,0,0.35)'
  for (let x = 0; x < 512; x += 170) g.fillRect(x, 0, 2, 512)
  g.fillStyle = 'rgba(160,190,255,0.08)'
  for (let y = 0; y < 512; y += 128) g.fillRect(0, y + 8, 512, 40)
  return tex(c, [8, 1])
}

// cork bulletin board: tan with speckle and a few pin holes
export function corkTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#c69a5b'
  g.fillRect(0, 0, 256, 256)
  const r = rng(31)
  for (let i = 0; i < 6000; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(150,108,58,0.5)' : 'rgba(196,158,96,0.5)'
    g.fillRect(r() * 256, r() * 256, 2, 2)
  }
  for (let i = 0; i < 14; i++) {
    g.fillStyle = 'rgba(80,55,25,0.6)'
    g.beginPath()
    g.arc(r() * 256, r() * 256, 2, 0, Math.PI * 2)
    g.fill()
  }
  return tex(c)
}

// suspended ceiling tiles (2x2 grid, acoustic speckle)
export function ceilingTileTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#eceae6'
  g.fillRect(0, 0, 256, 256)
  const r = rng(17)
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(180,178,172,0.5)' : 'rgba(210,208,202,0.5)'
    g.fillRect(r() * 256, r() * 256, 1.5, 1.5)
  }
  g.strokeStyle = '#c3c1bb'
  g.lineWidth = 4
  for (const p of [0, 128, 256]) {
    g.beginPath(); g.moveTo(p, 0); g.lineTo(p, 256); g.stroke()
    g.beginPath(); g.moveTo(0, p); g.lineTo(256, p); g.stroke()
  }
  return tex(c, [2, 2.4])
}

// gray woven roller shade / wall panel
export function shadeTex() {
  const [c, g] = canvas(128, 128)
  g.fillStyle = '#c4c7cc'
  g.fillRect(0, 0, 128, 128)
  g.strokeStyle = 'rgba(150,153,158,0.5)'
  g.lineWidth = 1
  for (let y = 0; y < 128; y += 3) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(128, y); g.stroke()
  }
  return tex(c)
}

// the "EVENT PARKING $1 CARD ONLY" sandwich-board sign
export function parkingSignTex() {
  const [c, g] = canvas(300, 440)
  g.fillStyle = '#f4f4f2'
  g.fillRect(0, 0, 300, 440)
  g.strokeStyle = '#1c3f94'
  g.lineWidth = 6
  g.strokeRect(8, 8, 284, 424)
  g.fillStyle = '#1c3f94'
  g.beginPath(); g.arc(70, 70, 34, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#fff'
  g.font = 'bold 44px Arial, sans-serif'
  g.fillText('P', 56, 86)
  g.fillStyle = '#1c3f94'
  g.font = 'bold 30px Arial, sans-serif'
  g.fillText('EVENT', 40, 180)
  g.fillText('PARKING', 24, 216)
  g.fillStyle = '#e2561f'
  g.font = 'bold 150px Arial, sans-serif'
  g.fillText('$1', 80, 340)
  g.fillStyle = '#1c3f94'
  g.font = 'bold 26px Arial, sans-serif'
  g.fillText('CARD ONLY', 36, 400)
  return tex(c)
}

// Snyder Forum's dark linear-wood-slat ceiling
export function darkSlatTex() {
  const [c, g] = canvas(64, 256)
  g.fillStyle = '#141210'
  g.fillRect(0, 0, 64, 256)
  for (let y = 0; y < 256; y += 9) {
    g.fillStyle = (y / 9) % 2 ? '#1d1914' : '#231e18'
    g.fillRect(0, y, 64, 6)
    g.fillStyle = 'rgba(0,0,0,0.55)'
    g.fillRect(0, y + 6, 64, 3)
  }
  return tex(c, [8, 8])
}

// frosted "50 YEARS" window decal (transparent background, used on a glass panel)
export function fiftyYearsTex() {
  const [c, g] = canvas(512, 256)
  g.clearRect(0, 0, 512, 256)
  g.fillStyle = 'rgba(255,255,255,0.9)'
  g.textAlign = 'center'
  g.font = 'bold 170px Arial, sans-serif'
  g.fillText('50', 256, 150)
  g.font = 'bold 66px Arial, sans-serif'
  g.fillText('YEARS', 256, 215)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

// Sol LeWitt "Wall Drawing" — concentric rainbow bands (the long mural in the student commons)
export function leWittCircles() {
  const [c, g] = canvas(1024, 256)
  g.fillStyle = '#0d0d10'
  g.fillRect(0, 0, 1024, 256)
  const cols = ['#d61f26', '#f07f1a', '#f5d416', '#2fa84f', '#1f78c8', '#3b2fb0', '#8e2fb0']
  for (let r = 640; r > 0; r -= 11) {
    g.beginPath()
    g.arc(512, 128, r, 0, Math.PI * 2)
    g.fillStyle = cols[Math.floor(r / 11) % cols.length]
    g.fill()
  }
  return tex(c)
}

// Sol LeWitt square print — bands of color (the framed prints in the event/commons rooms)
export function leWittStripes() {
  const [c, g] = canvas(256, 256)
  const cols = ['#d61f26', '#f07f1a', '#f5d416', '#2fa84f', '#1f78c8', '#3b2fb0']
  for (let i = 0; i < 24; i++) {
    g.fillStyle = cols[i % cols.length]
    g.fillRect(0, i * 11, 256, 11)
  }
  return tex(c)
}

// blue digital menu board (servery screens)
export function menuTex() {
  const [c, g] = canvas(256, 384)
  g.fillStyle = '#0b2b5e'
  g.fillRect(0, 0, 256, 384)
  g.fillStyle = '#ffffff'
  g.font = 'bold 26px Arial'
  g.fillText('TODAY', 18, 44)
  g.font = '18px Arial'
  const items = ['Soup of the Day', 'Grill', 'Pasta Bar', 'Salad', 'Grain Bowl', 'Dessert']
  items.forEach((t, i) => {
    g.fillStyle = '#cfe0ff'
    g.fillText(t, 18, 96 + i * 42)
  })
  return tex(c)
}

// light porcelain floor tile for the public circulation / dining / commons
export function tileTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#e9e6df'
  g.fillRect(0, 0, 256, 256)
  g.strokeStyle = 'rgba(150,145,135,0.35)'
  g.lineWidth = 2
  for (let i = 0; i <= 256; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke()
    g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke()
  }
  return tex(c, [6, 6])
}

export function slatsTex() {
  const [c, g] = canvas(128, 256)
  for (let y = 0; y < 256; y += 16) {
    g.fillStyle = '#2e1a0e'
    g.fillRect(0, y, 128, 16)
    g.fillStyle = y % 32 ? '#8d522a' : '#94592e'
    g.fillRect(0, y + 2, 128, 11)
  }
  return tex(c)
}

export function teakTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#b06c38'
  g.fillRect(0, 0, 256, 256)
  const r = rng(3)
  for (let i = 0; i < 140; i++) {
    g.strokeStyle = r() > 0.5 ? 'rgba(90,45,15,0.25)' : 'rgba(220,150,90,0.2)'
    g.lineWidth = 1 + r() * 2
    const y = r() * 256
    g.beginPath()
    g.moveTo(0, y)
    g.bezierCurveTo(80, y + r() * 6 - 3, 170, y + r() * 6 - 3, 256, y)
    g.stroke()
  }
  return tex(c)
}

export function sageTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#aeb08a'
  g.fillRect(0, 0, 256, 256)
  g.fillStyle = 'rgba(40,45,30,0.55)'
  for (const y of [70, 140, 210]) g.fillRect(0, y, 256, 3)
  return tex(c)
}

export function booksTex() {
  const [c, g] = canvas(512, 256)
  g.fillStyle = '#5a3a20'
  g.fillRect(0, 0, 512, 256)
  const r = rng(11)
  const cols = ['#7a1f2b', '#1f3b6b', '#2d5a3c', '#c9a227', '#e8e1d0', '#3b3b3b', '#8b5a2b', '#ff4fa3']
  for (let shelf = 0; shelf < 4; shelf++) {
    let x = 4
    const y0 = shelf * 64 + 6
    while (x < 508) {
      const w = 5 + r() * 9
      const h = 40 + r() * 14
      g.fillStyle = cols[Math.floor(r() * cols.length)]
      g.fillRect(x, y0 + (54 - h), w, h)
      x += w + 1
    }
  }
  return tex(c)
}

export function stoneTex(repeat) {
  const [c, g] = canvas(512, 512)
  g.fillStyle = '#d9ceb5'
  g.fillRect(0, 0, 512, 512)
  g.strokeStyle = 'rgba(90,80,60,0.45)'
  g.lineWidth = 2
  for (let row = 0; row < 16; row++) {
    const y = row * 32
    g.beginPath()
    g.moveTo(0, y)
    g.lineTo(512, y)
    g.stroke()
    for (let x = (row % 2) * 48; x < 512; x += 96) {
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x, y + 32)
      g.stroke()
    }
  }
  return tex(c, repeat)
}

export function lawnTex() {
  const [c, g] = canvas(256, 256)
  g.fillStyle = '#34502a'
  g.fillRect(0, 0, 256, 256)
  const r = rng(5)
  for (let i = 0; i < 3000; i++) {
    g.fillStyle = r() > 0.5 ? 'rgba(80,120,60,0.35)' : 'rgba(20,40,15,0.3)'
    g.fillRect(r() * 256, r() * 256, 2, 2)
  }
  return tex(c, [0.15, 0.15])
}

// abstract mustard / coral / sage mural (Beinecke Terrace Room)
export function muralTex() {
  const [c, g] = canvas(1024, 512)
  g.fillStyle = '#c9a26a'
  g.fillRect(0, 0, 1024, 512)
  const blobs = [
    ['#8fa58a', 120, 180, 380], ['#d9a21b', 520, 420, 420], ['#e9876a', 760, 120, 300],
    ['#e2671f', 900, 380, 260], ['#8fa58a', 420, 40, 220], ['#f2b8a0', 640, 260, 160],
  ]
  for (const [col, x, y, r] of blobs) {
    g.fillStyle = col
    g.globalAlpha = 0.9
    g.beginPath()
    g.ellipse(x, y, r, r * 0.7, 0.4, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
  return tex(c)
}

export function screenTex() {
  const [c, g] = canvas(640, 360)
  const grd = g.createLinearGradient(0, 0, 640, 360)
  grd.addColorStop(0, '#1d3fd1')
  grd.addColorStop(1, '#2f6bff')
  g.fillStyle = grd
  g.fillRect(0, 0, 640, 360)
  g.fillStyle = '#7fd6ff'
  g.font = 'bold 54px Impact, "Arial Narrow", sans-serif'
  g.fillText('MGT 409', 210, 120)
  g.fillText('AI FOUNDATIONS', 150, 180)
  g.fillText('FOR MANAGERS', 160, 240)
  g.fillStyle = '#ff4fa3'
  g.fillText('VIBE ON', 230, 300)
  return tex(c)
}

export function posterTex() {
  const [c, g] = canvas(400, 800)
  g.fillStyle = '#0d0d10'
  g.fillRect(0, 0, 400, 800)
  g.fillStyle = '#ff4fa3'
  g.font = 'bold 70px Georgia, serif'
  g.fillText('MGT 409', 40, 110)
  g.font = '32px Georgia, serif'
  g.fillStyle = '#ffffff'
  g.fillText('Lecture 13', 40, 160)
  g.fillText('Walk the floor.', 40, 200)
  const r = rng(9)
  for (let i = 0; i < 6; i++)
    for (let j = 0; j < 5; j++) {
      g.fillStyle = `hsl(${320 + r() * 40}, 70%, ${35 + r() * 35}%)`
      g.fillRect(40 + j * 66, 260 + i * 80, 58, 70)
    }
  return tex(c)
}

export function signTex(name, num) {
  const [c, g] = canvas(256, 320)
  g.fillStyle = '#2a2a2e'
  g.fillRect(0, 0, 256, 320)
  g.fillStyle = '#f1f1f1'
  g.font = '30px Georgia, serif'
  const words = name.split(' ')
  let line = ''
  let y = 60
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (g.measureText(test).width > 220) {
      g.fillText(line, 18, y)
      y += 36
      line = w
    } else line = test
  }
  g.fillText(line, 18, y)
  g.font = '20px Georgia, serif'
  g.fillText(num, 18, 296)
  return tex(c)
}

export function exitTex() {
  const [c, g] = canvas(128, 48)
  g.fillStyle = '#1a0505'
  g.fillRect(0, 0, 128, 48)
  g.fillStyle = '#ff2b2b'
  g.font = 'bold 34px Arial, sans-serif'
  g.fillText('EXIT', 24, 37)
  return tex(c)
}

export function stairOpeningTex() {
  const [c, g] = canvas(256, 360)
  g.fillStyle = '#e8e6e2'
  g.fillRect(0, 0, 256, 360)
  for (let i = 0; i < 12; i++) {
    g.fillStyle = i % 2 ? '#1e1e22' : '#2c2c31'
    g.fillRect(40, 360 - (i + 1) * 26, 176, 26)
  }
  g.strokeStyle = '#111'
  g.lineWidth = 5
  g.beginPath()
  g.moveTo(36, 340)
  g.lineTo(150, 30)
  g.stroke()
  return tex(c)
}

// building faces across the courtyard: glass with warm lit rooms
export function windowsTex(warm = true) {
  const [c, g] = canvas(512, 256)
  g.fillStyle = '#1d2533'
  g.fillRect(0, 0, 512, 256)
  const r = rng(warm ? 21 : 22)
  for (let x = 0; x < 512; x += 32)
    for (let y = 0; y < 256; y += 64) {
      const lit = r() > 0.25
      g.fillStyle = lit ? (warm ? '#f3d9a4' : '#c9d8f0') : '#2e3a4f'
      g.globalAlpha = lit ? 0.55 + r() * 0.4 : 1
      g.fillRect(x + 2, y + 4, 28, 56)
    }
  g.globalAlpha = 1
  return tex(c, [1, 1])
}

export function skyTex() {
  const [c, g] = canvas(16, 512)
  const grd = g.createLinearGradient(0, 0, 0, 512)
  grd.addColorStop(0, '#1d3a8a')
  grd.addColorStop(0.55, '#5f83d6')
  grd.addColorStop(1, '#c9b9d8')
  g.fillStyle = grd
  g.fillRect(0, 0, 16, 512)
  return tex(c)
}

// made-up stairwell paintings in the spirit of the Stair G portrait
const PALETTES = [
  ['#1b2a6b', '#e63946', '#f4a261', '#2ec4b6', '#ffd166'],
  ['#0f0f12', '#ff4fa3', '#ffd400', '#00b4d8', '#ffffff'],
  ['#3a0ca3', '#f72585', '#4cc9f0', '#ffbe0b', '#06d6a0'],
  ['#264653', '#e76f51', '#e9c46a', '#2a9d8f', '#f4f1de'],
  ['#2b2d42', '#ef233c', '#edf2f4', '#8d99ae', '#ffb703'],
  ['#14213d', '#fca311', '#e5e5e5', '#d00000', '#3a86ff'],
]
export function paintingTex(seed) {
  const [c, g] = canvas(300, 400)
  const r = rng(seed * 97)
  const p = PALETTES[seed % PALETTES.length]
  g.fillStyle = p[0]
  g.fillRect(0, 0, 300, 400)
  // halo rings
  for (let i = 8; i > 0; i--) {
    g.strokeStyle = p[1 + (i % 4)]
    g.lineWidth = 8
    g.beginPath()
    g.arc(150, 150, i * 22, 0, Math.PI * 2)
    g.stroke()
  }
  // patterned bands
  for (let i = 0; i < 14; i++) {
    g.fillStyle = p[1 + Math.floor(r() * 4)]
    g.beginPath()
    const x = r() * 300
    const y = 260 + r() * 140
    g.moveTo(x, y)
    g.lineTo(x + 40, y - 30)
    g.lineTo(x + 80, y)
    g.fill()
  }
  // figure
  const skin = ['#5a3825', '#8d5524', '#c68642', '#3b2219'][seed % 4]
  g.fillStyle = p[1]
  g.fillRect(105, 140, 90, 120) // jacket
  g.fillStyle = p[3]
  g.fillRect(110, 255, 34, 105)
  g.fillRect(156, 255, 34, 105) // legs
  g.fillStyle = '#ffffff'
  g.fillRect(104, 352, 44, 16)
  g.fillRect(152, 352, 44, 16) // sneakers
  g.fillStyle = p[1]
  g.fillRect(104, 362, 44, 6)
  g.fillRect(152, 362, 44, 6)
  g.fillStyle = skin
  g.beginPath()
  g.arc(150, 112, 30, 0, Math.PI * 2)
  g.fill()
  g.fillRect(76, 150, 30, 18)
  g.fillRect(194, 120, 18, 40) // arms
  g.fillStyle = '#111'
  g.fillRect(118, 86, 64, 16) // hair
  for (let i = 0; i < 7; i++) g.fillRect(118 + i * 10, 96, 5, 50 + (i % 3) * 10)
  // dotted pattern on legs
  g.fillStyle = p[4]
  for (let i = 0; i < 30; i++) g.fillRect(112 + (i % 6) * 13, 262 + Math.floor(i / 6) * 18, 4, 4)
  return tex(c)
}
