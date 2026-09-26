// gsap con tutti i plugin registrati una volta sola.
// importa sempre gsap da qui, non direttamente dal pacchetto.
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin)
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, SplitText, useGSAP }
