'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { asset } from '../../../lib/asset'

/* ─── Image sequence player ─────────────────────────────────────────── */

const TOTAL_FRAMES = 104
const FPS = 30

function frameSrc(n) {
  const name = n < 100 ? String(n).padStart(5, '0') : String(n).padStart(6, '0')
  return asset(`/image-sequences/${name}.webp`)
}

function ImageSequencePlayer() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Preload all frames
    const images = []
    let loaded = 0
    let rafId = null
    let frameIdx = 0
    let lastTime = 0
    const interval = 1000 / FPS

    function tick(now) {
      rafId = requestAnimationFrame(tick)
      if (now - lastTime < interval) return
      lastTime = now
      const img = images[frameIdx]
      if (img?.complete && img.naturalWidth) {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        ctx.drawImage(img, 0, 0)
      }
      frameIdx = (frameIdx + 1) % TOTAL_FRAMES
    }

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image()
      img.src = frameSrc(i)
      img.onload = () => {
        loaded++
        if (loaded === TOTAL_FRAMES) rafId = requestAnimationFrame(tick)
      }
      images.push(img)
    }

    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [])

  return (
    <canvas ref={canvasRef} className="absolute inset-0 size-full object-cover pointer-events-none" />
  )
}

/* ─── Data ─────────────────────────────────────────────────────────── */

// Exact dot positions from Figma (x, y) in a 120×80px container
const SPARKLINE_DOTS = [
  { x: 0, y: 56 }, { x: 8, y: 56 }, { x: 16, y: 48 }, { x: 24, y: 40 },
  { x: 32, y: 48 }, { x: 40, y: 48 }, { x: 48, y: 40 }, { x: 56, y: 32 },
  { x: 64, y: 24 }, { x: 72, y: 24 }, { x: 80, y: 32 }, { x: 88, y: 32 },
  { x: 96, y: 24 }, { x: 104, y: 16 }, { x: 112, y: 8 },
]

const BONDS = [
  { id: 'vhm1', ticker: 'VHM12605', maturity: '30th July 2026', amount: '7,000,000', yieldStr: 'Est. Yield 10.8%' },
  { id: 'vhm2', ticker: 'VHM12605', maturity: '30th Jun 2026',  amount: '5,000,000', yieldStr: 'Est. Yield 9.8%'  },
]

const ASSET_FILTERS = ['All', 'Equities', 'Bonds', 'Fund']

const TOP_GAINS = [
  { ticker: 'TCB', change: '+ 1.29%', spark: asset('/sparkline-up.svg'),   logo: asset('/tcb-logo.png'), logoBg: '#f3f4f6' },
  { ticker: 'VIC', change: '+ 0.98%', spark: asset('/sparkline-wave.svg'), logo: asset('/vic-logo.png'), logoBg: '#f3f4f6' },
  { ticker: 'MSN', change: '+ 0.41%', spark: asset('/sparkline-wave.svg'), logo: asset('/msn-logo.png'), logoBg: '#101828' },
]

/* ─── Micro-components ──────────────────────────────────────────────── */

function Icon({ name, size = 24, className = '' }) {
  return (
    <span className={`material-symbols-outlined leading-none select-none ${className}`} style={{ fontSize: size }}>
      {name}
    </span>
  )
}

function InlineBlinkingCursor() {
  return (
    <motion.span
      aria-hidden="true"
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="ml-1 inline-block h-5 w-1 rounded-full bg-info align-[-4px]"
    />
  )
}

function TypewriterInputText({ text }) {
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (!text) return undefined

    const chars = Array.from(text)
    let index = 0
    const id = setInterval(() => {
      index += 1
      setDisplayText(chars.slice(0, index).join(''))
      if (index >= chars.length) clearInterval(id)
    }, 18)

    return () => clearInterval(id)
  }, [text])

  return (
    <>
      {displayText}
      <InlineBlinkingCursor />
    </>
  )
}

function StatusBar({ dark = false }) {
  const imgStyle = dark ? { filter: 'invert(1)' } : {}
  return (
    <div className="flex items-center justify-between px-14 pt-6 pb-1 shrink-0">
      <span className={`text-[15px] font-semibold ${dark ? 'text-content-primary' : 'text-white'}`}>9:41</span>
      <div className="flex items-center gap-1">
        <Image src={asset("/cellular.svg")} alt="" width={16} height={16} style={imgStyle} />
        <Image src={asset("/wifi.svg")}     alt="" width={16} height={16} style={imgStyle} />
        <Image src={asset("/battery.svg")}  alt="" width={16} height={16} style={imgStyle} />
      </div>
    </div>
  )
}

function Sparkline() {
  return (
    <div className="relative w-[120px] h-[80px] shrink-0">
      {SPARKLINE_DOTS.map((dot, i) => (
        <div
          key={i}
          className="absolute size-2 rounded-xs bg-success border-[0.5px] border-solid border-[#f9fafb]"
          style={{ left: dot.x, top: dot.y }}
        />
      ))}
    </div>
  )
}

function FanCard({ ticker, yieldStr }) {
  return (
    <div className="bg-surface-raised border border-border-default rounded-2xl overflow-hidden">
      <div className="flex gap-2.5 items-start p-4">
        <div className="flex flex-col gap-1 w-10">
          <p className="text-md font-medium text-content-primary leading-6">{ticker}</p>
          <p className="text-[12px] text-content-primary leading-4">Equities</p>
        </div>
        <p className="text-[16px] font-medium text-success leading-6 whitespace-nowrap">{yieldStr}</p>
      </div>
    </div>
  )
}

function AssetDivider() {
  return (
    <div className="bg-white pl-20 pr-4 w-full">
      <div className="bg-surface-overlay h-px opacity-10 rounded-full w-full" />
    </div>
  )
}

/* ── Explore tab sub-components ─────────────────────────────────────── */

function YieldBadge({ value, up = true, light = false }) {
  return (
    <div className={`flex items-center justify-center gap-1 pl-1 pr-3 py-1 rounded-full border shrink-0 ${
      up ? (light ? 'border-[#00a63e]' : 'border-[#05df72]') : 'border-[#e7000b]'
    }`}>
      <span className="material-symbols-outlined leading-none select-none text-[20px]" style={{ transform: up ? 'rotate(180deg)' : 'none', color: up ? (light ? '#00a63e' : '#05df72') : '#e7000b' }}>
        arrow_drop_down
      </span>
      <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] whitespace-nowrap ${up ? (light ? 'text-success' : 'text-[#05df72]') : 'text-danger'}`}>{value}</span>
    </div>
  )
}

function SectionHeader({ title, light = false }) {
  return (
    <div className="flex items-center justify-between pl-5 pr-6 pt-4 pb-2 w-full shrink-0">
      <p className={`text-[16px] font-semibold leading-6 tracking-[0.32px] ${light ? 'text-[#404040]' : 'text-[#d4d4d4]'}`}>{title}</p>
      <Icon name="chevron_right" size={24} className={light ? 'text-[#a1a1a1]' : 'text-[#737373]'} />
    </div>
  )
}

function IndexCard({ name, time, date, value, change, positive, onDragStart, light = false }) {
  return (
    <div
      onPointerDown={(e) => onDragStart?.(e, { ticker: name, avatar: { type: 'icon', icon: 'trending_up' } })}
      className={`flex flex-col h-40 w-[156px] shrink-0 items-start justify-between overflow-hidden p-4 rounded-3xl touch-none cursor-grab active:cursor-grabbing ${light ? 'bg-[#f5f5f5]' : 'bg-[#171717]'}`}
    >
      <div className="flex flex-col gap-1 w-full">
        <p className={`text-[14px] font-medium leading-5 ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{name}</p>
        <div className="flex gap-1 text-[12px] font-medium text-[#737373] leading-4">
          <span>{time}</span><span>·</span><span>{date}</span>
        </div>
      </div>
      <div className="flex items-end justify-between w-full">
        <div className="flex flex-col gap-1">
          <p className={`text-[24px] font-bold leading-8 tracking-[0.48px] whitespace-nowrap ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{value}</p>
          <p className={`text-[14px] font-medium leading-5 ${positive ? (light ? 'text-success' : 'text-green-400') : 'text-danger'}`}>{change}</p>
        </div>
        <span className="shrink-0">
          <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
        </span>
      </div>
    </div>
  )
}

function ExploreDivider() {
  return (
    <div className="pl-[83px] pr-4 w-full shrink-0">
      <div className="bg-[#737373] h-px opacity-10 rounded-full w-full" />
    </div>
  )
}

const VIETNAM_INDICES = [
  { name: 'Hose',  time: '15:00:00', date: '01 Jul', value: '1,867.21', change: '+0.39%', positive: true  },
  { name: 'HNX',   time: '15:00:00', date: '01 Jul', value: '310.98',   change: '-0.39%', positive: false },
  { name: 'UPCOM', time: '15:00:00', date: '01 Jul', value: '129.57',   change: '+0.39%', positive: true  },
]

const COMMODITY_INDICES = [
  { name: 'Gold',   time: '15:00:00', date: '01 Jul', value: '3,342.10', change: '+0.52%', positive: true  },
  { name: 'Silver', time: '15:00:00', date: '01 Jul', value: '36.48',    change: '-0.21%', positive: false },
  { name: 'Oil',    time: '15:00:00', date: '01 Jul', value: '83.77',    change: '+0.39%', positive: true  },
]

const GLOBAL_INDICES = [
  { name: 'S&P 500', time: '16:00:00', date: '01 Jul', value: '5,460.48', change: '+0.54%', positive: true  },
  { name: 'Nikkei',  time: '15:30:00', date: '01 Jul', value: '39,681.32', change: '-0.32%', positive: false },
  { name: 'FTSE',    time: '16:30:00', date: '01 Jul', value: '8,164.12', change: '+0.18%', positive: true  },
]

const EXPLORE_FILTERS = [
  { id: 'equities',    label: 'Top equities'  },
  { id: 'bonds',       label: 'Top bonds'     },
  { id: 'fund',        label: 'Top fund'      },
  { id: 'vietnam',     label: 'Vietnam stock' },
  { id: 'commodities', label: 'Commodities'   },
  { id: 'global',      label: 'Global stock'  },
]

function ExploreContent({ onDragStart, light = false }) {
  const [activeFilter, setActiveFilter] = useState('equities')
  const scrollRef = useRef(null)
  const chipsRef = useRef(null)
  const chipRefs = useRef({})
  const isProgrammaticScroll = useRef(false)
  const sectionRefs = {
    equities:    useRef(null),
    bonds:       useRef(null),
    fund:        useRef(null),
    vietnam:     useRef(null),
    commodities: useRef(null),
    global:      useRef(null),
  }

  // Scroll to section when chip clicked
  const handleChipClick = (id) => {
    setActiveFilter(id)
    const el = sectionRefs[id]?.current
    const container = scrollRef.current
    if (!el || !container) return
    isProgrammaticScroll.current = true
    const containerRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    container.scrollTo({ top: container.scrollTop + (elRect.top - containerRect.top), behavior: 'smooth' })
    // Re-enable spy after smooth scroll finishes (~500ms)
    setTimeout(() => { isProgrammaticScroll.current = false }, 600)
  }

  // Scroll spy: update active chip as sections hit the top
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const onScroll = () => {
      if (isProgrammaticScroll.current) return
      const containerTop = container.getBoundingClientRect().top
      let current = 'equities'
      for (const { id } of EXPLORE_FILTERS) {
        const el = sectionRefs[id]?.current
        if (!el) continue
        if (el.getBoundingClientRect().top - containerTop <= 8) current = id
      }
      setActiveFilter(current)
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  // Keep the active chip at the left edge (inside the 24px padding inset)
  useEffect(() => {
    const chips = chipsRef.current
    const chip = chipRefs.current[activeFilter]
    if (!chips || !chip) return
    chips.scrollTo({ left: chip.offsetLeft - 24, behavior: 'smooth' })
  }, [activeFilter])

  const EQUITIES = [
    { ticker: 'TCB', name: 'Vietnam Technological And Commercial Joint Stock Bank', logo: asset('/tcb-logo.png'), logoBg: '#f3f4f6', price: '34.30',  change: '+1.29%' },
    { ticker: 'VIC', name: 'VinGroup Joint Stock Company',                          logo: asset('/vic-logo.png'), logoBg: '#f3f4f6', price: '217.10', change: '+0.98%' },
    { ticker: 'MSN', name: 'Masan Group Corporation',                               logo: asset('/msn-logo.png'), logoBg: '#101828', price: '72.80',  change: '+0.41%' },
  ]

  const EXPLORE_BONDS = [
    { id: 1, ticker: 'VHM12605', maturity: 'Maturity: 30th July 2026', yield: '11.18%' },
    { id: 2, ticker: 'VHM12605', maturity: 'Maturity: 30th July 2026', yield: '10.69%' },
    { id: 3, ticker: 'VHM12605', maturity: 'Maturity: 30th July 2026', yield: '10.69%' },
  ]

  const FUNDS = [
    { ticker: 'TCEF',  name: 'Techcom Equity Fund',            logo: asset('/tcb-logo.png'),  yield: '11.18%' },
    { ticker: 'TCRES', name: 'Techcom Real Estate Equity Fund', logo: asset('/tcb-logo.png'),  yield: '10.69%' },
    { ticker: 'DCDS',  name: 'DC Dynamic Securities',           logo: asset('/dcds-logo.png'), yield: '10.69%' },
  ]

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full">
      {/* Filter chips — pinned above the scroll, sitting directly on the main
          gradient card like the Figma design (no nested inner card) */}
      <div className="relative shrink-0 pt-3">
        <div ref={chipsRef} className="flex gap-1 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden pl-5 pr-16">
          {EXPLORE_FILTERS.map(f => (
            <button
              key={f.id}
              ref={el => { chipRefs.current[f.id] = el }}
              onClick={() => handleChipClick(f.id)}
              className={`flex items-center px-4 py-2 rounded-full shrink-0 ${
                activeFilter === f.id
                  ? (light ? 'bg-[#111111]' : 'bg-[#fafafa]')
                  : (light ? 'bg-white/60' : 'bg-[rgba(17,17,17,0.6)]')
              }`}
            >
              <span className={`text-[14px] font-medium leading-5 whitespace-nowrap ${
                activeFilter === f.id
                  ? (light ? 'text-white' : 'text-[#111111]')
                  : (light ? 'text-[#111111]' : 'text-[#fafafa]')
              }`}>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content — top edge masked so rows fade out under the
          pinned chips instead of a hard cut (works over the gradient bg) */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden pb-44"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0px, black 32px)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 32px)',
        }}
      >

          {/* Top equities */}
          <div ref={sectionRefs.equities} />
          <SectionHeader title="Top equities" light={light} />
          {EQUITIES.map((eq, i) => (
            <div key={eq.ticker}>
              <div
                onPointerDown={(e) => onDragStart?.(e, { ticker: eq.ticker, avatar: { type: 'image', src: eq.logo, bg: eq.logoBg } })}
                className="flex gap-1 items-center justify-center pl-4 pr-2 py-3 w-full touch-none cursor-grab active:cursor-grabbing"
              >
                <div className="flex-1 flex items-start justify-between min-w-0">
                  <div className="flex-1 flex gap-4 items-center min-w-0">
                    <div className="size-11 rounded-full overflow-hidden shrink-0 relative" style={{ background: eq.logoBg }}>
                      <Image src={eq.logo} alt={eq.ticker} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1 pr-10">
                      <p className={`text-[14px] font-medium leading-5 ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{eq.ticker}</p>
                      <p className="text-[12px] font-medium text-[#737373] leading-4 truncate">{eq.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 items-end text-right shrink-0">
                    <p className={`text-[14px] font-semibold leading-6 font-mono tabular-nums ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>{eq.price}</p>
                    <p className={`text-[12px] font-medium leading-4 ${light ? 'text-success' : 'text-green-400'}`}>{eq.change}</p>
                  </div>
                </div>
                <span className="shrink-0">
                  <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
                </span>
              </div>
              {i < EQUITIES.length - 1 && <ExploreDivider />}
            </div>
          ))}

          {/* Top bonds */}
          <div ref={sectionRefs.bonds} />
          <SectionHeader title="Top bonds" light={light} />
          {EXPLORE_BONDS.map((bond, i) => (
            <div key={bond.id}>
              <div
                onPointerDown={(e) => onDragStart?.(e, { ticker: bond.ticker, avatar: { type: 'icon', icon: 'analytics' } })}
                className="flex gap-1 items-center pl-5 pr-2 py-3 w-full touch-none cursor-grab active:cursor-grabbing"
              >
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="rounded-full flex items-center justify-center shrink-0 size-11" style={{ background: '#bedbff' }}>
                      <Image src={asset("/invest-bonds.png")} alt="" width={20} height={20} />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className={`text-[14px] font-medium leading-5 ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{bond.ticker}</p>
                      <p className="text-[12px] font-medium text-[#737373] leading-4">{bond.maturity}</p>
                    </div>
                  </div>
                  <YieldBadge value={bond.yield} up={true} light={light} />
                </div>
                <span className="shrink-0">
                  <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
                </span>
              </div>
              {i < EXPLORE_BONDS.length - 1 && <ExploreDivider />}
            </div>
          ))}

          {/* Top fund */}
          <div ref={sectionRefs.fund} />
          <SectionHeader title="Top fund" light={light} />
          {FUNDS.map((fund, i) => (
            <div key={fund.ticker}>
              <div
                onPointerDown={(e) => onDragStart?.(e, { ticker: fund.ticker, avatar: { type: 'image', src: fund.logo, bg: '#f3f4f6' } })}
                className="flex gap-1 items-center pl-5 pr-2 py-3 w-full touch-none cursor-grab active:cursor-grabbing"
              >
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="size-11 rounded-full bg-[#f3f4f6] overflow-hidden shrink-0 relative">
                      <Image src={fund.logo} alt={fund.ticker} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className={`text-[14px] font-medium leading-5 ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{fund.ticker}</p>
                      <p className="text-[12px] font-medium text-[#737373] leading-4 truncate">{fund.name}</p>
                    </div>
                  </div>
                  <YieldBadge value={fund.yield} up={true} light={light} />
                </div>
                <span className="shrink-0">
                  <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
                </span>
              </div>
              {i < FUNDS.length - 1 && <ExploreDivider />}
            </div>
          ))}

          {/* Vietnam stock indices */}
          <div ref={sectionRefs.vietnam} />
          <SectionHeader title="Vietnam stock indices" light={light} />
          <div className="flex gap-2 items-start px-5 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {VIETNAM_INDICES.map(idx => <IndexCard key={idx.name} {...idx} onDragStart={onDragStart} light={light} />)}
          </div>

          {/* Commodities */}
          <div ref={sectionRefs.commodities} />
          <SectionHeader title="Commodities" light={light} />
          <div className="flex gap-2 items-start px-5 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {COMMODITY_INDICES.map(idx => <IndexCard key={idx.name} {...idx} onDragStart={onDragStart} light={light} />)}
          </div>

          {/* Global stock indices */}
          <div ref={sectionRefs.global} />
          <SectionHeader title="Global stock indices" light={light} />
          <div className="flex gap-2 items-start px-5 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {GLOBAL_INDICES.map(idx => <IndexCard key={idx.name} {...idx} onDragStart={onDragStart} light={light} />)}
          </div>
        </div>
    </div>
  )
}

function BottomNav({ onNavigate }) {
  const [active, setActive] = useState('investment')

  const tabs = [
    { id: 'home',       label: 'Home'      },
    { id: 'cards',      label: 'Cards'     },
    { id: 'rewards',    label: 'Rewards'   },
    { id: 'investment', label: 'My wealth' },
  ]

  const handleTabChange = (tabId) => {
    setActive(tabId)
    if (tabId !== 'investment') onNavigate?.(tabId)
  }

  const icons = {
    home:       <Image src={asset("/logo.svg")}  alt="" width={24} height={24} />,
    cards:      <Icon name="credit_card" size={24} className={active === 'cards' ? 'text-content-inverse' : 'text-content-secondary'} />,
    rewards:    <Icon name="redeem"      size={24} className={active === 'rewards' ? 'text-content-inverse' : 'text-content-secondary'} />,
    investment: <Icon name="money_bag"   size={24} className="text-content-inverse" />,
  }

  const navBarRef = useRef(null)
  const tabRefs   = useRef({})
  const [pill, setPill] = useState(null)

  useLayoutEffect(() => {
    const el  = tabRefs.current[active]
    const bar = navBarRef.current
    if (!el || !bar) return
    setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  return (
    <div
      className="px-4 py-2 pb-8 shrink-0"
      style={{ background: 'linear-gradient(to bottom, rgba(249,250,251,0), #f9fafb)' }}
    >
      <div className="flex items-center gap-2">
        <div ref={navBarRef} className="relative flex-1 flex items-center gap-1 p-1 bg-surface-raised border border-border-default rounded-full shadow-xl">
          {pill && (
            <div
              className="absolute top-1 bottom-1 bg-surface-overlay rounded-full"
              style={{
                left: pill.left,
                width: pill.width,
                transition: 'left 0.28s cubic-bezier(0.34,1.56,0.64,1), width 0.28s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          )}
          {tabs.map(tab => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[tab.id] = el }}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center justify-center gap-1 px-4 py-3 rounded-full ${isActive ? 'flex-1' : ''}`}
              >
                <span className="relative z-10 flex items-center gap-1 overflow-hidden">
                  <span className="shrink-0">{icons[tab.id]}</span>
                  <span
                    className="t-label text-content-inverse whitespace-nowrap"
                    style={{ opacity: isActive ? 1 : 0, maxWidth: isActive ? '999px' : 0, overflow: 'hidden', transition: 'opacity 0.15s' }}
                  >
                    {tab.label}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <button className="size-14 rounded-full bg-surface-raised border border-border-strong flex items-center justify-center shrink-0 shadow-xl">
          <Image src={asset("/ai.png")} alt="AI" width={24} height={24} />
        </button>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────── */

function AnalyzeOverlay({ onClose, showCard = true, light = false }) {
  // Same contrast rule as Home's overlays: light app → dark card.
  const dark = light

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex flex-col justify-end px-4 pb-10 pt-4"
      style={{
        backdropFilter: 'blur(2px)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        pointerEvents: showCard ? 'auto' : 'none',
        zIndex: showCard ? 60 : 55,
      }}
      onClick={showCard ? onClose : undefined}
    >
      {showCard && (
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={`rounded-4xl p-4 flex flex-col gap-4 w-full ${dark ? 'bg-[#111111]' : 'bg-surface'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <p className={`text-[24px] font-semibold leading-8 ${dark ? 'text-white' : 'text-content-primary'}`}>Analyze</p>
          <button
            onClick={onClose}
            className={`size-12 rounded-full flex items-center justify-center shrink-0 ${dark ? 'bg-[#171717]' : 'bg-surface-sunken'}`}
          >
            <Icon name="close" size={24} className={dark ? 'text-white' : 'text-content-primary'} />
          </button>
        </div>

        {/* Health score */}
        <div className={`rounded-3xl p-4 flex flex-col gap-1 ${dark ? 'bg-[#171717]' : 'bg-[#f0fdf4]'}`}>
          <p className={`text-[16px] font-medium leading-6 ${dark ? 'text-white' : 'text-content-primary'}`}>Health score</p>
          <p className={`text-[32px] font-bold leading-10 ${dark ? 'text-green-400' : 'text-success'}`}>32/100</p>
          <p className={`text-[14px] leading-5 ${dark ? 'text-[#a1a1a1]' : 'text-content-secondary'}`}>Your 4.8% closer to your goal of buying a home. Keep going.</p>
        </div>

        {/* Trading analytics */}
        <div className={`rounded-3xl overflow-hidden ${dark ? 'bg-[#171717]' : 'bg-surface-raised'}`}>
          <div className="px-4 pt-4 pb-2">
            <p className={`text-[14px] font-medium leading-5 ${dark ? 'text-white' : 'text-content-primary'}`}>Trading analytics</p>
          </div>
          {/* TCB */}
          <div className="flex gap-4 items-start p-4">
            <div className={`size-12 rounded-full overflow-hidden shrink-0 relative ${dark ? 'bg-[#262626]' : 'bg-surface-sunken'}`}>
              <Image src={asset("/tcb-logo.png")} alt="TCB" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className={`text-[16px] font-medium leading-6 ${dark ? 'text-white' : 'text-content-primary'}`}>
                <span className={dark ? 'text-green-400' : 'text-success'}>+8,000,000đ</span>{' in realized PnL'}
              </p>
              <p className={`text-[14px] leading-5 ${dark ? 'text-[#737373]' : 'text-content-muted'}`}>You started buying on 12 Apr 2024, Average buy price is 28,250đ. You bought 5 times, sold 2 times in total</p>
            </div>
          </div>
          <AssetDivider />
          {/* VIC */}
          <div className="flex gap-4 items-start p-4">
            <div className={`size-12 rounded-full overflow-hidden shrink-0 relative ${dark ? 'bg-[#262626]' : 'bg-surface-sunken'}`}>
              <Image src={asset("/vic-logo.png")} alt="VIC" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <p className={`text-[16px] font-medium leading-6 ${dark ? 'text-white' : 'text-content-primary'}`}>
                <span className="text-danger">-2,000,000đ</span>{' in realized PnL'}
              </p>
              <p className={`text-[14px] leading-5 ${dark ? 'text-[#737373]' : 'text-content-muted'}`}>You started buying on 12 Apr 2024, Average buy price is 220,000đ. You bought 4 times, sold 1 times in total</p>
            </div>
          </div>
        </div>

        {/* People like you often buy */}
        <div className={`border rounded-3xl overflow-hidden ${dark ? 'bg-[#171717] border-[#262626]' : 'bg-surface-raised border-border-strong'}`}>
          <div className="px-4 pt-4 pb-2">
            <p className={`text-[14px] font-medium leading-5 ${dark ? 'text-white' : 'text-content-primary'}`}>People like you often buy</p>
          </div>
          <div className="flex gap-4 items-center p-4">
            <div className={`size-12 rounded-full overflow-hidden shrink-0 relative ${dark ? 'bg-white' : 'bg-surface-overlay'}`}>
              <Image src={asset("/msn-logo.png")} alt="MSN" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className={`flex items-center justify-between text-[16px] font-medium leading-6 ${dark ? 'text-white' : 'text-content-primary'}`}>
                <span>MSN</span><span className="tabular-nums font-mono">72.80</span>
              </div>
              <div className="flex items-center justify-between text-[14px] leading-5">
                <span className={`truncate pr-2 ${dark ? 'text-white' : 'text-content-primary'}`}>Masan Group Corporation</span>
                <span className={`shrink-0 ${dark ? 'text-green-400' : 'text-success'}`}>+0.41%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          <button className={`w-full border rounded-full px-4 py-3 ${dark ? 'bg-[#171717] border-[#262626]' : 'bg-surface-raised border-[#1e2939]'}`}>
            <span className={`text-[14px] font-medium ${dark ? 'text-white' : 'text-content-primary'}`}>Create a new plan</span>
          </button>
          <button className={`w-full rounded-full px-4 py-3 flex items-center justify-center gap-1 ${dark ? 'bg-white' : 'bg-surface-overlay'}`}>
            <div className="size-5 relative overflow-hidden shrink-0">
              <Image src={asset("/ai.png")} alt="" fill className="object-contain" />
            </div>
            <span className={`text-[14px] font-medium ${dark ? 'text-[#111111]' : 'text-content-inverse'}`}>Ask AI</span>
          </button>
        </div>
      </motion.div>
      )}
    </motion.div>
  )
}

/* ─── Dark keyboard mock — shared visual for expanded compose screens ──── */
function DarkKeyboardMock({ light = false }) {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ]
  const DK = ({ label, className = '' }) => (
    <button className={`h-11 rounded-[10px] flex items-center justify-center text-[17px] ${
      light ? 'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.25)]' : 'bg-[#3a3a3c] text-white shadow-[0_1px_0_rgba(0,0,0,0.5)]'
    } ${className}`}>
      {label}
    </button>
  )
  return (
    <div className="w-full shrink-0">
      <div className={`rounded-t-4xl rounded-b-[60px] ${light ? 'bg-[#d1d3d9]' : 'bg-[#1c1c1e] border border-neutral-900'}`}>
        <div className={`flex items-center border-b py-2 ${light ? 'border-[#b9bcc3]' : 'border-[#2c2c2e]'}`}>
          {['"The"', 'the', 'to'].map((s, i) => (
            <div key={s} className={`flex-1 flex items-center justify-center py-1 ${i < 2 ? (light ? 'border-r border-[#b9bcc3]' : 'border-r border-[#2c2c2e]') : ''}`}>
              <span className={`text-[15px] ${light ? 'text-black' : 'text-white'}`}>{s}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2.75 px-2 py-3">
          <div className="flex justify-center gap-1.5">
            {rows[0].map(k => <DK key={k} label={k} className="w-9.25" />)}
          </div>
          <div className="flex justify-center gap-1.5">
            {rows[1].map(k => <DK key={k} label={k} className="w-9.25" />)}
          </div>
          <div className="flex justify-center gap-1.5">
            <DK label="⇧" className={`w-11 ${light ? 'bg-[#adb1b8]!' : 'bg-[#636366]!'}`} />
            {rows[2].map(k => <DK key={k} label={k} className="w-9.25" />)}
            <DK label="⌫" className={`w-11 ${light ? 'bg-[#adb1b8]!' : 'bg-[#636366]!'}`} />
          </div>
          <div className="flex gap-1.5">
            <DK label="123" className={`w-11 ${light ? 'bg-[#adb1b8]!' : 'bg-[#636366]!'}`} />
            <button className={`flex-1 h-11 rounded-[10px] text-[17px] ${
              light ? 'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.25)]' : 'bg-[#3a3a3c] text-white shadow-[0_1px_0_rgba(0,0,0,0.5)]'
            }`}>space</button>
            <button className="w-23 h-11 bg-[#007AFF] rounded-[10px] flex items-center justify-center shadow-[0_1px_0_rgba(0,0,0,0.5)]">
              <Icon name="keyboard_return" size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-9 pt-2 pb-8">
          <Icon name="emoji_emotions" size={26} className={light ? 'text-[#8e9099]' : 'text-[#636366]'} />
          <Icon name="mic" size={22} className={light ? 'text-[#8e9099]' : 'text-[#636366]'} />
        </div>
      </div>
    </div>
  )
}

/* ─── Chip avatar — image logo or icon-in-circle, matching the source row ── */
function ChipAvatar({ avatar, size = 24 }) {
  if (avatar?.type === 'image') {
    return (
      <div className="rounded-full overflow-hidden shrink-0 relative" style={{ width: size, height: size, background: avatar.bg }}>
        <Image src={avatar.src} alt="" fill className="object-cover" />
      </div>
    )
  }
  return (
    <div className="rounded-full bg-[#171717] flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <Icon name={avatar?.icon || 'trending_up'} size={size - 8} className="text-[#d4d4d4]" />
    </div>
  )
}

/* ─── Expanded Ask AI compose screen — slides in from the right, same
       pattern as Home's TriScreen; shows attached chips as avatar + ticker ── */

// Entry-screen suggestion tiles — same visual language as Home's TRI_ENTRY_SUGGESTIONS
const WEALTH_ASK_SUGGESTIONS = [
  { id: 1, rotate: -8, icon: asset('/icons-home/tri-suggestion-house.png'),  iconBg: '#bedbff', label: 'Make a plan to buy house',                    message: 'Make a plan to buy house' },
  { id: 2, rotate: 8,  icon: asset('/icons-home/tri-suggestion-plane.png'),  iconBg: '#d5d4f7', label: 'Summarize my total spending on Bangkok Trip', message: 'Summarize my total spending on Bangkok Trip' },
  { id: 3, rotate: -8, icon: asset('/icons-home/tri-suggestion-freeze.png'), iconBg: '#fff4cc', label: 'Freeze my Credit card',                       message: 'Freeze my card' },
]

/* Scripted "compare & buy" demo — pre-fills each step when TCB + VIC are both
   in the chip tray, but every step still requires the user to tap Send */
const ASSET_COMPARE_SCRIPT = {
  question: 'Which stock fits my home-buying goal better?',
  compare: {
    intro: 'For your current portfolio,',
    groups: [
      { ticker: 'TCB', bullets: ['Higher familiarity (already 50% of portfolio)', 'Higher concentration risk'] },
      { ticker: 'VIC', bullets: ['Better diversification', 'Suitable if you want to reduce single-stock exposure'] },
    ],
    suggestionLabel: 'My suggestion:',
    suggestionBullet: 'Your next investment is TCB.',
    closing: 'It improves portfolio balance while keeping your expected return aligned with your goal. Do you want me to help you buy it?',
  },
  buyRequest: 'Buy 100 TCB at market price',
  order: { Amount: '100', Price: '34.30', Total: '3.430.000đ' },
}

function AskExpandScreen({ onClose, onOpenSearch, chatChips, onRemoveChip, onConsumeChips, light = false }) {
  const [messages, setMessages] = useState([])
  const [thinking, setThinking] = useState(false)
  const [inputText, setInputText] = useState('')
  const draftedRef = useRef(false) // pre-fills the scripted question once, doesn't re-run on re-render
  const scrollRef = useRef(null)

  const isDemo = chatChips.some(c => c.ticker === 'TCB') && chatChips.some(c => c.ticker === 'VIC')

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  // Pre-fill the input with the scripted question the moment both chips are present —
  // the user still has to hit Send themselves, same as the entry-point draft pattern.
  useEffect(() => {
    if (isDemo && !draftedRef.current && messages.length === 0) {
      draftedRef.current = true
      setInputText(ASSET_COMPARE_SCRIPT.question)
    }
  }, [isDemo, messages.length])

  const handleSend = () => {
    if (!inputText || thinking) return
    const isFirst = messages.length === 0
    const sent = inputText
    setInputText('')

    if (isFirst) {
      setMessages([{ kind: 'user-text', text: sent, chips: chatChips }])
      onConsumeChips?.() // chips move from the tray into the sent message
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setMessages(prev => [...prev, { kind: 'ai-compare', data: ASSET_COMPARE_SCRIPT.compare }])
        setTimeout(() => setInputText(ASSET_COMPARE_SCRIPT.buyRequest), 400)
      }, 1400)
    } else {
      setMessages(prev => [...prev, { kind: 'user-text', text: sent }])
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setMessages(prev => [...prev, { kind: 'ai-order', data: ASSET_COMPARE_SCRIPT.order }])
      }, 1400)
    }
  }

  const canSend = !!inputText && !thinking
  const hasScript = messages.length > 0

  return (
    <motion.div
      initial={{ x: 448 }} animate={{ x: 0 }} exit={{ x: 448 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className={`absolute inset-0 z-80 rounded-[64px] overflow-hidden flex flex-col ${light ? 'bg-white' : 'bg-black'}`}
    >
      {/* Background — the Home gradient, reused here for both themes */}
      {!light ? (
        <div
          className="absolute inset-0 rounded-[64px]"
          style={{ background: 'linear-gradient(180deg, #292929 0%, #111111 100%)' }}
        />
      ) : (
        <div
          className="absolute inset-0 rounded-[64px]"
          style={{ background: 'linear-gradient(180deg, #a1a1aa 0%, #ffffff 70%)' }}
        />
      )}

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-70">
        <StatusBar dark={light} />
      </div>

      {/* Layout column */}
      <div className="absolute inset-0 flex flex-col gap-2 px-1 pt-1 pb-1">

        {/* Main content card */}
        <div className={`relative flex-1 backdrop-blur-lg border rounded-tl-[60px] rounded-tr-[60px] rounded-bl-[48px] rounded-br-[48px] overflow-hidden flex flex-col min-h-0 ${
          light ? 'bg-white border-[#f0f0f0]' : 'bg-[#111111] border-[#171717]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 pl-4 pr-3 pt-16 shrink-0 w-full">
            <button className={`rounded-full px-5 py-2 flex items-center justify-center border ${
              light ? 'border-neutral-300' : 'border-neutral-800'
            }`}>
              <Icon name="history" size={24} className={light ? 'text-[#111111]' : 'text-[#d4d4d4]'} />
            </button>
            <div className="flex items-center gap-1">
              <button onClick={onOpenSearch} className={`rounded-full px-5 py-2 flex items-center justify-center border ${
                light ? 'border-neutral-300' : 'border-neutral-800'
              }`}>
                <Icon name="search" size={24} className={light ? 'text-[#111111]' : 'text-[#d4d4d4]'} />
              </button>
              <button onClick={onClose} className={`rounded-full px-5 py-2 flex items-center justify-center border shrink-0 ${light ? 'border-neutral-300' : 'border-neutral-800'}`}>
                <Icon name="close" size={24} className={light ? 'text-black' : 'text-white'} />
              </button>
            </div>
          </div>

          {!hasScript ? (
            /* Greeting + suggestion cards — matches Home's TriScreen entry screen */
            <div className="backdrop-blur-[6px] flex-1 w-full flex flex-col items-center justify-end overflow-hidden min-h-0">
              <div className="flex flex-col gap-2.5 p-4 shrink-0 w-full whitespace-nowrap">
                <p className={`t-h3 ${light ? 'text-[#111111]' : 'text-white'}`}>Hey Quang!</p>
                <p className="t-label text-[#737373]">What&apos;s been on your mind lately?</p>
              </div>
              <div className="flex items-center pb-4 pt-3 px-4 shrink-0 w-full">
                {WEALTH_ASK_SUGGESTIONS.map(({ id, rotate, icon, iconBg, label }) => (
                  <div
                    key={id}
                    className="flex items-start justify-start shrink-0 text-left"
                    style={{ width: 135, height: 155, marginRight: -16 }}
                  >
                    <div
                      className={`rounded-3xl flex flex-col gap-1 items-start px-4 py-4 shrink-0 border ${
                        light ? 'bg-[#f5f5f5] border-[#e5e5e5]' : 'bg-[#171717] border-[#262626]'
                      }`}
                      style={{ width: 117, height: 140, transform: `rotate(${rotate}deg)` }}
                    >
                      <div className="rounded-lg flex items-center justify-center shrink-0 size-6" style={{ background: iconBg }}>
                        <Image src={icon} alt="" width={20} height={20} />
                      </div>
                      <p className={`t-label text-left w-full whitespace-normal ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Scripted message thread */
            <div className="relative flex-1 min-h-0">
              <div ref={scrollRef} className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0 h-full">
                <div className="flex flex-col py-4 w-full mt-auto">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col w-full py-2 ${m.kind === 'user-text' ? 'items-end pl-24 pr-4' : 'items-start pl-4 pr-24'}`}>
                      {m.kind === 'user-text' && m.chips && (
                        <div className="flex gap-2 items-center pb-2">
                          {m.chips.map(chip => (
                            <div key={chip.ticker} className="bg-neutral-200 flex gap-1 items-center pl-1 pr-2 py-1 rounded-full shrink-0">
                              <ChipAvatar avatar={chip.avatar} size={24} />
                              <span className="flex h-4 items-center text-[12px] font-medium leading-4 text-neutral-950 whitespace-nowrap">{chip.ticker}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {m.kind === 'user-text' && (
                        <div className="bg-info rounded-3xl px-4 py-3 max-w-full">
                          <p className="text-[16px] leading-6 text-white">{m.text}</p>
                        </div>
                      )}

                      {m.kind === 'ai-compare' && (
                        <div className={`rounded-3xl px-4 py-3 max-w-full ${light ? 'bg-[#f5f5f5]' : 'bg-[#262626]'}`}>
                          <div className={`text-[16px] leading-6 ${light ? 'text-[#111111]' : 'text-white'}`}>
                            <p>{m.data.intro}</p>
                            {m.data.groups.map(g => (
                              <div key={g.ticker}>
                                <p>{g.ticker}</p>
                                <ul className="list-disc pl-6">
                                  {g.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                                </ul>
                              </div>
                            ))}
                            <p className="pt-2">{m.data.suggestionLabel}</p>
                            <ul className="list-disc pl-6">
                              <li>{m.data.suggestionBullet}</li>
                            </ul>
                            <p className="pt-2">{m.data.closing}</p>
                          </div>
                        </div>
                      )}

                      {m.kind === 'ai-order' && (
                        <div className={`rounded-3xl px-4 py-3 max-w-full flex flex-col gap-4 items-end w-full ${light ? 'bg-[#f5f5f5]' : 'bg-[#262626]'}`}>
                          <div className={`flex flex-col gap-1 w-full text-[16px] leading-6 ${light ? 'text-[#111111]' : 'text-white'}`}>
                            <div className="flex items-center justify-between w-full"><p>Amount</p><p>{m.data.Amount}</p></div>
                            <div className="flex items-center justify-between w-full"><p>Price</p><p>{m.data.Price}</p></div>
                            <div className="flex items-center justify-between w-full"><p>Amount</p><p>{m.data.Total}</p></div>
                          </div>
                          <button
                            onClick={onClose}
                            className={`backdrop-blur-sm border rounded-[60px] px-6 py-4 w-full ${
                              light ? 'bg-black border-black' : 'bg-white border-white'
                            }`}
                          >
                            <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] ${light ? 'text-white' : 'text-black'}`}>Confirm</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking indicator */}
                  {thinking && (
                    <div className="flex justify-start pl-4 pr-24 py-2 w-full">
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.18, 1] }}
                        transition={{ rotate: { duration: 1.6, repeat: Infinity, ease: 'linear' }, scale: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } }}
                      >
                        <Image src={asset("/ai.png")} alt="" width={28} height={28} />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              {/* Top fade — sits over the message list, not part of the scroll content */}
              <div className={`absolute top-0 inset-x-0 h-14 pointer-events-none z-10 ${
                light ? 'bg-linear-to-b from-white to-transparent' : 'bg-linear-to-b from-[#111111] to-transparent'
              }`} />
            </div>
          )}
        </div>

        {/* Ask anything input — chips row above, input row below */}
        <div className={`border backdrop-blur-sm rounded-[32px] flex flex-col gap-2 pl-4 pr-2 pt-2 pb-2 shrink-0 mx-3 w-[calc(100%-24px)] ${
          light ? 'bg-white border-[#d4d4d4]' : 'bg-[#171717] border-[#fafafa]'
        }`}>
          {chatChips.length > 0 && (
            <div className="flex gap-1 items-start pt-2 w-full flex-wrap">
              {chatChips.map(chip => (
                <div
                  key={chip.ticker}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  data-ask-chip
                  className="bg-neutral-200 flex gap-1 items-center pl-1 pr-2 py-1 rounded-full shrink-0"
                >
                  <ChipAvatar avatar={chip.avatar} size={24} />
                  <span className="flex h-4 items-center text-[12px] font-medium leading-4 text-neutral-950 whitespace-nowrap">{chip.ticker}</span>
                  <button
                    type="button"
                    data-ask-chip
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onRemoveChip(chip.ticker)
                    }}
                    onPointerUp={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="flex items-center justify-center size-4 shrink-0"
                  >
                    <Icon name="close" size={16} className="text-neutral-950" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center justify-center w-full">
            <Icon name="add" size={24} className={`shrink-0 ${light ? 'text-black' : 'text-white'}`} />
            <div className="flex-1 flex items-center min-w-0">
              <span className={`flex-1 text-[16px] leading-6 text-left min-w-0 break-words ${light ? 'text-[#111111]' : 'text-white'}`}>
                {inputText ? (
                  <TypewriterInputText text={inputText} />
                ) : (
                  <span className="flex items-center gap-1 text-[#a1a1a1]">
                    <InlineBlinkingCursor />
                    <span>Ask anything</span>
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`rounded-full p-2 flex items-center justify-center shrink-0 disabled:opacity-40 ${light ? 'bg-[#111111]' : 'bg-white'}`}
            >
              <Image src={asset("/ai.png")} alt="" width={24} height={24} />
            </button>
          </div>
        </div>

        {/* Dark keyboard — in flow */}
        <DarkKeyboardMock light={light} />
      </div>
    </motion.div>
  )
}

const WEALTH_TABS = [{ id: 'wealth', label: 'My wealth' }, { id: 'explore', label: 'Explore' }]

const FAB_ACTIONS = [
  { label: 'Equities', icon: 'candlestick_chart' },
  { label: 'Bonds',    icon: 'analytics' },
  { label: 'Fund',     icon: 'credit_card' },
  { label: 'Top up',   icon: 'add_box' },
]

export default function WealthScreen({ onNavigate, embedded = false, onOpenSearch, defaultTab = 'wealth', portfolioHovered = false, advisorHovered = false, analyzeOpen = false, onAnalyzeClose, onAnalyzeOpen, onInvestOpen, onInvestClose, onAskChatOpen, onAskChatClose, openAskChatOnMount = false, onOpenAskChatOnMountConsumed, menuOpen = false, onOpenMenu, light = false, onTesterNoteChange, pageContentX = 0, pageContentInitialX = 0, pageTransitioning = false, chatChips: controlledChatChips, setChatChips: setControlledChatChips } = {}) {
  const [hidden, setHidden] = useState(false)
  const [navTab, setNavTab] = useState(defaultTab) // 'wealth' | 'explore'
  const [showAnalyze, setShowAnalyze] = useState(false)
  const [timeFilter, setTimeFilter] = useState('1D')
  const [chartCollapsed, setChartCollapsed] = useState(false)
  const [assetsScrolled, setAssetsScrolled] = useState(false)
  const [assetFilter, setAssetFilter] = useState('All')
  const [topGainsOpen, setTopGainsOpen] = useState(true)
  const [fabOpen, setFabOpen] = useState(false)       // invest panel mounted
  const [bodyPushed, setBodyPushed] = useState(false)  // body compressed + dimmed
  const [investCornerActive, setInvestCornerActive] = useState(false)
  const investCornerTimerRef = useRef(null)

  const openInvest  = () => {
    if (investCornerTimerRef.current) window.clearTimeout(investCornerTimerRef.current)
    setFabOpen(true)
    setBodyPushed(true)
    setInvestCornerActive(true)
    onInvestOpen?.()
  }
  const closeInvest = () => {
    setFabOpen(false)
    setBodyPushed(false)
    if (investCornerTimerRef.current) window.clearTimeout(investCornerTimerRef.current)
    investCornerTimerRef.current = window.setTimeout(() => {
      setInvestCornerActive(false)
      investCornerTimerRef.current = null
    }, 280)
    onInvestClose?.()
  }

  useEffect(() => () => {
    if (investCornerTimerRef.current) window.clearTimeout(investCornerTimerRef.current)
  }, [])

  /* ── Drag-to-chat: drag an item's handle onto the Ask AI field to add a chip ──
     chip shape: { ticker, avatar: { type: 'image', src, bg } | { type: 'icon', icon } } */
  const [localChatChips, setLocalChatChips] = useState([])
  const chatChips = controlledChatChips ?? localChatChips
  const setChatChips = setControlledChatChips ?? setLocalChatChips
  const [ghost, setGhost] = useState(null)        // { ticker, x, y } — floating pill following the pointer
  const [overAsk, setOverAsk] = useState(false)   // pointer currently over the Ask field
  // Opens straight into the compose screen when Home jumps here with chips already
  // attached — read once at mount (lazy initializer) so it can never re-fire on a
  // later, unrelated navigation into this screen (this component fully unmounts
  // between visits, so "once at mount" really does mean "once per visit").
  const [askChatOpen, setAskChatOpen] = useState(() => openAskChatOnMount) // expanded compose overlay
  const rootRef = useRef(null)
  const askRef = useRef(null)
  const wealthScrollRef = useRef(null)
  const cardBRef = useRef(null)
  const scrollBeforeMenuRef = useRef(0)
  const menuWasOpenRef = useRef(false)

  // When the menu opens, scroll the content up just enough that Card B's
  // bottom edge sits 8px above the menu sheet's top edge — identical to Home.
  useEffect(() => {
    const scroller = wealthScrollRef.current
    if (!scroller) return
    if (menuOpen) {
      // Only capture the "restore to" baseline on the actual open transition
      // — this effect can re-run while menuOpen stays true (e.g. once
      // pageTransitioning flips), and re-reading scrollTop at that point
      // would capture an already-jumped position instead of the original one.
      if (!menuWasOpenRef.current) scrollBeforeMenuRef.current = scroller.scrollTop
      menuWasOpenRef.current = true
      const applyScroll = (behavior) => {
        const cardEl = cardBRef.current
        const phoneEl = rootRef.current
        if (!cardEl || !phoneEl) return
        const cardRect = cardEl.getBoundingClientRect()
        const phoneRect = phoneEl.getBoundingClientRect()
        const menuTopY = phoneRect.top + 160
        const delta = cardRect.bottom - (menuTopY - 8)
        const maxScroll = scroller.scrollHeight - scroller.clientHeight
        const target = Math.min(Math.max(scroller.scrollTop + delta, 0), Math.max(maxScroll, 0))
        scroller.scrollTo({ top: target, behavior })
      }
      if (pageTransitioning) {
        // Arriving here via menu navigation: the menu is already open, so
        // jump straight to the scrolled-up position instead of animating
        // into it — an animated scroll here would race the horizontal
        // slide-in. The close-menu branch below still animates normally.
        applyScroll('auto')
      } else {
        requestAnimationFrame(() => applyScroll('smooth'))
      }
    } else {
      menuWasOpenRef.current = false
      scroller.scrollTo({ top: scrollBeforeMenuRef.current, behavior: 'smooth' })
    }
  }, [menuOpen, pageTransitioning])

  useEffect(() => {
    if (askChatOpen) onAskChatOpen?.()
    else onAskChatClose?.()
  }, [askChatOpen, onAskChatClose, onAskChatOpen])

  // Tell Home its one-shot request has been read, so it resets the flag and a
  // later plain navigation into this screen doesn't also open the compose screen.
  useEffect(() => {
    if (openAskChatOnMount) onOpenAskChatOnMountConsumed?.()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!onTesterNoteChange) return

    if (askChatOpen) {
      const hasTCB = chatChips.some(c => c.ticker === 'TCB')
      const hasVIC = chatChips.some(c => c.ticker === 'VIC')
      let note
      if (chatChips.length === 2 && hasTCB && hasVIC) note = 'Tap the send arrow to submit the drafted question.'
      else if (chatChips.length < 2 && hasTCB) note = 'Drag VIC too to trigger the conversation.'
      else if (chatChips.length < 2 && hasVIC) note = 'Drag TCB too to trigger the conversation.'
      else note = "The conversation is only being triggered if u drag both of TCB and VIC. Remove the other if it's in the chat input"
      onTesterNoteChange({
        title: 'Wealth AI Chat',
        items: [note],
      })
      return
    }

    if (fabOpen) {
      onTesterNoteChange({
        title: 'Invest Panel',
        items: ['Tap Close to dismiss the panel.', 'Tap product circles to explore investment actions.'],
      })
      return
    }

    if (navTab === 'explore') {
      onTesterNoteChange({
        title: 'Explore',
        items: ['Tap filter chips to jump between sections.', 'Drag TCB and VIC into Ask anything to continue.', 'Tap My wealth to return to the portfolio view.', 'Tap Buy to open the invest panel.'],
      })
      return
    }

    onTesterNoteChange({
      title: 'My Wealth',
      items: ['Tap Explore to switch tabs.', 'Tap the chart arrow to collapse or expand the chart.', 'Drag both of TCB and VIC items into Ask AI to trigger AI chat', 'Tap Buy to open the invest panel.'],
    })
  }, [askChatOpen, fabOpen, navTab, onTesterNoteChange, chatChips])

  const investCornerShown = fabOpen || investCornerActive

  const startDrag = (e, chip) => {
    e.preventDefault()
    const root = rootRef.current?.getBoundingClientRect()
    if (!root) return
    const hit = (ev) => {
      const a = askRef.current?.getBoundingClientRect()
      return !!a && ev.clientX >= a.left && ev.clientX <= a.right && ev.clientY >= a.top && ev.clientY <= a.bottom
    }
    const move = (ev) => {
      setGhost({ ticker: chip.ticker, avatar: chip.avatar, x: ev.clientX - root.left, y: ev.clientY - root.top })
      setOverAsk(hit(ev))
    }
    const up = (ev) => {
      if (hit(ev)) setChatChips(prev => prev.some(c => c.ticker === chip.ticker) ? prev : [...prev, chip])
      setGhost(null)
      setOverAsk(false)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    move(e)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const SUMMARY = [
    { icon: asset('/invest-equities.png'), label: 'Equities', value: '12,008,897', align: 'items-start'  },
    { icon: asset('/invest-bonds.png'),    label: 'Bonds',    value: '10,000,000', align: 'items-center' },
    { icon: asset('/invest-funds.png'),    label: 'Fund',     value: '2,000,000',  align: 'items-end'    },
  ]

  return (
    <div ref={rootRef} className={`overflow-hidden relative ${pageTransitioning ? 'bg-transparent' : (light ? 'bg-white' : 'bg-black')} ${
      embedded ? 'w-full h-full' : 'w-[440px] h-[956px] rounded-[64px]'
    }`}>

      {!pageTransitioning && (
        <div
          className="absolute inset-0"
          style={{
            background: light
              ? 'linear-gradient(180deg, #D5D4F7 0%, #f5f5f5 49%, #f5f5f5 100%)'
              : 'linear-gradient(180deg, #D5D4F7 0%, #111111 58%, #111111 100%)',
          }}
        />
      )}

      {/* Status bar — standalone only */}
      {!embedded && (
        <div className="absolute top-0 left-0 right-0 z-70">
          <StatusBar dark={light} />
        </div>
      )}

      {/* Dark tint for the Invest push state. Menu dimming is handled by the shared menu layer. */}
      {light && (
        <motion.div
          initial={false}
          animate={{ opacity: bodyPushed ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute inset-0 bg-black/60 rounded-[64px] pointer-events-none z-30"
        />
      )}

      {/* Layout column — exits left when the Ask AI chat opens, matching Home */}
      <motion.div
        initial={false}
        animate={{ x: askChatOpen ? -448 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="absolute inset-0 flex flex-col overflow-hidden"
      >

        {/* Outer padding container — fills all the way down; the Ask bar floats
            over it. No padding here: it lives on the scroll container below,
            exactly like Home. */}
        <div className="flex-1 flex flex-col min-h-0">

        <motion.div
          initial={{ x: pageContentInitialX }}
          animate={{ x: pageContentX }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="relative flex-1 flex flex-col min-h-0"
        >

        {/* Scrollable content — fills the full available height like Home, instead
            of being clipped to a fixed-height block. Card A (header + balance +
            summary/chart) and Card B (My Assets) are separate cards with a 4px
            gap, matching Home's structure; the whole thing scrolls as one unit
            when it's taller than the screen. */}
        <motion.div
          initial={false}
          animate={{
            opacity: (menuOpen || bodyPushed) ? 0.5 : 1,
          }}
          transition={{
            opacity: { duration: 0.18 },
          }}
          ref={wealthScrollRef}
          className="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto px-1 pt-1 pb-1 [&::-webkit-scrollbar]:hidden"
        >

          {/* Card A — header + balance + summary/chart (wealth tab), or header +
              Explore content (explore tab, fills remaining height itself) */}
          <motion.div
            initial={false}
            animate={{
              borderBottomLeftRadius: navTab === 'wealth' ? (investCornerShown ? 64 : 48) : (investCornerShown ? 64 : 60),
              borderBottomRightRadius: navTab === 'wealth' ? (investCornerShown ? 64 : 48) : (investCornerShown ? 64 : 60),
            }}
            transition={{
              borderBottomLeftRadius: { duration: 0.42, ease: [0.4, 0, 0.2, 1] },
              borderBottomRightRadius: { duration: 0.42, ease: [0.4, 0, 0.2, 1] },
            }}
            style={{
              background: light
                ? 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, #ffffff 58%, #ffffff 100%)'
                : 'linear-gradient(180deg, rgba(17,17,17,0.6) 0%, #111111 58%, #111111 100%)',
            }}
            className={`relative border rounded-t-[60px] overflow-hidden flex flex-col min-h-0 ${
              navTab === 'explore' ? 'flex-1' : 'shrink-0'
            } ${light ? 'border-[#f5f5f5]' : 'border-[#171717]'}`}
          >

          {/* Header — pill-segmented tabs + search */}
          <div className="flex items-center justify-between pl-6 pr-3 pb-3 pt-16 shrink-0">
            <div className={`flex items-center p-0.5 rounded-full ${light ? 'bg-[rgba(17,17,17,0.12)]' : 'bg-[rgba(17,17,17,0.6)]'}`}>
              {WEALTH_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setNavTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full ${
                    navTab === tab.id ? (light ? 'bg-white' : 'bg-white/16') : ''
                  }`}
                >
                  <span className={`text-[16px] font-semibold leading-6 tracking-[0.32px] ${
                    navTab === tab.id ? (light ? 'text-[#111111]' : 'text-white') : (light ? 'text-[#525252]' : 'text-[#b2b2b2]')
                  }`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={() => onOpenSearch?.()}
              className={`flex items-center justify-center px-5 py-2 rounded-full border shrink-0 ${light ? 'border-neutral-300' : 'border-neutral-800'}`}
            >
              <Icon name="search" size={24} className={light ? 'text-[#111111]' : 'text-white'} />
            </button>
          </div>

          {/* ── My wealth tab ── */}
          {navTab === 'wealth' && (
            <>
              {/* Balance — collapsed: left column (amount + change) + right column
                  (mini sparkline + collapse chevron). Expanded: plain stacked
                  layout, no inline sparkline (the full chart card is visible
                  below instead). */}
              {chartCollapsed ? (
                <div className="flex gap-2 items-center px-6 pt-3 pb-10 shrink-0">
                  <div className="flex-1 min-w-0 flex flex-col gap-2 items-start">
                    <span className={`text-[14px] leading-5 ${light ? 'text-[#525252]' : 'text-[#a1a1a1]'}`}>Total Investment</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className={`text-[24px] leading-8 font-bold tracking-[0.48px] ${light ? 'text-[#525252]' : 'text-[#a1a1a1]'}`}>VND</span>
                        <span className={`text-[24px] leading-8 font-bold tracking-[0.48px] tabular-nums ${light ? 'text-[#111111]' : 'text-white'}`}>
                          {hidden ? '••••••••' : '24,008,897'}
                        </span>
                      </div>
                      <button onClick={() => setHidden(v => !v)} className="flex items-center shrink-0">
                        <Image src={hidden ? asset('/icons-home-v2/visibility-off.svg') : asset('/icons-home-v2/visibility.svg')} alt="" width={20} height={20} />
                      </button>
                    </div>
                    <div className="flex gap-1 items-center text-[14px] font-medium leading-5 tracking-[0.28px]">
                      <span className={light ? 'text-success' : 'text-green-400'}>+ 2,993,009 (9,78%)</span>
                      <span className={light ? 'text-[#525252]' : 'text-[#a1a1a1]'}>Today</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <img src={light ? asset('/wealth-balance-spark-light.svg') : asset('/wealth-balance-spark.svg')} alt="" className="w-24 h-10 object-contain" />
                    <button
                      onClick={() => setChartCollapsed(v => !v)}
                      className={`rounded-full p-0.5 flex items-center justify-center ${light ? 'bg-[#e5e5e5]' : 'bg-[#262626]'}`}
                    >
                      <Icon name="keyboard_arrow_up" size={20} className={`rotate-180 ${light ? 'text-[#111111]' : 'text-white'}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-start justify-center px-6 pt-3 pb-6 shrink-0">
                  <span className={`text-[14px] leading-5 ${light ? 'text-[#525252]' : 'text-[#a1a1a1]'}`}>Total Investment</span>
                  <div className="flex flex-col gap-1 items-start w-full">
                    <div className="flex items-center gap-3">
                      <div className="flex items-baseline gap-1 font-mono">
                        <span className={`text-[30px] leading-10 font-bold tabular-nums ${light ? 'text-[#525252]' : 'text-[#a1a1a1]'}`}>VND</span>
                        <span className={`text-[30px] leading-10 font-bold tabular-nums ${light ? 'text-[#111111]' : 'text-white'}`}>
                          {hidden ? '••••••••' : '24,008,897'}
                        </span>
                      </div>
                      <button onClick={() => setHidden(v => !v)} className="flex items-center shrink-0">
                        <Image src={hidden ? asset('/icons-home-v2/visibility-off.svg') : asset('/icons-home-v2/visibility.svg')} alt="" width={20} height={20} />
                      </button>
                    </div>
                    <div className="flex gap-1 items-center text-[14px] font-medium leading-5 tracking-[0.28px]">
                      <span className={light ? 'text-success' : 'text-green-400'}>+ 2,993,009 (9,78%)</span>
                      <span className={light ? 'text-[#525252]' : 'text-[#a1a1a1]'}>Today</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary + chart card */}
              <AnimatePresence initial={false}>
              {!chartCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -8 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -8 }}
                transition={{
                  height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.16, ease: 'easeOut' },
                  y: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
                }}
                className="px-1 pb-1 shrink-0 overflow-hidden"
              >
                <div className={`relative border rounded-[48px] overflow-hidden ${light ? 'bg-white border-[#f0f0f0]' : 'bg-[#171717] border-[#171717]'}`}>
                  <img
                    src={light ? asset('/wealth-summary-texture-light.svg') : asset('/wealth-summary-texture.svg')}
                    alt=""
                    className="absolute left-0 pointer-events-none w-full"
                    style={{ top: 108, height: 201 }}
                  />
                  {/* 3-column summary */}
                  <div className="relative flex items-center justify-between p-6">
                    {SUMMARY.map(item => (
                      <div key={item.label} className={`flex flex-col gap-2 justify-center ${item.align}`}>
                        <div className="flex gap-2 items-start">
                          <Image src={item.icon} alt="" width={20} height={20} />
                          <span className="text-[14px] font-medium text-[#737373] leading-5">{item.label}</span>
                        </div>
                        <span className={`text-[14px] font-medium leading-5 tabular-nums ${light ? 'text-[#111111]' : 'text-white'}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="pt-3">
                    <img src={asset("/wealth-chart.svg")} alt="" className="w-full h-[92px] object-cover" />
                    <div className="flex items-center justify-between px-6 pb-6 pt-4">
                      {/* Time filter pills */}
                      <div className={`relative rounded-full p-1 flex items-start overflow-hidden ${light ? 'bg-[#f5f5f5]' : 'bg-[#171717]'}`}>
                        {['1D', '1W', '1M', '1Y'].map(t => (
                          <button
                            key={t}
                            onClick={() => setTimeFilter(t)}
                            className={`rounded-full px-4 py-1 border-2 ${timeFilter === t ? (light ? 'border-[#111111]' : 'border-[#fafafa]') : 'border-transparent'}`}
                          >
                            <span className={`text-[14px] font-medium leading-5 ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{t}</span>
                          </button>
                        ))}
                      </div>
                      {/* Collapse */}
                      <button
                        onClick={() => setChartCollapsed(true)}
                        className={`rounded-full p-0.5 flex items-center justify-center ${light ? 'bg-[#e5e5e5]' : 'bg-[#262626]'}`}
                      >
                        <Icon name="keyboard_arrow_up" size={20} className={light ? 'text-[#111111]' : 'text-white'} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
              )}
              </AnimatePresence>
            </>
          )}

          {/* ── Explore tab ── */}
          {navTab === 'explore' && (
            <div className="relative flex-1 overflow-hidden flex flex-col">
              <ExploreContent onDragStart={startDrag} light={light} />
            </div>
          )}
          </motion.div>

          {/* Top gains card — separate card with a 4px gap, between Balance/summary
              and My Assets (wealth tab only) */}
          {navTab === 'wealth' && (
            <div className={`relative shrink-0 border rounded-[48px] overflow-hidden flex flex-col ${
              light ? 'bg-white border-[#f5f5f5]' : 'bg-[#111111] border-[#171717]'
            }`}>
              <div className="flex items-center justify-between pt-6 pb-2 px-6 shrink-0">
                <p className={`text-[16px] font-semibold leading-6 tracking-[0.32px] ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>Top gains</p>
                <button
                  onClick={() => setTopGainsOpen(v => !v)}
                  className="flex items-center justify-center size-6"
                >
                  <Icon
                    name="keyboard_arrow_up"
                    size={24}
                    className={`transition-transform duration-300 ${topGainsOpen ? 'rotate-90' : '-rotate-90'} ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}
                  />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {topGainsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-1 items-start p-2">
                      {TOP_GAINS.map((item, i) => (
                        <div
                          key={item.ticker}
                          onPointerDown={(e) => startDrag(e, { ticker: item.ticker, avatar: { type: 'image', src: item.logo, bg: item.logoBg } })}
                          className={`flex-1 min-w-0 flex flex-col gap-5 items-start justify-center p-4 touch-none cursor-grab active:cursor-grabbing ${light ? 'bg-[#f5f5f5]' : 'bg-[#171717]'} ${
                            i === 0 ? 'rounded-tl-xl rounded-tr-xl rounded-bl-[40px] rounded-br-xl'
                              : i === TOP_GAINS.length - 1 ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-[40px]'
                              : 'rounded-xl'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>{item.ticker}</span>
                              <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] ${light ? 'text-success' : 'text-green-400'}`}>{item.change}</span>
                            </div>
                            <Icon name="drag_indicator" size={16} className={light ? 'text-[#d4d4d4]' : 'text-[#404040]'} />
                          </div>
                          <img src={light ? item.spark.replace('.svg', '-light.svg') : item.spark} alt="" className="w-full h-8 object-contain" />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Card B — My Assets, separate card with a 4px gap above (wealth tab only).
              Hugs its content (no fixed height / clipping) with 56px bottom padding. */}
          {navTab === 'wealth' && (
                <div ref={cardBRef} className={`relative shrink-0 backdrop-blur-lg border rounded-[48px] flex flex-col ${
                  light ? 'bg-white border-[#f5f5f5]' : 'bg-[#111111] border-[#171717]'
                }`}>
                  <div className="relative flex items-center justify-start pt-6 pb-2 px-6 shrink-0">
                    <p className={`text-[16px] font-semibold leading-6 tracking-[0.32px] ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>My Assets (3)</p>
                    {assetsScrolled && (
                      <div className={`absolute top-full inset-x-0 h-14 pointer-events-none z-10 ${
                        light ? 'bg-linear-to-b from-white to-transparent' : 'bg-linear-to-b from-[#111111] to-transparent'
                      }`} />
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="relative flex gap-3 pt-4 shrink-0">
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pl-5 pr-5">
                      {ASSET_FILTERS.map(f => (
                        <button
                          key={f}
                          onClick={() => setAssetFilter(f)}
                          className={`rounded-full h-9 px-4 flex items-center shrink-0 border-2 ${
                            light
                              ? `bg-[#f5f5f5] ${f === assetFilter ? 'border-[#111111] bg-white' : 'border-transparent'}`
                              : `bg-[#171717] ${f === assetFilter ? 'border-[#fafafa]' : 'border-transparent'}`
                          }`}
                        >
                          <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] whitespace-nowrap ${light ? 'text-[#111111]' : 'text-[#fafafa]'}`}>
                            {f}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 pt-3 pb-14">
                    <div
                      onPointerDown={(e) => startDrag(e, { ticker: 'TCB', avatar: { type: 'image', src: asset('/tcb-logo.png'), bg: '#f3f4f6' } })}
                      className="pl-4 pr-2 py-3 flex gap-2 items-center touch-none cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <div className="flex gap-4 items-center">
                          <div className="size-11 rounded-full bg-[#f3f4f6] overflow-hidden relative shrink-0">
                            <Image src={asset("/tcb-logo.png")} alt="TCB" fill className="object-cover" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>TCB</span>
                            <span className="text-[12px] font-medium text-[#737373] leading-4">Qty: 400</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end text-right">
                          <span className={`text-[14px] font-semibold leading-6 font-mono tabular-nums ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>12,008,897</span>
                          <span className={`text-[12px] font-medium leading-4 ${light ? 'text-success' : 'text-green-400'}`}>+149,000đ (+1.29%)</span>
                        </div>
                      </div>
                      <span className="shrink-0">
                        <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
                      </span>
                    </div>
                    <div className="pl-[76px] pr-4 w-full">
                      <div className="bg-[#737373] h-px opacity-10 rounded-full w-full" />
                    </div>

                    {BONDS.map((bond, i) => (
                      <div key={bond.id}>
                        <div
                          onPointerDown={(e) => startDrag(e, { ticker: bond.ticker, avatar: { type: 'icon', icon: 'analytics' } })}
                          className="pl-4 pr-2 py-3 flex gap-2 items-center touch-none cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <div className="flex gap-4 items-center">
                              <div className="rounded-full flex items-center justify-center shrink-0 size-11" style={{ background: '#bedbff' }}>
                                <Image src={asset("/invest-bonds.png")} alt="" width={20} height={20} />
                              </div>
                              <div className="flex flex-col gap-1">
                                <span className={`text-[14px] font-medium leading-5 tracking-[0.28px] ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>{bond.ticker}</span>
                                <span className="text-[12px] font-medium text-[#737373] leading-4">Maturity: {bond.maturity}</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end text-right">
                              <span className={`text-[14px] font-semibold leading-6 font-mono tabular-nums ${light ? 'text-[#111111]' : 'text-[#d4d4d4]'}`}>{bond.amount}</span>
                              <span className={`text-[12px] font-medium leading-4 ${light ? 'text-success' : 'text-green-400'}`}>{bond.yieldStr}</span>
                            </div>
                          </div>
                          <span className="shrink-0">
                            <Icon name="drag_indicator" size={16} className={light ? "text-[#d4d4d4]" : "text-[#262626]"} />
                          </span>
                        </div>
                        {i < BONDS.length - 1 && (
                          <div className="pl-[76px] pr-4 w-full">
                            <div className="bg-[#737373] h-px opacity-10 rounded-full w-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
          )}

          {/* Footer clearance — keeps Card B's bottom edge from scrolling fully
              behind the floating Ask bar; natural scroll end settles it 8px
              above the bar, matching Home. */}
          {navTab === 'wealth' && <div className="shrink-0" style={{ height: 116 }} />}

          {/* Scroll headroom — guarantees there's enough scrollable distance for
              the menu-open effect above to bring Card B up into position, even
              when it's near the bottom of the content already. Sized instantly
              (no spring) so it's already in the layout before that effect
              measures scrollHeight. Identical to Home. Wealth tab only — on
              Explore, Card A is flex-1 and this would just squeeze it down. */}
          {navTab === 'wealth' && <div className="shrink-0" style={{ height: menuOpen ? 900 : 0 }} />}

        </motion.div>

        {/* Invest FAB — single shared button across both tabs, anchored to the
            tab-content area (outside the scroll wrapper so it stays fixed) */}
        <motion.button
          onClick={() => fabOpen ? closeInvest() : openInvest()}
          initial={false}
          animate={{ opacity: fabOpen ? 0 : 1, pointerEvents: fabOpen ? 'none' : 'auto' }}
          transition={{ duration: 0.18 }}
          className={`absolute right-6 z-55 rounded-[60px] px-8 py-5 flex items-center gap-2 shadow-[0_20px_12.5px_rgba(0,0,0,0.1),0_10px_5px_rgba(0,0,0,0.04)] ${light ? 'bg-black' : 'bg-white'}`}
          style={{ bottom: 112 }}
        >
          <motion.span
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`material-symbols-outlined leading-none select-none ${light ? 'text-white' : 'text-black'}`}
            style={{ fontSize: 24, display: 'block' }}
          >
            add
          </motion.span>
          <span className={`text-[14px] font-medium leading-5 ${light ? 'text-white' : 'text-black'}`}>Invest</span>
        </motion.button>

        {/* Push spacer — compresses the card so its bottom lands 8px above the
            invest panel (252). Menu positioning is now handled by the scroll
            effect above, matching Home. */}
        <motion.div
          initial={false}
          animate={{
            height: bodyPushed ? 252 : 0,
            marginTop: (bodyPushed || investCornerShown) ? 0 : -8,
          }}
          transition={{
            height: { type: 'spring', stiffness: 300, damping: 30, delay: bodyPushed ? 0.05 : 0 },
            marginTop: { type: 'spring', stiffness: 300, damping: 32 },
          }}
          className="shrink-0"
        />

        </motion.div>

        </div>

        {/* Floating Ask bar — overlays the content with a gradient scrim fading up
            from the solid background, identical to Home's floating footer */}
        <motion.div
          initial={false}
          animate={{ opacity: bodyPushed ? 0.5 : 1 }}
          transition={{ duration: 0.25 }}
          className={`absolute inset-x-0 bottom-0 z-50 pt-4 px-8 pb-8 rounded-b-[64px] ${pageTransitioning ? 'pointer-events-none' : ''}`}
          style={{
            background: light
              ? 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 53%)'
              : 'linear-gradient(to bottom, rgba(17,17,17,0) 0%, #111111 53%)',
          }}
        >
        <div className="relative shrink-0 w-full flex items-center gap-2" style={{ height: 64 }}>
          <button
            onClick={() => onOpenMenu ? onOpenMenu() : onNavigate?.('home')}
            className={`px-8 py-5 flex items-center justify-center shrink-0 ${light ? 'bg-black' : 'bg-white'}`}
            style={{ borderRadius: 36 }}
          >
            <div className="relative size-6">
              {[[4, 4], [16, 4], [4, 16], [16, 16]].map(([x, y], i) => (
                <div key={i} className={`absolute size-1 rounded-full ${light ? 'bg-white' : 'bg-black'}`} style={{ left: x, top: y }} />
              ))}
            </div>
          </button>
          <motion.div
            ref={askRef}
            initial={false}
            animate={{ borderColor: overAsk ? (light ? '#111111' : '#fafafa') : (light ? '#e5e5e5' : '#404040'), scale: overAsk ? 1.02 : 1 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              // Deterministic guard: if the click originated from inside the chip
              // pill (or its remove button), don't open — checking the actual DOM
              // target here is immune to event-timing/animation races, unlike the
              // old stopPropagation+ref approach which could misfire.
              if (e.target.closest('[data-ask-chip]')) return
              setAskChatOpen(true)
            }}
            className={`flex-1 backdrop-blur-sm border-2 rounded-[36px] pl-8 pr-5 py-5 flex items-center justify-between gap-2 min-w-0 cursor-pointer ${light ? 'bg-white' : 'bg-black'}`}
          >
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              <span className={`t-body-md whitespace-nowrap text-left min-w-0 ${light ? 'text-[#111111]' : 'text-white'}`}>
                Ask anything...
              </span>
              <AnimatePresence>
                {chatChips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    data-ask-chip
                    className={`flex items-center h-6 gap-1 rounded-full pl-2 pr-1 shrink-0 ${light ? 'bg-[#f5f5f5]' : 'bg-[#262626]'}`}
                  >
                    <span className={`flex h-4 items-center text-[12px] font-medium leading-4 whitespace-nowrap ${light ? 'text-[#111111]' : 'text-white'}`}>
                      {chatChips.length} attached
                    </span>
                    <button
                      type="button"
                      data-ask-chip
                      onClick={(e) => {
                        e.stopPropagation()
                        setChatChips([])
                      }}
                      className="flex items-center justify-center size-4"
                    >
                      <Icon name="close" size={16} className={light ? 'text-[#111111]' : 'text-white'} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="size-6 flex items-center justify-center shrink-0">
              <Image src={asset("/ai.png")} alt="" width={24} height={24} />
            </div>
          </motion.div>
        </div>
        </motion.div>
      </motion.div>

      {/* Drag ghost — floating pill following the pointer, above everything */}
      {ghost && (
        <div
          className="absolute z-90 pointer-events-none"
          style={{ left: ghost.x, top: ghost.y, transform: 'translate(-50%, -130%)' }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: overAsk ? 0.9 : 1, opacity: 1 }}
            className="flex items-center gap-2 bg-white rounded-full pl-1 pr-4 py-1 shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          >
            {ghost.avatar?.type === 'image' ? (
              <div className="size-11 rounded-full overflow-hidden relative shrink-0" style={{ background: ghost.avatar.bg || '#f3f4f6' }}>
                <Image src={ghost.avatar.src} alt="" fill className="object-cover" />
              </div>
            ) : (
              <div className="size-11 rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Icon name={ghost.avatar?.icon || 'trending_up'} size={24} className="text-[#111111]" />
              </div>
            )}
            <span className="text-[16px] font-semibold leading-6 tracking-[0.32px] text-black whitespace-nowrap">{ghost.ticker}</span>
            <Icon name="drag_indicator" size={16} className="text-[#a1a1a1]" />
          </motion.div>
        </div>
      )}

      {/* Analyze overlay — backdrop on hover, full sheet on click */}
      <AnimatePresence>
        {(portfolioHovered || advisorHovered || showAnalyze || analyzeOpen) && (
          <AnalyzeOverlay
            showCard={showAnalyze || analyzeOpen}
            onClose={() => { setShowAnalyze(false); onAnalyzeClose?.() }}
            light={light}
          />
        )}
      </AnimatePresence>

      {/* Expanded Ask AI compose screen — slides in from the right when the ask bar is tapped */}
      <AnimatePresence>
        {askChatOpen && (
          <AskExpandScreen
            onClose={() => setAskChatOpen(false)}
            onOpenSearch={onOpenSearch}
            chatChips={chatChips}
            onRemoveChip={(ticker) => setChatChips(prev => prev.filter(c => c.ticker !== ticker))}
            onConsumeChips={() => setChatChips([])}
            light={light}
          />
        )}
      </AnimatePresence>

      {/* Backdrop — dims the screen behind the Invest panel, same pattern as Home's balance overlay */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.24 } }}
            className="absolute inset-0 z-40"
            onClick={closeInvest}
          >
            <div className={`absolute inset-0 rounded-[64px] ${light ? 'bg-black/10' : 'bg-black/60'}`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invest panel — slides up from the bottom edge, 4px inset all round */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: '100%', opacity: 1,
              transition: { type: 'spring', stiffness: 360, damping: 38 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className={`absolute z-[60] overflow-hidden rounded-[60px] backdrop-blur-lg border flex flex-col ${
              light ? 'bg-[#111111] border-[#262626]' : 'bg-[#fafafa] border-[#171717]'
            }`}
            style={{ left: 4, right: 4, bottom: 4 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-3 w-full shrink-0">
              <div className="flex flex-col gap-1 pl-3">
                <p className={`text-[16px] font-semibold leading-6 tracking-[0.32px] ${light ? 'text-[#fafafa]' : 'text-[#0a0a0a]'}`}>Invest</p>
                <p className="text-[14px] text-[#737373] leading-5">Select a product.</p>
              </div>
              <button
                onClick={closeInvest}
                className={`backdrop-blur-[4px] rounded-[60px] px-6 py-4 shrink-0 border ${
                  light ? 'bg-black border-white' : 'bg-white border-black'
                }`}
              >
                <span className={`text-[14px] font-medium leading-5 ${light ? 'text-white' : 'text-black'}`}>Close</span>
              </button>
            </div>

            {/* Products */}
            <div className="flex gap-2 items-center justify-center px-6 pt-3 pb-8 w-full">
              {[
                { label: 'Equities', icon: asset('/invest-equities.png'), bg: '#d5d4f7' },
                { label: 'Bonds',    icon: asset('/invest-bonds.png'),    bg: '#bedbff' },
                { label: 'Funds',    icon: asset('/invest-funds.png'),    bg: '#fff4cc' },
                { label: 'Top up',   icon: asset('/invest-topup.png'),    bg: light ? '#262626' : '#e5e5e5' },
              ].map(item => (
                <div key={item.label} className="flex-1 flex flex-col gap-1 items-center justify-center min-w-0">
                  <div className="rounded-full flex items-center justify-center" style={{ background: item.bg, width: 90, height: 90 }}>
                    <Image src={item.icon} alt="" width={40} height={40} />
                  </div>
                  <p className={`text-[14px] font-medium leading-5 text-center whitespace-nowrap ${light ? 'text-white' : 'text-black'}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
