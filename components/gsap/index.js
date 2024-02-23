'use client'

import Tempus from '@studio-freight/tempus'
import gsap from 'gsap'
import { useLayoutEffect } from 'react'
import { ScrollTriggerConfig } from './scroll-trigger'

export function GSAP() {
  useLayoutEffect(() => {
    gsap.defaults({ ease: 'none' })

    // merge rafs
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.remove(gsap.updateRoot)
    Tempus?.add((time) => {
      gsap.updateRoot(time / 1000)
    }, 0)
  }, [])

  return <ScrollTriggerConfig />
}
