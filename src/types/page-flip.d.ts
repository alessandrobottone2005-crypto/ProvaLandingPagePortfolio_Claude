// tipi minimi per page-flip (il pacchetto non li pubblica): solo ciò che usiamo nel blocco pdf
declare module 'page-flip/dist/js/page-flip.module.js' {
  export type ImpostazioniPageFlip = {
    width: number
    height: number
    size: 'fixed' | 'stretch'
    minWidth: number
    maxWidth: number
    minHeight: number
    maxHeight: number
    showCover: boolean
    usePortrait: boolean
    autoSize: boolean
    drawShadow: boolean
    maxShadowOpacity: number
    flippingTime: number
    mobileScrollSupport: boolean
    showPageCorners: boolean
    startPage: number
    swipeDistance: number
    disableFlipByClick: boolean
  }
  export class PageFlip {
    constructor(elemento: HTMLElement, impostazioni: Partial<ImpostazioniPageFlip>)
    loadFromHTML(pagine: HTMLElement[]): void
    flipNext(): void
    flipPrev(): void
    turnToPage(pagina: number): void
    getCurrentPageIndex(): number
    getPageCount(): number
    getOrientation(): 'portrait' | 'landscape'
    on(evento: 'flip' | 'changeOrientation' | 'init' | 'changeState', cb: (e: { data: unknown }) => void): this
    update(): void
    destroy(): void
  }
}
