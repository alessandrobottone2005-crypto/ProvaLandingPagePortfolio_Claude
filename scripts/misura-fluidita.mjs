// npm run misura-fluidita -- [url] [telefono]
// misura la fluidità del percorso con google chrome (gpu vera del mac, senza finestra):
// scorre la pagina a velocità costante e registra la durata di ogni fotogramma per tratto.
// "telefono" = viewport 390×844 con cpu rallentata 4×: solo un’indicazione, non equivale a un telefono vero.
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const url = process.argv[2] ?? 'http://localhost:4173/'
const telefono = process.argv[3] === 'telefono'
const [w, h] = telefono ? [390, 844] : [1440, 900]
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const porta = 9400 + Math.floor(Math.random() * 400)
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'misura-'))}`, '--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', `--window-size=${w},${h}`, 'about:blank'], { stdio: 'ignore' })
const attesa = (ms) => new Promise((r) => setTimeout(r, ms))
let pagina
for (let i = 0; i < 60 && !pagina; i++) {
  await attesa(250)
  try { pagina = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((t) => t.type === 'page') } catch { /* chrome si sta avviando */ }
}
const ws = new WebSocket(pagina.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const attese = new Map()
ws.onmessage = (m) => { const d = JSON.parse(m.data); attese.get(d.id)?.(d); attese.delete(d.id) }
const cmd = (method, params = {}) => new Promise((r) => { const i = ++id; attese.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
const valuta = async (expression) => (await cmd('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value

await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: telefono ? 3 : 2, mobile: telefono })
if (telefono) {
  await cmd('Emulation.setTouchEmulationEnabled', { enabled: true })
  await cmd('Emulation.setCPUThrottlingRate', { rate: 4 })
}
await cmd('Page.navigate', { url })
for (let i = 0; i < 80; i++) {
  await attesa(250)
  if (await valuta(`document.querySelector('main')?.getAttribute('aria-busy') === 'false'`)) break
}
await attesa(2500) // modelli scaricati dopo il preloader

const risultato = await valuta(`new Promise((fine) => {
  const totale = document.documentElement.scrollHeight - innerHeight
  const durata = Math.max(12000, (totale / innerHeight) * 1400) // ≈ 0,7 schermi al secondo
  const fotogrammi = []
  let inizio = 0, prima = 0
  const tratto = () => {
    const host = document.querySelector('[data-logo-continuo]')
    const fase = host?.dataset.fase ?? 'header'
    if (fase === 'header') return Number(host?.style.opacity || 0) > 0.01 ? 'header 3d' : 'header 2d'
    if (fase === 'computer') return document.querySelector('[data-mac]')?.hasAttribute('inert') ? 'discesa' : 'sosta computer'
    if (fase === 'verso-computer') return 'discesa'
    if (fase === 'verso-contatti') return 'contatti'
    return fase === 'biografia' ? 'chi sono' : fase
  }
  const passo = (t) => {
    if (!inizio) { inizio = prima = t; requestAnimationFrame(passo); return }
    fotogrammi.push([t - prima, tratto()])
    prima = t
    const p = Math.min(1, (t - inizio) / durata)
    scrollTo(0, p * totale)
    if (p < 1) requestAnimationFrame(passo)
    else fine(fotogrammi)
  }
  requestAnimationFrame(passo)
})`)

const perTratto = new Map()
for (const [dt, t] of risultato) (perTratto.get(t) ?? perTratto.set(t, []).get(t)).push(dt)
const righe = [...perTratto].map(([t, dts]) => {
  const ordinati = [...dts].sort((a, b) => b - a)
  const media = dts.reduce((s, x) => s + x, 0) / dts.length
  const peggiore = ordinati.slice(0, Math.max(1, Math.round(dts.length / 100)))
  return {
    tratto: t,
    fotogrammi: dts.length,
    'fps medi': +(1000 / media).toFixed(1),
    'fps 1% peggiore': +(1000 / (peggiore.reduce((s, x) => s + x, 0) / peggiore.length)).toFixed(1),
    'oltre 33 ms': dts.filter((x) => x > 33.4).length,
    'più lungo (ms)': +ordinati[0].toFixed(0),
  }
})
console.log(`\n${telefono ? 'telefono emulato (cpu 4× più lenta)' : 'desktop 1440×900'} — ${url}`)
console.table(righe)
ws.close()
chrome.kill()
