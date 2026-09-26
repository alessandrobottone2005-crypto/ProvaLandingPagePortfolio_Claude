import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { validaProgetti } from './scripts/valida-progetti.ts'

// controlla tutti i progetti: in build si ferma con un messaggio chiaro, in sviluppo avvisa nel terminale
function controllaProgetti(): Plugin {
  const controlla = () => validaProgetti().errori
  return {
    name: 'controlla-progetti',
    buildStart() {
      const errori = controlla()
      if (errori.length) this.error(`\n\nci sono problemi nei progetti:\n\n${errori.join('\n')}\n`)
    },
    configureServer(server) {
      const avvisa = (percorso?: string) => {
        if (percorso && !percorso.includes('/src/content/progetti/')) return
        const errori = controlla()
        if (errori.length) server.config.logger.error(`\nci sono problemi nei progetti:\n${errori.join('\n')}\n`)
      }
      avvisa()
      server.watcher.on('add', avvisa).on('change', avvisa).on('unlink', avvisa)
    },
  }
}

// precarica il file di outfit (caratteri latini), così il testo non cambia font dopo il caricamento
function precaricaFont(): Plugin {
  const nome = /outfit-latin-wght-normal.*\.woff2$/
  return {
    name: 'precarica-font',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        let href = '/node_modules/@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2'
        if (ctx.bundle) {
          const file = Object.keys(ctx.bundle).find((f) => nome.test(f))
          if (!file) return
          href = `/${file}`
        }
        return [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: '' }, injectTo: 'head-prepend' }]
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), controllaProgetti(), precaricaFont()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  // librerie del pannello (scaricate solo all’apertura): le preparo subito, così in sviluppo
  // vite non le scopre a metà navigazione ricaricando la pagina con due copie di react
  optimizeDeps: {
    include: [
      'react-pdf',
      'page-flip/dist/js/page-flip.module.js',
      '@react-three/fiber',
      '@react-three/drei/core/OrbitControls',
      '@react-three/drei/core/ContactShadows',
      'three/examples/jsm/loaders/GLTFLoader.js',
      'three/examples/jsm/libs/meshopt_decoder.module.js',
    ],
  },
  build: {
    // nessuna immagine “incollata” dentro il codice: i file restano separati e si scaricano solo quando servono
    assetsInlineLimit: 0,
  },
})
