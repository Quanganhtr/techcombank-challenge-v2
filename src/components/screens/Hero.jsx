'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { asset } from '../../lib/asset'

const IMAGE_ASPECT = 1832 / 1664 // tin.png native height / width
const SIDE_GAP = 128 // 128px gap from left/right screen edges (Figma)
const TITLE_GAP = 128 // 128px gap between title container and image (Figma)
const TITLE_TOP = 128 // 128px from top of screen to title (Figma)
const SCALE_DONE = 0.35 // fraction of scroll where image reaches full scale (center-aligned)

export function Hero() {
  const pinRef = useRef(null)
  const titleRef = useRef(null)
  const [viewport, setViewport] = useState({ width: 1920, height: 1080 })
  const [titleHeight, setTitleHeight] = useState(280)

  useLayoutEffect(() => {
    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      if (titleRef.current) setTitleHeight(titleRef.current.getBoundingClientRect().height)
    }
    measure()
    window.addEventListener('resize', measure)
    document.fonts?.ready?.then(measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.5 })

  const initialWidth = viewport.width - SIDE_GAP * 2
  const initialTop = TITLE_TOP + titleHeight + TITLE_GAP
  const initialHeight = initialWidth * IMAGE_ASPECT

  const finalWidth = viewport.width
  const finalHeight = finalWidth * IMAGE_ASPECT
  const finalTop = viewport.height - finalHeight

  const scaleDoneTop = 0 // image top matches top of screen when scale completes

  const imageTop = useTransform(progress, [0, SCALE_DONE, 1], [initialTop, scaleDoneTop, finalTop])
  const width = useTransform(progress, [0, SCALE_DONE, 1], [initialWidth, finalWidth, finalWidth])
  const height = useTransform(progress, [0, SCALE_DONE, 1], [initialHeight, finalHeight, finalHeight])

  const titleCenterTop = (viewport.height - titleHeight) / 2
  const titleTop = useTransform(progress, [0, 1], [TITLE_TOP, titleCenterTop])
  const headingColor = useTransform(progress, [0, 0.3], ['#101828', '#ffffff'])

  return (
    <section ref={pinRef} className="relative h-[250vh]">
      <div className="bg-surface-raised sticky top-0 h-screen w-full overflow-hidden">
        <motion.div style={{ top: imageTop, width, height }} className="absolute left-1/2 -translate-x-1/2 z-0">
          <Image
            src={asset("/tin.png")}
            alt="Techcombank Mobile AI-First Redesign — Home, Search and Wealth screens preview"
            fill
            sizes="100vw"
            priority
            unoptimized
            className="object-cover"
          />
        </motion.div>

        <motion.div
          ref={titleRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ top: titleTop }}
          className="absolute inset-x-0 z-10 flex flex-col items-center gap-3 max-w-(--spacing-max-width) w-full text-center px-8 mx-auto"
        >
          <motion.p style={{ color: headingColor }} className="t-body-lg">
            Quang Anh Tran
          </motion.p>
          <motion.h1 style={{ color: headingColor }} className="t-display">
            Techcombank Mobile:
            <br />
            AI-First Redesign
          </motion.h1>
          <motion.p style={{ color: headingColor }} className="t-body-lg">
            Home - Search - Wealth and Investment
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
