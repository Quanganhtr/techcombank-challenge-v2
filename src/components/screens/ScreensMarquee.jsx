'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import dynamic from 'next/dynamic'

const HomeScreen   = dynamic(() => import('@/app/screens/home/page'),   { ssr: false })

// Phone native size (HomeScreen renders at 440×956)
const PW = 440
const PH = 956

// Display size (scaled)
const SCALE = 240 / PW       // ≈ 0.545
const VW    = Math.round(PW * SCALE)   // 240
const VH    = Math.round(PH * SCALE)   // 521
const GAP   = 20             // gap between phones (px)

const SCREENS = [
  {
    id: 'home',
    label: 'Home',
    Component: HomeScreen,
    props: {},
  },
  {
    id: 'home-balance',
    label: 'Home — Balance',
    Component: HomeScreen,
    props: { overlayOpen: true },
  },
]

function PhoneCard({ Component, props }) {
  return (
    <div className="shrink-0" style={{ width: VW }}>
      {/* Phone frame */}
      <div
        className="overflow-hidden relative"
        style={{
          width: VW,
          height: VH,
          borderRadius: Math.round(56 * SCALE),
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Screen content scaled down */}
        <div
          style={{
            width: PW,
            height: PH,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <Component {...props} />
        </div>
      </div>
    </div>
  )
}

// Seamless infinite marquee using useAnimationFrame for smooth looping
function Marquee({ speed = 0.6 }) {
  const trackRef  = useRef(null)
  const xRef      = useRef(0)
  const SET_W     = SCREENS.length * (VW + GAP)  // width of one full set

  useAnimationFrame((_, delta) => {
    xRef.current -= speed * (delta / 16.67)  // normalise to 60fps
    if (xRef.current <= -SET_W) xRef.current += SET_W
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${xRef.current}px)`
    }
  })

  // Duplicate the screens for seamless wrap
  const items = [...SCREENS, ...SCREENS]

  return (
    <div className="overflow-hidden w-full">
      <div
        ref={trackRef}
        className="flex will-change-transform"
        style={{ gap: GAP, width: items.length * (VW + GAP) }}
      >
        {items.map((screen, i) => (
          <PhoneCard key={`${screen.id}-${i}`} {...screen} />
        ))}
      </div>
    </div>
  )
}

export function ScreensMarquee() {
  return (
    <section className="bg-black flex flex-col min-h-dvh overflow-hidden" style={{ paddingTop: 128, paddingBottom: 128 }}>
      {/* Section label */}
      <div className="px-8 md:px-16 text-center">
        <h1 className="t-display text-content-inverse">Thank you for listening</h1>
      </div>

      <div className="flex-1 flex items-end">
        <Marquee speed={0.5} />
      </div>
    </section>
  )
}
