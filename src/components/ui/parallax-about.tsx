import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

import './parallax-about.css'

gsap.registerPlugin(ScrollTrigger)

const PARALLAX_LAYERS = [
  { layer: '1', yPercent: 70 },
  { layer: '2', yPercent: 55 },
  { layer: '3', yPercent: 40 },
  { layer: '4', yPercent: 10 },
] as const

const LAYER_IMAGES = {
  1: 'https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp',
  2: 'https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp',
  4: 'https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp',
} as const

type ParallaxAboutProps = {
  scrollRef: RefObject<HTMLElement | null>
}

export function ParallaxAbout({ scrollRef }: ParallaxAboutProps) {
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollRef.current
    const root = parallaxRef.current
    if (!scroller || !root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const triggerElement = root.querySelector<HTMLElement>('[data-parallax-layers]')
    const headerElement = root.querySelector<HTMLElement>('.parallax-about__header')

    const syncViewportHeight = () => {
      scroller.style.setProperty('--parallax-viewport-h', `${scroller.clientHeight}px`)
    }
    syncViewportHeight()

    let lenis: Lenis | null = null
    let tickerRaf: ((time: number) => void) | null = null

    ScrollTrigger.defaults({ scroller })

    if (!reducedMotion) {
      scroller.classList.add('lenis', 'lenis-smooth')

      lenis = new Lenis({
        wrapper: scroller,
        content: root,
        autoRaf: false,
      })

      lenis.on('scroll', ScrollTrigger.update)

      ScrollTrigger.scrollerProxy(scroller, {
        scrollTop(value) {
          if (!lenis) return scroller.scrollTop
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true })
          }
          return lenis.scroll
        },
        getBoundingClientRect() {
          return scroller.getBoundingClientRect()
        },
        pinType: 'transform',
      })

      tickerRaf = (time: number) => {
        lenis?.raf(time * 1000)
      }
      gsap.ticker.add(tickerRaf)
      gsap.ticker.lagSmoothing(0)
    }

    let timeline: gsap.core.Timeline | undefined

    if (triggerElement && headerElement) {
      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          scroller,
          start: '0% 0%',
          end: '100% 0%',
          scrub: true,
          pin: headerElement,
          pinSpacing: true,
          anticipatePin: 1,
        },
      })

      PARALLAX_LAYERS.forEach((layerObj, idx) => {
        timeline!.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: 'none',
          },
          idx === 0 ? undefined : '<'
        )
      })
    }

    const handleResize = () => {
      syncViewportHeight()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', handleResize)
    ScrollTrigger.refresh()

    return () => {
      window.removeEventListener('resize', handleResize)
      ScrollTrigger.getAll().forEach((instance) => {
        if (instance.scroller === scroller) instance.kill()
      })
      ScrollTrigger.scrollerProxy(scroller, {})
      ScrollTrigger.defaults({ scroller: undefined })
      scroller.classList.remove('lenis', 'lenis-smooth')
      timeline?.kill()
      if (tickerRaf) gsap.ticker.remove(tickerRaf)
      lenis?.destroy()
    }
  }, [scrollRef])

  return (
    <div className="parallax-about" ref={parallaxRef}>
      <section className="parallax-about__header">
        <div className="parallax-about__visuals">
          <div className="parallax-about__black-line-overflow" aria-hidden />
          <div data-parallax-layers className="parallax-about__layers">
            <img
              src={LAYER_IMAGES[1]}
              loading="eager"
              width={800}
              data-parallax-layer="1"
              alt=""
              className="parallax-about__layer-img parallax-about__layer-img--back"
            />
            <img
              src={LAYER_IMAGES[2]}
              loading="eager"
              width={800}
              data-parallax-layer="2"
              alt=""
              className="parallax-about__layer-img"
            />
            <div data-parallax-layer="3" className="parallax-about__layer-title">
              <h2 className="parallax-about__title">Parallax</h2>
            </div>
            <img
              src={LAYER_IMAGES[4]}
              loading="eager"
              width={800}
              data-parallax-layer="4"
              alt=""
              className="parallax-about__layer-img parallax-about__layer-img--front"
            />
          </div>
          <div className="parallax-about__fade" aria-hidden />
        </div>
      </section>
      <section className="parallax-about__content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          viewBox="0 0 160 160"
          fill="none"
          className="parallax-about__icon"
          aria-hidden
        >
          <path
            d="M94.8284 53.8578C92.3086 56.3776 88 54.593 88 51.0294V0H72V59.9999C72 66.6273 66.6274 71.9999 60 71.9999H0V87.9999H51.0294C54.5931 87.9999 56.3777 92.3085 53.8579 94.8283L18.3431 130.343L29.6569 141.657L65.1717 106.142C67.684 103.63 71.9745 105.396 72 108.939V160L88.0001 160L88 99.9999C88 93.3725 93.3726 87.9999 100 87.9999H160V71.9999H108.939C105.407 71.9745 103.64 67.7091 106.12 65.1938L106.142 65.1716L141.657 29.6568L130.343 18.3432L94.8284 53.8578Z"
            fill="currentColor"
          />
        </svg>
      </section>
    </div>
  )
}

export default ParallaxAbout
