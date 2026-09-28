// copia un testo negli appunti, con una soluzione di riserva per i browser senza clipboard api.
export async function copiaNegliAppunti(testo: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(testo)
      return true
    }
  } catch {
    // si prova la soluzione di riserva
  }
  const focus = document.activeElement
  const area = document.createElement('textarea')
  area.value = testo
  area.setAttribute('readonly', '')
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(area)
  area.select()
  let riuscito = false
  try {
    riuscito = document.execCommand('copy')
  } catch {
    riuscito = false
  }
  area.remove()
  // La soluzione di riserva non deve portare il focus da tastiera fuori dal pulsante email.
  if (focus instanceof HTMLElement && focus.isConnected) focus.focus({ preventScroll: true })
  return riuscito
}
