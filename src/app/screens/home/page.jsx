'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, LayoutGroup, animate } from 'framer-motion'
import { asset } from '../../../lib/asset'

/* ─── Data ─────────────────────────────────────────────────────────── */

const TRANSACTION_GROUPS = [
  {
    date: 'Thursday, 9 Jul 2026',
    items: [
      { id: 1, name: 'MOCA CREDIT',           detail: 'Giao dich thanh toan/Purchase - So The/Card No:...3140 MOCA CREDIT', time: '07:45', amount: '- 50,000',      dir: 'out' },
      { id: 2, name: 'Incoming money',        detail: 'Doi diem nhan tien',                                                 time: '07:45', amount: '+ 20,000,000',  dir: 'in'  },
    ],
  },
  {
    date: 'Thursday, 9 Jul 2026',
    items: [
      { id: 3, name: 'PAYOO-HIGHLANDS 00116', detail: 'Giao dich thanh toan/Purchase - So The/Card No:...3140 MOCA CREDIT', time: '07:32', amount: '- 120,000',     dir: 'out' },
      { id: 4, name: 'Outgoing Money',        detail: 'Giao dich thanh toan/Purchase - So The/Card No:...3140 MOCA CREDIT', time: '07:45', amount: '-USD 11.11',    dir: 'out' },
      { id: 5, name: 'CLEVERFOOD',            detail: 'Giao dich thanh toan/Purchase - So The/Card No:...3140 MOCA CREDIT', time: '07:45', amount: '- 50,000đ',     dir: 'out' },
    ],
  },
]

/* ─── Micro-components ─────────────────────────────────────────────── */

function BlinkingCursor() {
  const [on, setOn] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 530)
    return () => clearInterval(id)
  }, [])
  return <div className="w-1 h-5 bg-info rounded-full shrink-0" style={{ opacity: on ? 1 : 0 }} />
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

function Icon({ name, size = 24, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined leading-none select-none ${className}`}
      style={{ fontSize: size }}
    >
      {name}
    </span>
  )
}

/* Inline TCB logo — uses currentColor so it can recolor with text classes (unlike /logo.svg's baked-in fill) */
function TcbLogoIcon({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M15.2008 5.40002L12.0023 8.59617V8.60542L15.2008 11.8016L12.0023 14.9977V15.0046L15.2008 18.2008L21.6 11.8016L15.2008 5.40002Z" fill="currentColor" />
      <path d="M8.80156 5.40002L11.9954 8.59617V8.60542L8.80156 11.8016L11.9954 14.9977V15.0046L8.80156 18.2008L2.40002 11.8016L8.80156 5.40002Z" fill="currentColor" />
    </svg>
  )
}

function StatusBar({  }) {
  const imgStyle = { filter: 'invert(1)' }
  return (
    <div className="flex items-center justify-between px-14 pt-6 pb-1 shrink-0">
      <span className="text-[15px] font-semibold text-content-primary">9:41</span>
      <div className="flex items-center gap-1">
        <Image src={asset("/cellular.svg")} alt="" width={16} height={16} style={imgStyle} />
        <Image src={asset("/wifi.svg")}     alt="" width={16} height={16} style={imgStyle} />
        <Image src={asset("/battery.svg")}  alt="" width={16} height={16} style={imgStyle} />
      </div>
    </div>
  )
}

/* ─── Home sub-components ───────────────────────────────────────────── */

function TopNav() {
  const btnCls = `flex items-center justify-center px-5 py-2 rounded-full border border-neutral-300`
  const iconCls = 'text-[#111111]'
  return (
    <div className="flex items-center justify-between pl-6 pr-3 pb-3 pt-16 shrink-0">
      <div className="h-8 relative shrink-0" style={{ width: 48 }}>
        <Image src={asset("/logo-new.svg")} alt="TCB" fill className="object-contain object-left" />
      </div>
      <div className="flex items-center gap-1">
        <button className={btnCls}>
          <Icon name="notifications" size={24} className={iconCls} />
        </button>
        <button className={btnCls}>
          <Icon name="search" size={24} className={iconCls} />
        </button>
      </div>
    </div>
  )
}

function BalanceSection({ onOpenOverlay }) {
  const [hidden, setHidden] = useState(false)

  return (
    <div className="flex flex-col gap-0.5 px-6 pt-3 pb-6 shrink-0 items-center">
      <div className="flex items-center gap-2">
        <span className="t-body-md text-[#737373]">Current Balance</span>
      </div>
      <div className="flex flex-col gap-1 items-center w-full">
        <div className="flex items-center gap-3">
          <div className={`flex gap-1 font-mono ${hidden ? 'items-center' : 'items-baseline'}`}>
            <span className="text-[30px] leading-10 font-bold tabular-nums text-[#737373]">VND</span>
            {hidden ? (
              <Image src={asset("/icons-home-v2/hiding.svg")} alt="" width={108} height={40} style={{ filter: 'invert(1)' }} />
            ) : (
              <span className="text-[30px] leading-10 font-bold tabular-nums text-[#111111]">
                10,090,008
              </span>
            )}
          </div>
          <button onClick={() => setHidden(v => !v)} className="flex items-center shrink-0">
            <Image src={hidden ? asset('/icons-home-v2/visibility-off.svg') : asset('/icons-home-v2/visibility.svg')} alt="" width={20} height={20} />
          </button>
        </div>
        <button
          onClick={onOpenOverlay}
          className="rounded-full px-3 py-1 flex items-center gap-1 shrink-0 bg-black"
        >
          <Image src={asset("/insight-icon.png")} alt="" width={20} height={20} className="shrink-0" />
          <span className="text-[14px] font-medium leading-5 tracking-[0.28px] whitespace-nowrap text-white">Insight</span>
        </button>
      </div>
    </div>
  )
}

const HOME_ACTIONS = [
  { icon: asset('/banner-piggy.png'),    label: 'Savings',  fit: 'object-bottom' },
  { icon: asset('/action-transfer.png'), label: 'Transfer', fit: 'object-bottom' },
  { icon: asset('/action-qr.png'),       label: 'Scan QR',  fit: 'object-contain' },
  { icon: asset('/action-paybills.png'), label: 'Pay bills', fit: 'object-cover' },
]

function ActionsRow({  }) {
  const cardCls = 'bg-[#f5f5f5]'
  const labelCls = 'text-[#111111]'

  return (
    <div className="flex items-stretch gap-0.5 pt-2 pb-3 px-3 shrink-0">
      {HOME_ACTIONS.map(({ icon, label, fit }, i) => (
        <button
          key={label}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-5 p-4 ${cardCls} ${
            i === 0 ? 'rounded-tl-[40px] rounded-bl-[40px] rounded-tr-xl rounded-br-xl' : 'rounded-xl'
          }`}
        >
          <div className="relative size-10 shrink-0">
            <Image src={icon} alt="" fill className={`${fit} pointer-events-none`} />
          </div>
          <span className={`text-[12px] font-medium leading-4 whitespace-nowrap ${labelCls}`}>{label}</span>
        </button>
      ))}
      <button className={`flex items-center justify-center p-4 self-stretch shrink-0 rounded-tr-[40px] rounded-br-[40px] rounded-tl-xl rounded-bl-xl ${cardCls}`}>
        <Icon name="arrow_right_alt" size={24} className={labelCls} />
      </button>
    </div>
  )
}

const UPOINT_TOTAL = 20
const UPOINT_CURRENT = 2
const UPOINT_MILESTONES = [
  { at: 10, reward: '10,000' },
  { at: 20, reward: '20,000' },
]

function UPointProgress({  }) {
  const tallTicks = new Set([0, UPOINT_CURRENT, ...UPOINT_MILESTONES.map(m => m.at)])
  const labelTicks = [0, UPOINT_CURRENT, ...UPOINT_MILESTONES.map(m => m.at)]

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Labels — 0, current progress, and each milestone */}
      <div className="relative w-full" style={{ height: 20 }}>
        {labelTicks.map((at) => (
          <div
            key={at}
            className="absolute -translate-x-1/2 flex items-center justify-center"
            style={{ left: `${(at / UPOINT_TOTAL) * 100}%` }}
          >
            {at === UPOINT_CURRENT ? (
              <span className="bg-green-400 rounded-full flex items-center justify-center text-[14px] font-medium leading-5 tracking-[0.28px] text-black" style={{ width: 20, height: 20 }}>{at}</span>
            ) : (
              <span className="text-[14px] font-medium leading-5 tracking-[0.28px] text-[#737373]">{at}</span>
            )}
          </div>
        ))}
      </div>

      {/* Tick ruler */}
      <div className="flex items-end justify-between w-full">
        {Array.from({ length: UPOINT_TOTAL + 1 }).map((_, i) => {
          const active = i <= UPOINT_CURRENT
          const tall = tallTicks.has(i)
          return (
            <div
              key={i}
              className={`rounded-full ${active ? 'bg-green-400' : 'bg-[#d4d4d4]'}`}
              style={{ width: 2, height: tall ? 12 : 6 }}
            />
          )
        })}
      </div>

      {/* Reward badges — aligned below their milestone tick */}
      <div className="relative w-full" style={{ height: 20 }}>
        {UPOINT_MILESTONES.map(({ at, reward }, i) => {
          const isLast = i === UPOINT_MILESTONES.length - 1
          return (
          <div
            key={at}
            className={`absolute top-0 flex items-center gap-1 ${isLast ? '' : '-translate-x-1/2'}`}
            style={isLast ? { right: 0 } : { left: `${(at / UPOINT_TOTAL) * 100}%` }}
          >
            <Image src={asset("/upoint-icon.svg")} alt="" width={20} height={20} />
            <span className="text-[14px] font-medium leading-5 tracking-[0.28px] text-[#a1a1a1] whitespace-nowrap">{reward}</span>
          </div>
          )
        })}
      </div>
    </div>
  )
}

function PromoBanners({  }) {
  const open = true

  return (
    <div className="flex flex-col shrink-0 border rounded-[48px] overflow-hidden bg-white border-[#f0f0f0]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 pt-6 pb-2 px-6 shrink-0">
        <p className="t-label-lg whitespace-nowrap text-[#111111]">All for you</p>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="promo-banners"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-2">
              {/* Auto Earning — pink card with U-coin illustration */}
              <div className="relative flex flex-col items-start justify-between overflow-hidden rounded-[40px] p-6 shrink-0" style={{ background: '#FF656B', height: 156 }}>
                <div className="relative flex items-start justify-between w-full">
                  <div className="flex flex-col gap-1 items-start text-black flex-1 min-w-0">
                    <p className="text-[16px] font-semibold leading-6 tracking-[0.32px]">Auto Earning</p>
                    <p className="text-[14px] leading-5">Double Points, Redeem vouchers for food and shopping</p>
                  </div>
                  <button className="bg-[#0a0a0a] border border-[#262626] rounded-full px-4 py-1 shrink-0">
                    <span className="text-[14px] font-medium leading-5 text-[#fafafa] whitespace-nowrap">Explore now</span>
                  </button>
                </div>
                <div className="relative backdrop-blur-[6px] bg-black/60 rounded-full p-1 flex items-start gap-0.5 shrink-0">
                  <div className="bg-[#fafafa] rounded-full" style={{ width: 16, height: 4 }} />
                  {[0, 1, 2].map(i => (
                    <div key={i} className="bg-white/50 rounded-full" style={{ width: 6, height: 4 }} />
                  ))}
                </div>
                <div className="absolute pointer-events-none" style={{ left: 260, top: 56, width: 156, height: 156 }}>
                  <Image src={asset("/banner-auto-earning-u.png")} alt="" fill className="object-cover" />
                </div>
              </div>

              {/* Scan QR & earn U-Point — dark info card with a progress ruler */}
              <div className="flex flex-col gap-4 items-start rounded-[40px] p-6 shrink-0 border bg-[#f5f5f5] border-[#e5e5e5]">
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-[16px] font-semibold leading-6 tracking-[0.32px] w-full text-[#111111]">Scan QR code &amp; earn U-Point</p>
                  <p className="text-[14px] leading-5 text-[#737373] w-full">Make transactions of VND 35,000 or more via VNPAY or Techcombank QR code to receive U-Point rewards:</p>
                </div>
                <UPointProgress />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TransactionItem({ item, isLast }) {
  const isIncome = item.dir === 'in'
  return (
    <>
      <div className="flex flex-col gap-1 px-4 py-3">
        <div className="flex gap-8 items-start w-full">
          <div className="flex flex-1 min-w-0 items-center gap-4">
            <div className="rounded-full p-2.5 flex items-center justify-center shrink-0 bg-[#f5f5f5]">
              <Icon
                name={isIncome ? 'arrow_downward' : 'arrow_upward'}
                size={24}
                className={isIncome ? ('text-success') : ('text-[#737373]')}
              />
            </div>
            <div className="flex flex-1 min-w-0 flex-col gap-1">
              <p className="t-label whitespace-nowrap text-[#111111]">{item.name}</p>
              <div className="flex items-start gap-1 t-caption text-[#737373] w-full">
                <span className="shrink-0">{item.time}</span>
                <span className="shrink-0">·</span>
                <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{item.detail}</span>
              </div>
            </div>
          </div>
          <p className={`t-number whitespace-nowrap shrink-0 ${isIncome ? ('text-success') : 'text-[#111111]'}`}>
            {item.amount}
          </p>
        </div>
      </div>
      {!isLast && (
        <div className="pl-[76px] pr-4">
          <div className="h-px bg-[#737373] opacity-10 rounded-full" />
        </div>
      )}
    </>
  )
}

const TX_FILTERS = ['All', 'Income', 'Transfer', 'Card Payment', 'Withdrawal']

function TransactionSection({ menuOpen = false }) {
  const [activeFilter, setActiveFilter] = useState('All')

  return (
    <div
      className="shrink-0"
      style={{ minHeight: menuOpen ? 372 : 0 }}
    >
      <div className={`backdrop-blur-lg border rounded-t-[48px] rounded-b-[60px] flex flex-col relative ${
        'bg-white border-[#ececec]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-start pt-6 pb-2 px-6 shrink-0">
          <p className="t-label-lg whitespace-nowrap text-[#111111]">Transaction History</p>
        </div>

        {/* Filter chips */}
        <div className="relative flex gap-3 pt-4 shrink-0">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pl-5 pr-5">
            {TX_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded-full h-9 px-4 flex items-center shrink-0 border-2 ${
                  `bg-[#f5f5f5] ${f === activeFilter ? 'border-[#111111] bg-white' : 'border-transparent'}`
                }`}
              >
                <span className="t-label whitespace-nowrap text-[#111111]">
                  {f}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction list — grouped by date */}
        <div className="pt-3">
          {TRANSACTION_GROUPS.map((group, gi) => (
            <div key={gi}>
              <div className="flex items-center justify-center pt-4 pb-2 px-5">
                <p className="t-body-md text-[#404040] whitespace-nowrap">{group.date}</p>
              </div>
              {group.items.map((item, i) => (
                <TransactionItem key={item.id} item={item} isLast={i === group.items.length - 1} />
              ))}
            </div>
          ))}
        </div>

        {/* See all */}
        <button className="shrink-0 flex items-center justify-center p-3 pb-6 w-full">
          <span className="rounded-full px-8 py-3 text-[14px] font-medium leading-5 whitespace-nowrap bg-[#f5f5f5] text-black">See all</span>
        </button>
      </div>
    </div>
  )
}

/* ─── Bottom bar ───────────────────────────────────────────────────── */

function MenuDots() {
  return (
    <div className="flex flex-wrap w-6">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="p-1 flex items-center">
          <div className="size-1 rounded-full bg-black" />
        </div>
      ))}
    </div>
  )
}

/* Static menu / close icon — no morph animation */
function MenuToggleIcon({ open }) {
  if (open) {
    return <Icon name="close" size={24} className="text-white" />
  }
  return (
    <Image
      src={asset("/menu.svg")}
      alt=""
      width={24}
      height={24}
      style={{ filter: 'invert(1)' }}
    />
  )
}

function BottomBar({ onOpenTri, triMode, onCloseTri, triHovered, keyboardOpen, onOpenKeyboard, onCloseKeyboard, onSend, menuOpen, onOpenMenu, attachedCount = 0, onClearAttached }) {
  const fade = { duration: 0.18, ease: 'easeInOut' }

  return (
    <div className="relative shrink-0 w-full" style={{ height: 64 }}>

      {/* Normal mode */}
      <motion.div
        initial={false}
        animate={{ opacity: triMode ? 0 : 1, y: triMode ? 4 : 0, pointerEvents: triMode ? 'none' : 'auto' }}
        transition={fade}
        className="absolute inset-0 flex items-center gap-2"
      >
        {/* Menu pill — morphs into the menu sheet via layoutId */}
        {!menuOpen && (
          <motion.button
            layoutId="menu-surface"
            style={{ borderRadius: 36 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenMenu}
            className="px-8 py-5 flex items-center justify-center shrink-0 bg-black"
          >
            {/* Dots rendered by the static overlay button — this preserves the pill's size */}
            <div className="size-6" />
          </motion.button>
        )}
        {/* Spacer holds the pill's slot while the sheet is open */}
        {menuOpen && <div className="shrink-0" style={{ width: 88, height: 64 }} />}

        {/* Ask AI input — physically shoved off the right edge when menu opens */}
        <motion.div
          initial={false}
          animate={{
            x: menuOpen ? 380 : 0,
            rotate: menuOpen ? 4 : 0,
            opacity: menuOpen ? 0 : 1,
            pointerEvents: menuOpen ? 'none' : 'auto',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          onClick={(e) => {
            // Deterministic guard: bail if the click came from inside the chip
            // pill — checking the actual DOM target is immune to event-timing
            // races, unlike stopPropagation-based guards.
            if (e.target.closest('[data-ask-chip]')) return
            onOpenTri?.()
          }}
          className={`flex-1 flex items-center justify-between gap-2 backdrop-blur-sm border-2 rounded-[36px] pl-8 pr-5 py-5 transition-shadow duration-200 cursor-pointer ${
            'bg-white border-[#e5e5e5]'
          } ${triHovered ? 'shadow-[0_0_0_4px_rgba(237,28,36,0.25)]' : ''}`}
        >
          <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
            <span className="t-body-md whitespace-nowrap text-left min-w-0 text-[#111111]">
              Ask anything...
            </span>
            {attachedCount > 0 && (
              <div
                data-ask-chip
                className="flex items-center h-6 gap-1 rounded-full pl-2 pr-1 shrink-0 bg-[#f5f5f5]"
              >
                <span className="flex h-4 items-center text-[12px] font-medium leading-4 whitespace-nowrap text-[#111111]">
                  {attachedCount} attached
                </span>
                <button
                  type="button"
                  data-ask-chip
                  onClick={(e) => {
                    e.stopPropagation()
                    onClearAttached?.()
                  }}
                  className="flex items-center justify-center size-4"
                >
                  <Icon name="close" size={16} className="text-[#111111]" />
                </button>
              </div>
            )}
          </div>
          <div className="size-6 flex items-center justify-center shrink-0">
            <Image src={asset("/ai.png")} alt="" width={24} height={24} />
          </div>
        </motion.div>
      </motion.div>

      {/* TRÍ base mode — input visible, not keyboard */}
      <motion.div
        initial={false}
        animate={{
          opacity: triMode && !keyboardOpen ? 1 : 0,
          y: triMode && !keyboardOpen ? 0 : 4,
          pointerEvents: triMode && !keyboardOpen ? 'auto' : 'none',
        }}
        transition={{ ...fade, delay: triMode && !keyboardOpen ? 0.08 : 0 }}
        className="absolute inset-0 flex items-center gap-2"
      >
        <button onClick={onCloseTri} className="bg-white rounded-[36px] px-8 py-5 flex items-center justify-center shrink-0">
          <MenuDots />
        </button>
        <button
          onClick={onOpenKeyboard}
          className="flex-1 flex items-center justify-between bg-[#111111] backdrop-blur-sm border border-[#fafafa] rounded-[36px] pl-8 pr-5 py-5"
        >
          <span className="t-caption text-white whitespace-nowrap">Ask AI anything...</span>
          <div className="size-6 flex items-center justify-center shrink-0">
            <Image src={asset("/ai.png")} alt="" width={24} height={24} />
          </div>
        </button>
      </motion.div>

      {/* TRÍ keyboard mode — typing state */}
      <motion.div
        initial={false}
        animate={{
          opacity: triMode && keyboardOpen ? 1 : 0,
          y: triMode && keyboardOpen ? 0 : 4,
          pointerEvents: triMode && keyboardOpen ? 'auto' : 'none',
        }}
        transition={{ ...fade, delay: triMode && keyboardOpen ? 0.05 : 0 }}
        className="absolute inset-0 flex items-center gap-2"
      >
        <div className="flex-1 flex items-center justify-between bg-[#111111] backdrop-blur-sm border border-[#fafafa] rounded-[36px] pl-8 pr-5 py-5">
          <span className="t-caption text-white flex items-center gap-px">
            Freeze my card
            <BlinkingCursor />
          </span>
          <button onClick={onSend} className="size-6 flex items-center justify-center shrink-0">
            <Image src={asset("/ai.png")} alt="" width={24} height={24} />
          </button>
        </div>
        <button
          onClick={onCloseKeyboard}
          className="bg-[#111111] border border-[#262626] rounded-full p-3 flex items-center justify-center shrink-0"
        >
          <Icon name="close" size={24} className="text-white" />
        </button>
      </motion.div>
    </div>
  )
}

/* ─── Menu Sheet — blooms out of the bottom-left pill ──────────────── */

const MENU_ITEMS = [
  { label: 'Home',              icon: 'logo',            navKey: 'home'       },
  { label: 'Accounts & Cards',  icon: 'wallet'    },
  { label: 'Transfer & Pay',    icon: 'mobiledata_arrows' },
  { label: 'Techcombank OneU',  icon: 'money_bag' },
  { label: 'My Wealth',         icon: 'lightbulb'     },
]

const MENU_QUICK_LINKS = [
  { label: 'Payment  Link', icon: 'link' },
  { label: 'Card offers',   icon: 'credit_card' },
  { label: `What's new`,    icon: 'bolt' },
  { label: 'Refer & Earn',  icon: 'group' },
]

function MenuSheet({ onClose, activeNav = 'home' }) {
  // Same contrast rule as the other overlays: dark sheet on the light app surface.
  

  // Bottom-up stagger: content nearest the origin (the pill) lands first
  const rise = (order) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { delay: 0.18 + order * 0.05, duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
    exit:    { opacity: 0, transition: { duration: 0.1 } },
  })

  return (
    <motion.div
      layoutId="menu-surface"
      style={{ borderRadius: 60, top: 160 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute left-1 right-1 bottom-1 z-50 flex flex-col overflow-hidden bg-[#111111]"
    >
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">

        {/* Profile card — always the cinnabar gradient, only its content inverts */}
        <motion.div
          {...rise(4)}
          className="relative overflow-hidden rounded-[48px] p-6 flex items-center justify-between gap-4 shrink-0"
          style={{ backgroundImage: 'linear-gradient(106deg, #ff9da1 0%, #fe353d 100%)' }}
        >
          <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{ left: 192, top: '50%', width: 274, height: 214, transform: 'translateY(-50%)' }}
          >
            <div className="relative shrink-0 opacity-40 rotate-[15deg]" style={{ width: 241, height: 157 }}>
              <Image src={asset("/menu-profile-pattern.png")} alt="" fill className="object-cover" />
            </div>
          </div>
          <div className="relative flex items-center gap-3">
            <div className="size-14 rounded-full bg-[#e5e5e5] overflow-hidden relative shrink-0">
              <Image src={asset("/avatar.png")} alt="QA" fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-2 items-start">
              <span className="t-label-lg text-white">Quang Anh</span>
              <div className="rounded-full px-2 py-1 flex items-center gap-1 bg-white">
                <Image src={asset("/logo.svg")} alt="" width={16} height={16} />
                <span className="text-[12px] font-medium leading-4 whitespace-nowrap text-black">Inspire Max</span>
              </div>
            </div>
          </div>
          <div className="relative flex items-center gap-2 shrink-0">
            <span className="text-[12px] whitespace-nowrap text-white">Membership benefits</span>
            <button className="rounded-full p-1 flex items-center justify-center bg-white">
              <Icon name="chevron_right" size={16} className="text-black" />
            </button>
          </div>
        </motion.div>

        {/* Main menu items */}
        <motion.div {...rise(3)} className="rounded-[32px] flex flex-col shrink-0 bg-[#171717]">
          {MENU_ITEMS.map(({ label, icon, navKey }, i) => {
            const active = navKey === activeNav
            return (
              <button
                key={label}
                onClick={label === 'Home' ? onClose : undefined}
                className={`flex items-center gap-6 px-6 w-full text-left ${
                  i === 0 ? 'pt-6 pb-4' : i === MENU_ITEMS.length - 1 ? 'pt-4 pb-6' : 'py-4'
                }`}
              >
                {icon === 'logo'
                  ? <TcbLogoIcon size={20} className="text-cinnabar-500" />
                  : <Icon name={icon} size={20} className={active ? 'text-cinnabar-500' : ('text-[#fafafa]')} />
                }
                <span className={`t-label ${active ? 'text-cinnabar-500' : ('text-[#fafafa]')}`}>{label}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Quick links + branch/map card */}
        <motion.div {...rise(2)} className="flex items-stretch gap-2.5 shrink-0">
          <div className="flex-1 min-w-0 rounded-[32px] flex flex-col bg-[#171717]">
            {MENU_QUICK_LINKS.map(({ label, icon }, i) => (
              <button
                key={label}
                className={`flex items-center gap-6 px-6 w-full text-left ${
                  i === 0 ? 'pt-6 pb-4' : i === MENU_QUICK_LINKS.length - 1 ? 'pt-4 pb-6' : 'py-4'
                }`}
              >
                <Icon name={icon} size={20} className="shrink-0 text-[#fafafa]" />
                <span className="t-label whitespace-nowrap text-[#fafafa]">{label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0 border border-info rounded-[32px] overflow-hidden flex flex-col bg-[#171717]">
            <p className="t-label px-6 pt-6 pb-3 text-[#fafafa]">Find branches &amp; ATMs on map</p>
            <div className="px-6"><div className="h-px bg-[#737373] opacity-10 rounded-full w-full" /></div>
            <div className="flex flex-col gap-2 px-6 py-3">
              <p className="t-label text-[#fafafa]">Book an appointment</p>
              <p className="text-[12px] leading-4 text-[#737373]">For a smoother branch visit</p>
            </div>
            <div className="relative h-[79px] shrink-0">
              <Image src={asset('/menu-map-dark.png')} alt="" fill className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-info rounded-full p-1 flex items-center justify-center shadow-lg">
                  <Icon name="location_on" size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer — dots slot left (rendered by static overlay), language + settings right */}
      <div className="flex items-center justify-between px-11 py-5 shrink-0">
        <div className="size-6" />
        <motion.div {...rise(0)} className="flex items-center gap-4">
          <span className="t-label-lg text-white">EN</span>
          <button className="flex items-center">
            <Icon name="settings" size={24} className="text-white" />
          </button>
        </motion.div>
      </div>

      {/* Bottom spacer */}
      <div className="h-7 shrink-0" />
    </motion.div>
  )
}

/* ─── Overlays (dark-surfaced, pop above the light app background) ─── */

/* Counts from 0 to `to` on mount — runs when the Insight panel opens */
function CountUp({ to, format = (v) => Math.round(v).toLocaleString('en-US'), duration = 1.2, delay = 0.25, className = '' }) {
  const [display, setDisplay] = useState(() => format(0))
  useEffect(() => {
    const controls = animate(0, to, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(format(v)),
    })
    return () => controls.stop()
  }, [to, duration, delay]) // eslint-disable-line react-hooks/exhaustive-deps
  return <span className={`tabular-nums ${className}`}>{display}</span>
}

function InsightStatCard({ label, value, description, iconSrc, iconBg, iconClassName = '' }) {
  return (
    <div className={`flex-1 h-full w-full rounded-[40px] p-6 flex flex-col items-end justify-between gap-1 min-w-0 border ${
      'bg-[#171717] border-[#262626]'
    }`}>
      <div className="w-full flex flex-col gap-1">
        <p className="text-[14px] font-medium leading-5 text-[#737373] tracking-[0.28px]">{label}</p>
        {value}
        <p className="text-[14px] font-medium leading-5 text-[#737373] tracking-[0.28px]">{description}</p>
      </div>
      <div className="rounded-full p-2 flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        <Image src={iconSrc} alt="" width={32} height={32} className={iconClassName} />
      </div>
    </div>
  )
}

const GOAL_TICKS = 20        // 21 tick marks → 20 intervals
const GOAL_PERCENT = 50
const GOAL_CURRENT_TICK = 10 // "2.5M" midpoint marker

/* Isolated so its 60fps progress tween only re-renders this small subtree
   (21 tick bars + a couple of text nodes) instead of the whole BalanceOverlay
   — that used to re-render every stat card, the coffee card, and every button
   on every animation frame, which was the source of the open-lag. */
function GoalProgressCard({ showCard = true }) {
  const [goalProgress, setGoalProgress] = useState(0)
  useEffect(() => {
    if (!showCard) return
    const controls = animate(0, GOAL_PERCENT, {
      duration: 1.2,
      delay: 0.25,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setGoalProgress,
    })
    return () => controls.stop()
  }, [showCard])

  const litTicks = Math.round((goalProgress / 100) * GOAL_TICKS)
  const atCurrent = litTicks >= GOAL_CURRENT_TICK

  return (
    <div className="rounded-[40px] overflow-hidden relative flex flex-col justify-between p-6 w-full border border-[#bedbff] bg-white" style={{ height: 200 }}>
      {/* Header */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-1">
            <p className="t-label text-black">Buying House Goal</p>
            <span className="text-[24px] font-bold leading-8 tracking-[0.48px] tabular-nums text-black">
              {Math.round(goalProgress)}%
            </span>
          </div>
          <div className="rounded-full p-2 bg-[#bedbff] flex items-center justify-center shrink-0">
            <Image src={asset("/insight-house.png")} alt="" width={32} height={32} />
          </div>
        </div>
        <p className="text-[14px] font-medium leading-5 tracking-[0.28px] w-full text-[#737373]">You are going half of the way</p>
      </div>

      {/* Tick ruler — labels above (0 / 2.5M pill / 5M), ticks below */}
      <div className="flex flex-col gap-2 w-full pt-6">
        <div className="relative w-full" style={{ height: 20 }}>
          <div className="absolute -translate-x-1/2 flex items-center justify-center" style={{ left: 0 }}>
            <span className="text-[14px] font-medium leading-5 tracking-[0.28px] px-1 text-black">0</span>
          </div>
          <motion.div
            initial={false}
            animate={{ opacity: atCurrent ? 1 : 0, scale: atCurrent ? 1 : 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="absolute -translate-x-1/2 flex items-center justify-center"
            style={{ left: '50%' }}
          >
            <span className="bg-blue-500 rounded-full px-2 text-[14px] font-medium leading-5 tracking-[0.28px] whitespace-nowrap text-black">2.5M</span>
          </motion.div>
          <div className="absolute -translate-x-1/2 flex items-center justify-center" style={{ left: '100%' }}>
            <span className="text-[14px] font-medium leading-5 tracking-[0.28px] px-1 text-black">5M</span>
          </div>
        </div>
        <div className="flex items-end justify-between w-full">
          {Array.from({ length: GOAL_TICKS + 1 }).map((_, i) => {
            const lit = i <= litTicks && goalProgress > 0.5
            const tall = i === 0 || i === GOAL_CURRENT_TICK || i === GOAL_TICKS
            return (
              <div
                key={i}
                className={`rounded-full ${lit ? ('bg-blue-600') : ('bg-neutral-400')}`}
                style={{ width: 2, height: tall ? 12 : 6 }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

const GLITTER_SPARKLES = [
  { left: '12%', top: '18%', size: 6, dx: -5, dy: -8, delay: 0.00, color: '#fde68a' },
  { left: '22%', top: '30%', size: 3, dx: -3, dy: -6, delay: 0.10, color: '#ffffff' },
  { left: '34%', top: '12%', size: 5, dx: -2, dy: -9, delay: 0.18, color: '#facc15' },
  { left: '48%', top: '24%', size: 4, dx: 2,  dy: -8, delay: 0.28, color: '#ffffff' },
  { left: '66%', top: '15%', size: 7, dx: 6,  dy: -7, delay: 0.38, color: '#fde047' },
  { left: '82%', top: '34%', size: 4, dx: 5,  dy: -2, delay: 0.48, color: '#ffffff' },
  { left: '17%', top: '58%', size: 5, dx: -6, dy: 4,  delay: 0.58, color: '#fef3c7' },
  { left: '31%', top: '72%', size: 3, dx: -3, dy: 7,  delay: 0.68, color: '#ffffff' },
  { left: '52%', top: '58%', size: 6, dx: 3,  dy: -5, delay: 0.78, color: '#fde68a' },
  { left: '70%', top: '72%', size: 4, dx: 5,  dy: 5,  delay: 0.88, color: '#ffffff' },
  { left: '86%', top: '64%', size: 6, dx: 7,  dy: 4,  delay: 0.98, color: '#facc15' },
  { left: '42%', top: '86%', size: 4, dx: -2, dy: 7,  delay: 1.08, color: '#ffffff' },
]

function GlitterBurst({ playKey = 0 }) {
  return (
    <div className="absolute -inset-2 pointer-events-none z-20 overflow-visible">
      {GLITTER_SPARKLES.map((s, i) => (
        <motion.span
          key={`${playKey}-${i}`}
          className="absolute leading-none"
          style={{
            left: s.left,
            top: s.top,
            color: s.color,
            fontSize: s.size + 5,
            textShadow: '0 0 8px rgba(250, 204, 21, 0.95), 0 0 2px rgba(0, 0, 0, 0.65)',
          }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
          animate={{
            opacity: [0, 0.9, 0.25, 0.85, 0.18, 0.7, 0],
            x: [0, s.dx * 0.2, s.dx * 0.38, s.dx * 0.56, s.dx * 0.74, s.dx * 0.9, s.dx],
            y: [0, s.dy * 0.2, s.dy * 0.38, s.dy * 0.56, s.dy * 0.74, s.dy * 0.9, s.dy],
            scale: [0.25, 1, 0.45, 0.95, 0.35, 0.8, 0.2],
            rotate: [0, 25, 60, 95, 130, 160, 180],
          }}
          transition={{ duration: 2.8, times: [0, 0.14, 0.28, 0.45, 0.62, 0.8, 1], ease: 'easeOut', delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  )
}

function GlitterMist({ playKey = 0 }) {
  return (
    <motion.div
      key={`mist-${playKey}`}
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        backgroundImage: [
          'radial-gradient(circle at 14% 20%, rgba(250,204,21,0.95) 0 1.5px, transparent 2.5px)',
          'radial-gradient(circle at 30% 36%, rgba(255,255,255,0.95) 0 1px, transparent 2px)',
          'radial-gradient(circle at 44% 18%, rgba(253,230,138,0.9) 0 1.5px, transparent 2.5px)',
          'radial-gradient(circle at 62% 44%, rgba(255,255,255,0.9) 0 1px, transparent 2px)',
          'radial-gradient(circle at 78% 28%, rgba(250,204,21,0.9) 0 1.5px, transparent 2.5px)',
          'radial-gradient(circle at 22% 72%, rgba(255,255,255,0.95) 0 1px, transparent 2px)',
          'radial-gradient(circle at 54% 76%, rgba(253,230,138,0.9) 0 1.5px, transparent 2.5px)',
          'radial-gradient(circle at 86% 68%, rgba(255,255,255,0.95) 0 1px, transparent 2px)',
        ].join(', '),
        filter: 'drop-shadow(0 0 4px rgba(250, 204, 21, 0.75)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.4))',
      }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: [0, 0.95, 0.18, 0.85, 0.12, 0.7, 0], scale: [0.98, 1, 1.005, 1.01, 1.005, 1, 0.99] }}
      transition={{ duration: 3.2, times: [0, 0.14, 0.3, 0.48, 0.64, 0.82, 1], ease: 'easeOut' }}
    />
  )
}

function CoffeeInsightCard({ effectKey = null }) {
  const [mountEffectKey, setMountEffectKey] = useState(null)

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMountEffectKey(`mount-${Date.now()}`)
    }, 320)
    return () => window.clearTimeout(id)
  }, [])

  const activeEffectKey = effectKey ?? mountEffectKey
  const showEffect = activeEffectKey !== null && activeEffectKey !== undefined

  return (
    <motion.div
      animate={showEffect ? { scale: [1, 1.01, 0.998, 1], rotate: [0, -0.12, 0.1, 0] } : { scale: 1, rotate: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex-1 rounded-[40px] p-6 flex flex-col items-end justify-between gap-1 min-w-0 overflow-hidden border ${
        'bg-[#171717] border-[#262626]'
      }`}
    >
      {showEffect && (
        <motion.div
          key={`shine-${activeEffectKey}`}
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(110deg, transparent 0%, transparent 34%, rgba(255,255,255,0.68) 45%, rgba(253,230,138,0.58) 50%, rgba(255,255,255,0.68) 55%, transparent 66%, transparent 100%)',
          }}
          initial={{ x: '-120%', opacity: 0 }}
          animate={{ x: '120%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.15, ease: 'easeInOut', times: [0, 0.18, 0.78, 1] }}
        />
      )}
      {showEffect && <GlitterMist playKey={activeEffectKey} />}
      {showEffect && <GlitterBurst playKey={activeEffectKey} />}
      <div className="relative w-full flex flex-col gap-1">
        <p className="text-[14px] font-medium leading-5 text-[#737373] tracking-[0.28px]">You have spent</p>
        <p className="text-[24px] font-bold leading-8 tracking-[0.48px] text-white">1.4m</p>
        <p className="text-[14px] font-medium leading-5 text-[#737373] tracking-[0.28px]">on daily coffee this month</p>
      </div>
      <div className="relative rounded-full p-2 flex items-center justify-center shrink-0 bg-[#d5d4f7]">
        <Image src={asset("/insight-coffee-3d.png")} alt="" width={32} height={32} />
      </div>
    </motion.div>
  )
}

const SHAKE = {
  animate: { rotate: [-0.6, 0.6, -0.6, 0.6, -0.6, 0.6] },
  transition: { repeat: Infinity, duration: 0.9, ease: 'easeInOut' },
}

function RemoveBtn({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -top-3 -left-3 z-10 rounded-full px-2 py-1 flex items-center justify-center border ${
      'bg-[#fafafa] border-[#111111]'
    }`}
    >
      <Icon name="check_indeterminate_small" size={20} className="text-[#111111]" />
    </button>
  )
}

function BalanceOverlay({ onClose, onAddInsight, onRemoveInsight, showCard = true, insightAdded = false, insightAnimationKey = 0 }) {
  // The panel contrasts against the light app surface: dark panel on light background.
  
  const [isEditing, setIsEditing] = useState(false)
  const [visibleCoffeeEffectKey, setVisibleCoffeeEffectKey] = useState(null)

  useEffect(() => {
    if (!showCard || !insightAdded) {
      const id = window.setTimeout(() => setVisibleCoffeeEffectKey(null), 0)
      return () => window.clearTimeout(id)
    }

    setVisibleCoffeeEffectKey(null)
    const id = window.setTimeout(() => {
      setVisibleCoffeeEffectKey(`${insightAnimationKey}-${Date.now()}`)
    }, 260)
    return () => window.clearTimeout(id)
  }, [showCard, insightAdded, insightAnimationKey])

  const panelBg = '#111111'
  const panelExitBg = '#fafafa'
  const removeCoffeeInsight = () => {
    onRemoveInsight?.()
    setIsEditing(false)
  }

  return (
    <>
      {/* Backdrop — stays fully dark through the panel's collapse, only fades at the very end */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3 } }}
        exit={{ opacity: 0, transition: { duration: 0.18, delay: 0.22 } }}
        className="absolute inset-0 z-50"
        onClick={onClose}
      >
        <div className="absolute inset-0 rounded-[64px] bg-black/60" />
      </motion.div>

      {/* Insight panel — the dot expands out of the seam between the quick-action
          row and the promo banners (seam center ≈ 220,380 in phone coords; panel
          origin is left-1 top-1 = 4,4). Animated via clipPath (paint-only) instead
          of width/height so the content tree isn't re-laid-out every frame. */}
      {showCard && (
          <motion.div
            initial={{
              clipPath: `inset(360px 200px ${788 - 384}px 200px round 60px)`,
              backgroundColor: panelBg,
            }}
            animate={{
              clipPath: 'inset(0px 0px 0px 0px round 60px)',
              height: 788,
              backgroundColor: panelBg,
            }}
            exit={{
              clipPath: `inset(324px 164px ${788 - 420}px 164px round 60px)`,
              opacity: 0,
              backgroundColor: panelExitBg,
              transition: {
                type: 'spring', stiffness: 380, damping: 40, delay: 0.14,
                opacity: { duration: 0.12, ease: 'easeOut', delay: 0.26 },
              },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            style={{ width: 432 }}
            className="absolute left-1 top-1 z-50 overflow-hidden rounded-[60px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content layer — fades out after the cards drop, before the shell collapses */}
            <motion.div
              exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn', delay: 0.12 } }}
              className="border-[0.75px] border-dashed rounded-[60px] flex flex-col overflow-hidden h-full border-[#262626]"
              style={{ width: 432 }}
            >
              {/* Content */}
              <div className="flex-1 flex flex-col gap-2 px-3 pt-16 pb-3 w-full min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {/* Buying House Goal card — first, per design. Isolated into its own
                    component so its 60fps progress tween doesn't re-render the rest
                    of this overlay (see GoalProgressCard). */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn', delay: 0.1 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
                  className="w-full"
                >
                <motion.div className="relative w-full" animate={isEditing ? SHAKE.animate : { rotate: 0 }} transition={isEditing ? { ...SHAKE.transition, delay: 0.04 } : {}}>
                  {isEditing && <RemoveBtn />}
                  <GoalProgressCard showCard={showCard} />
                </motion.div>
                </motion.div>

                {/* Stat cards row */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn', delay: 0.05 } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.18 }}
                  className="flex items-stretch gap-2 w-full"
                >
                  <motion.div className="relative flex flex-1 min-w-0" animate={isEditing ? SHAKE.animate : { rotate: 0 }} transition={isEditing ? SHAKE.transition : {}}>
                    {isEditing && <RemoveBtn />}
                    <InsightStatCard
                      label="You have"
                      iconSrc={asset("/insight-cash.png")}
                      iconBg="#fff085"
                      iconClassName="-scale-x-100"
                      value={<CountUp to={53} format={(v) => `${Math.round(v)}m`} className="block text-[24px] font-bold leading-8 tracking-[0.48px] text-white" />}
                      description="has remained unused for over 4 months"
                    />
                  </motion.div>
                  <motion.div className="relative flex flex-1 min-w-0" animate={isEditing ? { ...SHAKE.animate, rotate: SHAKE.animate.rotate.map(r => -r) } : { rotate: 0 }} transition={isEditing ? { ...SHAKE.transition, delay: 0.08 } : {}}>
                    {isEditing && <RemoveBtn />}
                    <InsightStatCard
                      label="You already spent"
                      iconSrc={asset("/insight-wallet.png")}
                      iconBg="#d9f99d"
                      value={
                        <p className="text-[24px] font-bold leading-8 tracking-[0.48px] tabular-nums whitespace-nowrap text-white">
                          <CountUp to={2.4} format={(v) => `${v.toFixed(1).replace('.', ',')}m`} duration={1.1} />
                          <span className="text-[#737373]">{' / 20m'}</span>
                        </p>
                      }
                      description="of your monthly budget"
                    />
                  </motion.div>
                </motion.div>

                {/* Add new insight */}
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.18, ease: 'easeIn' } }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.26 }}
                  className="flex items-stretch gap-2 w-full"
                >
                  <motion.button
                    layout
                    onClick={onAddInsight}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    className={`w-[200px] shrink-0 min-w-0 border border-dashed rounded-[40px] p-6 flex flex-col items-center justify-center gap-2 ${insightAdded ? 'order-2' : 'order-1'} border-[#fafafa]`}
                  >
                    <Image src={asset("/ai.png")} alt="" width={40} height={40} />
                    <span className="text-[16px] font-semibold leading-6 tracking-[0.32px] text-center whitespace-nowrap text-white">Add new insight</span>
                  </motion.button>
                  <AnimatePresence mode="popLayout" initial={false}>
                  {insightAdded ? (
                    <motion.div
                      key="coffee-added"
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 16, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                      className="relative flex-1 min-w-0 flex order-1"
                    >
                      <motion.div className="relative flex-1 min-w-0 flex" animate={isEditing ? SHAKE.animate : { rotate: 0 }} transition={isEditing ? { ...SHAKE.transition, delay: 0.12 } : {}}>
                        {isEditing && <RemoveBtn onClick={removeCoffeeInsight} />}
                        <CoffeeInsightCard effectKey={visibleCoffeeEffectKey} />
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* Invisible coffee card — reserves the right half + row height, per design */
                    <motion.div
                      key="coffee-empty"
                      exit={{ opacity: 0 }}
                      className="flex-1 min-w-0 flex opacity-0 pointer-events-none order-2"
                      aria-hidden="true"
                    >
                      <CoffeeInsightCard effectKey={null} />
                    </motion.div>
                  )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Footer — Edit / Close */}
              <div className={`flex items-center justify-between px-6 pt-3 pb-0 shrink-0 w-full bg-gradient-to-b ${
                'from-black/0 to-black'
              }`}>
                <button onClick={() => setIsEditing(v => !v)} className="border rounded-[60px] px-8 py-4 backdrop-blur-sm border-white">
                  <span className="text-[14px] font-medium leading-5 tracking-[0.28px] text-white">{isEditing ? 'Done' : 'Edit'}</span>
                </button>
                <button onClick={onClose} className="rounded-[60px] px-8 py-4 backdrop-blur-sm bg-white">
                  <span className="text-[14px] font-medium leading-5 tracking-[0.28px] text-black">Close</span>
                </button>
              </div>
              <div className="h-6 shrink-0" />
            </motion.div>
          </motion.div>
      )}
    </>
  )
}

function TransactionOverlay({ onClose, showCard = true }) {
  // Same contrast rule as BalanceOverlay: dark card on the light app surface.
  

  const suggestions = [
    'Why is it higher this month?',
    'How much did I spend at Shopee this year?',
    'Set a monthly budget',
  ]
  const spendingRows = [
    { label: 'Total coffee spending',        amount: '3,200,000vnd' },
    { label: 'Total only shopping spending', amount: '1,200,000vnd' },
    { label: 'Total food spending',          amount: '1,200,000vnd' },
  ]

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 z-50"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-[64px]" />
      </motion.div>

      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ y: 800 }} animate={{ y: 0 }} exit={{ y: 800 }}
            transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            className="absolute inset-x-4 bottom-10 z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-4xl flex flex-col gap-4 p-4 bg-[#111111]">
              <div className="flex items-center justify-between">
                <span className="text-[24px] font-bold leading-8 text-white">Analyze</span>
                <button onClick={onClose} className="size-10 rounded-full flex items-center justify-center shrink-0 bg-[#171717]">
                  <Icon name="close" size={20} className="text-[#a1a1a1]" />
                </button>
              </div>

              <div className="rounded-3xl p-4 flex flex-col gap-1 bg-[#171717]">
                <p className="text-[13px] font-medium leading-5 text-[#a1a1a1]">You overspent</p>
                <p className="text-[28px] font-bold text-amber-500 leading-9">2Mvnđ on coffee</p>
                <p className="text-[13px] leading-5 text-[#a1a1a1]">
                  Your coffee spending has increased 18% this month, mainly after payday.
                </p>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-[14px] font-semibold leading-5 text-white">Spending</span>
                  <span className="text-[14px] font-medium text-info leading-5">Define new one</span>
                </div>
                {spendingRows.map(({ label, amount }) => (
                  <div key={label}>
                    <div className="h-px bg-[#262626]" />
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[13px] leading-5 text-[#737373]">{label}</span>
                      <span className="text-[13px] font-medium text-danger leading-5 shrink-0 ml-2">{amount}</span>
                    </div>
                  </div>
                ))}
                <div className="bg-info-subtle rounded-2xl p-3 flex items-start gap-2 mt-1">
                  <Icon name="info" size={18} className="text-info shrink-0 mt-px" />
                  <p className="text-[12px] text-info leading-4">
                    The categories is being created by AI. You can add AI to add more or remove the wrong one.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {suggestions.map(text => (
                  <button key={text} className={`w-full flex items-center justify-center border px-4 py-3 rounded-full ${
                    'border-[#262626] bg-[#171717]'
                  }`}>
                    <span className="text-[14px] font-medium text-white">{text}</span>
                  </button>
                ))}
                <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white">
                  <Image src={asset("/ai.png")} alt="AI" width={20} height={20} />
                  <span className="text-[14px] font-medium text-[#111111]">Ask a follow-up</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── TRÍ Screen ────────────────────────────────────────────────────── */

const TRI_ENTRY_SUGGESTIONS = [
  { id: 1, rotate: -8, icon: asset('/icons-home/tri-suggestion-house.png'),  iconBg: '#bedbff', label: 'Make a plan to buy house',                    message: 'Make a plan to buy house' },
  { id: 2, rotate: 8,  icon: asset('/icons-home/tri-suggestion-plane.png'),  iconBg: '#d5d4f7', label: 'Summarize my total spending on Bangkok Trip', message: 'Summarize my total spending on Bangkok Trip' },
  { id: 3, rotate: -8, icon: asset('/icons-home/tri-suggestion-freeze.png'), iconBg: '#fff4cc', label: 'Freeze my Credit card',                       message: 'Freeze my card' },
]

function TriScreen({ onClose, onOpenChat }) {
  return (
    <motion.div
      initial={{ x: 448 }} animate={{ x: 0 }} exit={{ x: 448 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-0 z-80 rounded-[64px] overflow-hidden flex flex-col bg-white"
    >
      {/* Background — the Home gradient */}
      {<div
          className="absolute inset-0 rounded-[64px]"
          style={{ background: 'linear-gradient(180deg, #a1a1aa 0%, #ffffff 70%)' }}
        />}

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-70">
        <StatusBar />
      </div>

      {/* Layout column */}
      <div className="absolute inset-0 flex flex-col gap-2 px-1 pt-1 pb-1">

        {/* Main content card */}
        <div className={`relative flex-1 border rounded-t-[64px] rounded-b-[48px] overflow-hidden flex flex-col items-center min-h-0 ${
          'border-[#e5e5e5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 40%)',
        }}
        >

          {/* Header */}
          <div className="flex items-center justify-between pb-3 pl-4 pr-3 pt-16 shrink-0 w-full">
            <button className={`rounded-full px-5 py-2 flex items-center justify-center border ${
              'border-neutral-300'
            }`}>
              <Icon name="history" size={24} className="text-[#111111]" />
            </button>
            <div className="flex items-center gap-1">
              <button className={`rounded-full px-5 py-2 flex items-center justify-center border ${
                'border-neutral-300'
              }`}>
                <Icon name="search" size={24} className="text-[#111111]" />
              </button>
              <button onClick={onClose} className="rounded-full px-5 py-2 flex items-center justify-center border shrink-0 border-neutral-300">
                <Icon name="close" size={24} className="text-black" />
              </button>
            </div>
          </div>

          {/* Greeting + suggestion cards */}
          <div className="flex-1 w-full flex flex-col items-center justify-end overflow-hidden min-h-0">
            <div className="flex flex-col gap-2.5 p-4 shrink-0 w-full whitespace-nowrap">
              <p className="t-h3 text-[#111111]">Hey Quang!</p>
              <p className="t-label text-[#737373]">What&apos;s been on your mind lately?</p>
            </div>

            <div className="flex items-center pb-4 pt-3 px-4 shrink-0 w-full">
              {TRI_ENTRY_SUGGESTIONS.map(({ id, rotate, icon, iconBg, label }) => (
                <div
                  key={id}
                  className="flex items-start justify-start shrink-0 text-left"
                  style={{ width: 135, height: 155, marginRight: -16 }}
                >
                  <div
                    className={`rounded-3xl flex flex-col gap-1 items-start px-4 py-4 shrink-0 border ${
                      'bg-[#f5f5f5] border-[#e5e5e5]'
                    }`}
                    style={{ width: 117, height: 140, transform: `rotate(${rotate}deg)` }}
                  >
                    <div className="rounded-lg flex items-center justify-center shrink-0 size-6" style={{ background: iconBg }}>
                      <Image src={icon} alt="" width={20} height={20} />
                    </div>
                    <p className="t-label text-left w-full whitespace-normal text-[#111111]">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ask anything input */}
        <div className="flex gap-2 items-center px-3 w-full">
          <button
            onClick={() => onOpenChat?.('Freeze my card')}
            className={`flex-1 backdrop-blur-sm border flex items-center gap-2 pl-4 pr-2 py-2 rounded-[60px] min-w-0 ${
              'bg-white border-[#d4d4d4]'
            }`}
          >
            <Icon name="add" size={24} className="shrink-0 text-black" />
            <div className="flex-1 flex items-center gap-1 min-w-0">
              <BlinkingCursor />
              <span className="flex-1 t-body text-[#a1a1a1] text-left">Ask anything</span>
            </div>
            <div className="rounded-full p-2 flex items-center justify-center shrink-0 bg-[#111111]">
              <Image src={asset("/ai.png")} alt="" width={24} height={24} />
            </div>
          </button>
        </div>

        {/* Dark keyboard — in flow */}
        <DarkKeyboardMock />
      </div>
    </motion.div>
  )
}

/* ─── Insight Chat Screen — scripted "Add new insight" conversation ─── */

const INSIGHT_SCRIPT = {
  draft1: 'Add me a new financial insight to control my balance',
  reply1: {
    lines: ['What financial insight would you like to add?', 'You can ask things like:'],
    bullets: ['Spending by category', 'Subscription analysis', 'Salary & cash flow', 'Investment performance'],
  },
  draft2: 'Monthly coffee spending',
  reply2: { text: 'I’ve added a new Coffee Spending insight.', view: true },
}

function InsightChatScreen({ onClose, onViewInsight }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState(INSIGHT_SCRIPT.draft1)
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const handleSend = () => {
    if (!inputText || thinking) return
    const isFirst = messages.length === 0
    const sent = inputText
    setMessages(prev => [...prev, { role: 'user', content: sent }])
    setInputText('')
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setMessages(prev => [...prev, { role: 'ai', content: isFirst ? INSIGHT_SCRIPT.reply1 : INSIGHT_SCRIPT.reply2 }])
      if (isFirst) setTimeout(() => setInputText(INSIGHT_SCRIPT.draft2), 500)
    }, 1000)
  }

  const canSend = !!inputText && !thinking

  return (
    <motion.div
      initial={{ x: 448 }} animate={{ x: 0 }} exit={{ x: 448 }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-0 z-80 rounded-[64px] overflow-hidden flex flex-col bg-white"
    >
      {/* Background — the Home gradient */}
      {<div
          className="absolute inset-0 rounded-[64px]"
          style={{ background: 'linear-gradient(180deg, #a1a1aa 0%, #ffffff 70%)' }}
        />}

      {/* Status bar */}
      <div className="absolute top-0 left-0 right-0 z-70">
        <StatusBar />
      </div>

      {/* Layout column */}
      <div className="absolute inset-0 flex flex-col gap-2 px-1 pt-1 pb-1">

        {/* Main content card */}
        <div className={`relative flex-1 border rounded-t-[64px] rounded-b-[48px] overflow-hidden flex flex-col min-h-0 ${
          'border-[#e5e5e5] shadow-[0_8px_24px_rgba(0,0,0,0.08)]'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 40%)',
        }}
        >

          {/* Header */}
          <div className="flex items-center justify-between pb-3 pl-4 pr-3 pt-16 shrink-0 w-full">
            <button className={`rounded-full px-5 py-2 flex items-center justify-center border ${
              'border-neutral-300'
            }`}>
              <Icon name="history" size={24} className="text-[#111111]" />
            </button>
            <div className="flex items-center gap-1">
              <button className={`rounded-full px-5 py-2 flex items-center justify-center border ${
                'border-neutral-300'
              }`}>
                <Icon name="search" size={24} className="text-[#111111]" />
              </button>
              <button onClick={onClose} className="rounded-full px-5 py-2 flex items-center justify-center border shrink-0 border-neutral-300">
                <Icon name="close" size={24} className="text-black" />
              </button>
            </div>
          </div>

          {/* Message list — top edge masked so messages fade out under the header
              instead of being hard-clipped, without an opaque overlay div (that
              created a visible seam against the card's own translucent gradient) */}
          <div className="relative flex-1 min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0 h-full"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0px, black 32px)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 32px)',
            }}
          >
            <div className="flex flex-col py-4 w-full mt-auto">
              {messages.map((m, i) => (
                <div key={i} className={`flex w-full py-2 ${m.role === 'user' ? 'justify-end pl-24 pr-4' : 'justify-start pl-4 pr-24'}`}>
                  {m.role === 'user' ? (
                    <div className="bg-info rounded-3xl px-4 py-3 max-w-full">
                      <p className="text-[16px] leading-6 text-white">{m.content}</p>
                    </div>
                  ) : (
                    <div className="rounded-3xl px-4 py-3 max-w-full flex items-center gap-2.5 bg-[#f5f5f5]">
                      {m.content.bullets ? (
                        <div className="text-[16px] leading-6 text-[#111111]">
                          {m.content.lines.map((line, li) => <p key={li}>{line}</p>)}
                          <ul className="list-disc pl-6">
                            {m.content.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-[16px] leading-6 text-[#111111]">{m.content.text}</p>
                      )}
                      {m.content?.view && (
                        <button
                          onClick={onViewInsight}
                          className={`border rounded-[60px] px-6 py-3 backdrop-blur-sm shrink-0 ${
                            'bg-[#111111] border-black text-white'
                          }`}
                        >
                          <span className="text-[14px] font-medium leading-5 tracking-[0.28px]">View</span>
                        </button>
                      )}
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
          </div>
        </div>

        {/* Footer + keyboard — slide up after screen lands */}
        <motion.div
          initial={{ y: 480 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 32, delay: 0.28 }}
          className="flex flex-col gap-2 shrink-0"
        >
          {/* Ask anything input */}
          <div className="flex gap-2 items-center px-3 w-full">
            <div className={`flex-1 backdrop-blur-sm border flex items-center gap-2 pl-4 pr-2 py-2 rounded-[60px] min-w-0 ${
              'bg-white border-[#d4d4d4]'
            }`}>
              <Icon name="add" size={24} className="shrink-0 text-black" />
              <div className="flex-1 flex items-center min-w-0">
                <span className="flex-1 t-body text-left min-w-0 break-words text-[#111111]">
                  {inputText ? (
                    <TypewriterInputText text={inputText} />
                  ) : (
                    <span className="flex items-center gap-1 text-[#a1a1a1]">
                      <BlinkingCursor />
                      <span>Ask anything</span>
                    </span>
                  )}
                </span>
              </div>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="rounded-full p-2 flex items-center justify-center shrink-0 disabled:opacity-40 bg-[#111111]"
              >
                <Image src={asset("/ai.png")} alt="" width={24} height={24} />
              </button>
            </div>
          </div>

          {/* Dark keyboard — in flow */}
          <DarkKeyboardMock />
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─── iOS Keyboard Mock ─────────────────────────────────────────────── */

function KeyboardMock({ delay = 0, noAnim = false, zIndex = 25 }) {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ]

  const K = ({ label, className = '' }) => (
    <button className={`h-10.75 bg-white rounded-[10px] flex items-center justify-center text-[17px] text-content-primary shadow-[0_1px_0_rgba(0,0,0,0.3)] ${className}`}>
      {label}
    </button>
  )

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ zIndex }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={noAnim ? { duration: 0 } : { type: 'spring', stiffness: 280, damping: 30, delay }}
        className="bg-[#E4E5EA] rounded-t-3xl"
      >
        <div className="flex items-center border-b border-[#C2C4CA] py-2">
          {['"The"', 'the', 'to'].map((s, i) => (
            <div key={s} className={`flex-1 flex items-center justify-center py-1 ${i < 2 ? 'border-r border-[#C2C4CA]' : ''}`}>
              <span className="text-[15px] text-content-primary">{s}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2.75 px-2 py-3">
          <div className="flex justify-center gap-1.5">
            {rows[0].map(k => <K key={k} label={k} className="w-9.25" />)}
          </div>
          <div className="flex justify-center gap-1.5">
            {rows[1].map(k => <K key={k} label={k} className="w-9.25" />)}
          </div>
          <div className="flex justify-center gap-1.5">
            <K label="⇧" className="w-11 bg-[#C9CCCE]!" />
            {rows[2].map(k => <K key={k} label={k} className="w-9.25" />)}
            <K label="⌫" className="w-11 bg-[#C9CCCE]!" />
          </div>
          <div className="flex gap-1.5">
            <K label="123" className="w-11 bg-[#C9CCCE]!" />
            <button className="flex-1 h-10.75 bg-white rounded-[10px] text-[17px] text-content-primary shadow-[0_1px_0_rgba(0,0,0,0.3)]">space</button>
            <button className="w-23 h-10.75 bg-[#007AFF] rounded-[10px] flex items-center justify-center shadow-[0_1px_0_rgba(0,0,0,0.3)]">
              <Icon name="keyboard_return" size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-9 pt-2 pb-8">
          <Icon name="emoji_emotions" size={26} className="text-content-secondary" />
          <Icon name="mic" size={22} className="text-content-secondary" />
        </div>
      </motion.div>
    </div>
  )
}

function DarkKeyboardMock() {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ]
  const DK = ({ label, className = '' }) => (
    <button className={`h-11 rounded-[10px] flex items-center justify-center text-[17px] ${
      'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.25)]'
    } ${className}`}>
      {label}
    </button>
  )
  return (
    <div className="w-full shrink-0">
      <div className="rounded-t-4xl rounded-b-[60px] bg-[#d1d3d9]">
        <div className="flex items-center border-b py-2 border-[#b9bcc3]">
          {['"The"', 'the', 'to'].map((s, i) => (
            <div key={s} className={`flex-1 flex items-center justify-center py-1 ${i < 2 ? ('border-r border-[#b9bcc3]') : ''}`}>
              <span className="text-[15px] text-black">{s}</span>
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
            <DK label="⇧" className="w-11 bg-[#adb1b8]!" />
            {rows[2].map(k => <DK key={k} label={k} className="w-9.25" />)}
            <DK label="⌫" className="w-11 bg-[#adb1b8]!" />
          </div>
          <div className="flex gap-1.5">
            <DK label="123" className="w-11 bg-[#adb1b8]!" />
            <button className={`flex-1 h-11 rounded-[10px] text-[17px] ${
              'bg-white text-black shadow-[0_1px_0_rgba(0,0,0,0.25)]'
            }`}>space</button>
            <button className="w-23 h-11 bg-[#007AFF] rounded-[10px] flex items-center justify-center shadow-[0_1px_0_rgba(0,0,0,0.5)]">
              <Icon name="keyboard_return" size={18} className="text-white" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between px-9 pt-2 pb-8">
          <Icon name="emoji_emotions" size={26} className="text-[#8e9099]" />
          <Icon name="mic" size={22} className="text-[#8e9099]" />
        </div>
      </div>
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function HomeScreen({
  overlayOpen: extOverlay,
  onOverlayClose: extClose,
  balanceHovered = false,
  transactionHovered = false,
  triOpen: extTri,
  onTriClose: extTriClose,
  triHovered = false,
  onTesterNoteChange,
} = {}) {
  const [internalOverlay,     setInternalOverlay]     = useState(false)
  const [showTriScreen,       setShowTriScreen]       = useState(false)
  const [keyboardOpen,        setKeyboardOpen]        = useState(false)
  const [menuOpen,            setMenuOpen]            = useState(false)
  const [showInsightChat,     setShowInsightChat]     = useState(false)
  const [insightAdded,        setInsightAdded]        = useState(false)
  const [insightAnimationKey, setInsightAnimationKey] = useState(0)
  const [balanceSplitActive,  setBalanceSplitActive]  = useState(false)
  const [balanceCornerActive, setBalanceCornerActive] = useState(false)
  const balanceCornerTimerRef = useRef(null)
  const phoneFrameRef = useRef(null)
  const homeScrollRef = useRef(null)
  const transactionCardRef = useRef(null)
  const scrollBeforeMenuRef = useRef(0)

  // When the menu opens, scroll the home content up just enough that the
  // Transaction History card's bottom edge sits 8px above the menu sheet's
  // top edge (the sheet is pinned at top:160 within the phone frame).
  useEffect(() => {
    const scroller = homeScrollRef.current
    if (!scroller) return
    if (menuOpen) {
      scrollBeforeMenuRef.current = scroller.scrollTop
      requestAnimationFrame(() => {
        const cardEl = transactionCardRef.current
        const phoneEl = phoneFrameRef.current
        if (!cardEl || !phoneEl) return
        const cardRect = cardEl.getBoundingClientRect()
        const phoneRect = phoneEl.getBoundingClientRect()
        const menuTopY = phoneRect.top + 160
        const delta = cardRect.bottom - (menuTopY - 8)
        const maxScroll = scroller.scrollHeight - scroller.clientHeight
        const target = Math.min(Math.max(scroller.scrollTop + delta, 0), Math.max(maxScroll, 0))
        scroller.scrollTo({ top: target, behavior: 'smooth' })
      })
    } else {
      scroller.scrollTo({ top: scrollBeforeMenuRef.current, behavior: 'smooth' })
    }
  }, [menuOpen])

  // Suggestion taps / Ask AI send used to open a scripted demo chat (TriChatScreen);
  // that screen has been removed, so these now just close back to the current screen.
  const closeTriFlow = () => {
    setShowTriScreen(false)
    setKeyboardOpen(false)
  }

  const showOverlay     = extOverlay     !== undefined ? extOverlay     : internalOverlay
  const showTri         = extTri         !== undefined ? extTri         : showTriScreen
  const balanceSplitShown = showOverlay || balanceSplitActive
  const balanceCornerShown = showOverlay || balanceCornerActive
  // Seam between the quick-action row and the promo banners (phone coords) —
  // Group 1 slides up by this amount so its bottom edge reaches the screen top,
  // and the Insight overlay's dot expands from this line.
  const GROUP_SPLIT_SEAM_Y = 380
  // Insight overlay panel: top-1 (4px) + its own height, then +8px gap below it —
  // that's where the promos/transaction group settles when split.
  const insightPanelHeight = 788
  const groupTwoSplitY = (4 + insightPanelHeight + 8) - (GROUP_SPLIT_SEAM_Y + 4)
  const openOverlay      = () => {
    if (balanceCornerTimerRef.current) window.clearTimeout(balanceCornerTimerRef.current)
    setBalanceSplitActive(true)
    setBalanceCornerActive(true)
    if (extOverlay === undefined) setInternalOverlay(true)
  }
  const closeOverlay     = () => {
    extClose ? extClose() : setInternalOverlay(false)
    setBalanceSplitActive(false)
    if (balanceCornerTimerRef.current) window.clearTimeout(balanceCornerTimerRef.current)
    balanceCornerTimerRef.current = window.setTimeout(() => {
      setBalanceCornerActive(false)
      balanceCornerTimerRef.current = null
    }, 280)
  }

  useEffect(() => () => {
    if (balanceCornerTimerRef.current) window.clearTimeout(balanceCornerTimerRef.current)
  }, [])

  useEffect(() => {
    if (!onTesterNoteChange) return

    if (showInsightChat) {
      onTesterNoteChange({
        title: 'AI Chat',
        items: ['Tap the arrow button to send the drafted message.', 'Tap View on the AI reply to reopen the insight overlay.', 'Tap Search or Close in the header.'],
      })
      return
    }

    if (showTri) {
      onTesterNoteChange({
        title: 'AI',
        items: ['Tap Freeze my Credit card to open the AI chat.', 'Tap Search or Close in the header.'],
      })
      return
    }

    if (showOverlay) {
      onTesterNoteChange({
        title: 'Balance Insight',
        items: ['Tap Edit to show remove controls.', 'Tap Add insight to open the AI chat.', 'Tap Done or the backdrop to close.'],
      })
      return
    }

    if (menuOpen) {
      onTesterNoteChange({
        title: 'Menu',
        items: ['Tap Home to return to the home screen.', 'Tap the top compressed area or X dots to close.'],
      })
      return
    }

    onTesterNoteChange({
      title: 'Home',
      items: ['Tap Current Balance to open the insight overlay.', 'Tap Search in the top bar.', 'Tap Ask anything in the bottom bar.', 'Tap the four-dot menu button.'],
    })
  }, [menuOpen, onTesterNoteChange, showInsightChat, showOverlay, showTri])

  return (
    <div ref={phoneFrameRef} className="w-[440px] h-[956px] overflow-hidden relative rounded-[64px] bg-white">

      <Image
        src={asset('/tcbm-background.png')}
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Slideable home content — exits left when search opens */}
      <motion.div
        className="absolute inset-0"
        animate={{ x: showTri || showInsightChat ? -448 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      >

      {/* Absolute status bar — always on top */}
      <div className="absolute top-0 left-0 right-0 z-70">
        <StatusBar />
      </div>

      {/* Main layout column */}
      <LayoutGroup id="home-menu">
      <div className="absolute inset-0 flex flex-col overflow-hidden">

        {/* Outer padding container — fills all the way down; the Ask bar floats over it.
            No padding here: it lives on the scroll container below so it scrolls away
            with the content instead of acting as a fixed clip boundary. */}
        <div className="flex-1 flex flex-col min-h-0">

          <motion.div
            ref={homeScrollRef}
            className="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto px-1 pt-1 pb-1 [&::-webkit-scrollbar]:hidden"
          >

          {/* Zero-gap wrapper — keeps Group 1 and Group 2 flush at rest, since
              they're siblings inside the outer gap-1 flex column which would
              otherwise insert a 4px seam between them */}
          <div className="shrink-0 flex flex-col">

          {/* Group 1 — header + balance + quick actions, one seamless component
              glued by this zero-gap flex-col. Moves up and out together when the
              Insight overlay opens. */}
          <motion.div
            initial={false}
            animate={{
              y: balanceSplitShown ? -GROUP_SPLIT_SEAM_Y : 0,
              opacity: menuOpen ? 0.5 : 1,
            }}
            transition={{
              y: { type: 'spring', stiffness: 300, damping: 32 },
              opacity: { duration: 0.18 },
            }}
            className={`shrink-0 flex flex-col rounded-t-[60px] rounded-b-[48px] ${
              balanceSplitShown ? 'overflow-visible' : 'overflow-hidden'
            }`}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 66%)',
            }}
          >
            <div
              className={`border border-b-0 rounded-t-[60px] shrink-0 ${
                'border-[#f0f0f0]'
              }`}
            >
              <TopNav />
            </div>
            <div
              className={`shrink-0 border border-t-0 border-b-0 flex flex-col ${
                'border-[#f0f0f0]'
              }`}
            >
              <BalanceSection onOpenOverlay={openOverlay} />
            </div>
            <motion.div
              initial={false}
              animate={{
                borderBottomLeftRadius: balanceCornerShown ? 60 : 48,
                borderBottomRightRadius: balanceCornerShown ? 60 : 48,
                borderBottomWidth: balanceCornerShown ? 1 : 0,
              }}
              transition={{
                borderBottomLeftRadius: { duration: 0.42, ease: [0.4, 0, 0.2, 1] },
                borderBottomRightRadius: { duration: 0.42, ease: [0.4, 0, 0.2, 1] },
                borderBottomWidth: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
              }}
              className={`shrink-0 border border-t-0 rounded-b-[48px] flex flex-col overflow-hidden ${
                'bg-white border-[#f0f0f0]'
              }`}
            >
              <ActionsRow />
            </motion.div>
          </motion.div>

          {/* Group 2 — promos and transaction history. Moves down together and
              settles 8px below the Insight overlay's bottom edge when it opens. */}
          <motion.div
            initial={false}
            animate={{
              y: balanceSplitShown ? groupTwoSplitY : 0,
              opacity: menuOpen ? 0.5 : 1,
            }}
            transition={{ y: { type: 'spring', stiffness: 300, damping: 32 }, opacity: { duration: 0.18 } }}
            style={{ zIndex: balanceSplitShown || balanceCornerShown ? 20 : 'auto' }}
            className="shrink-0 flex flex-col gap-1 mt-1"
          >
            <PromoBanners />
            <div ref={transactionCardRef}>
              <TransactionSection
                menuOpen={menuOpen}
              />
            </div>
          </motion.div>
          </div>
          <div className="shrink-0" style={{ height: 96 }} />

          {/* Scroll headroom — guarantees there's enough scrollable distance for the
              menu-open effect above to bring the Transaction card up into position,
              even when the card is near the bottom of the content already. Sized
              instantly (no spring) so it's already in the layout before that
              effect measures scrollHeight. */}
          <div className="shrink-0" style={{ height: menuOpen ? 900 : 0 }} />

          </motion.div>

        </div>

        <motion.div
          initial={false}
          animate={{ opacity: menuOpen ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/60 rounded-[64px] pointer-events-none z-30"
        />
      </div>

      {/* Floating Ask bar — overlays the content with a gradient scrim fading up from the
          solid background, per Figma (footer sits at ~53% down its own gradient height).
          solid background, per Figma (footer sits at ~53% down its own gradient height). */}
      <motion.div
        initial={false}
        animate={{ y: balanceSplitShown ? 148 : 0 }}
        transition={{ y: { type: 'spring', stiffness: 300, damping: 32 } }}
        className="absolute inset-x-0 bottom-0 z-50 pt-4 px-8 pb-8 rounded-b-[64px]"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 53%)',
          pointerEvents: balanceSplitShown ? 'none' : 'auto',
        }}
      >
        <div className="pointer-events-auto">
          <BottomBar
            triMode={showTri}
            onOpenTri={() => setShowTriScreen(true)}
            onCloseTri={() => { setShowTriScreen(false); setKeyboardOpen(false) }}
            keyboardOpen={keyboardOpen}
            onOpenKeyboard={() => setKeyboardOpen(true)}
            onCloseKeyboard={() => setKeyboardOpen(false)}
            triHovered={triHovered}
            onSend={closeTriFlow}
            menuOpen={menuOpen}
            onOpenMenu={() => setMenuOpen(true)}
          />
        </div>
      </motion.div>

      {/* Menu tap-to-close area — sits on the compressed card */}
      {menuOpen && (
        <div
          className="absolute inset-x-1 top-1 z-40"
          style={{ height: 148 }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu sheet — the pill morphs into this */}
      <AnimatePresence>
        {menuOpen && (
          <MenuSheet
            onClose={() => setMenuOpen(false)}
            activeNav="home"
          />
        )}
      </AnimatePresence>

      {/* Menu dots — single element that tracks the pill icon slot when closed
          and the sheet footer slot when open. */}
      {!showTri && !showOverlay && !showInsightChat && (
        <motion.button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(v => !v)}
          className="absolute z-90"
          initial={false}
          animate={{ left: menuOpen ? 48 : 64, bottom: menuOpen ? 49 : 52 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <MenuToggleIcon open={menuOpen} />
        </motion.button>
      )}
      </LayoutGroup>

      {/* Keyboard — TRÍ mode before chat opens */}
      <AnimatePresence>
        {showTri && keyboardOpen && (
          <KeyboardMock key="keyboard" zIndex={25} />
        )}
      </AnimatePresence>

      {/* Balance AI overlay */}
      <AnimatePresence>
        {(showOverlay || balanceHovered) && (
          <BalanceOverlay
            onClose={closeOverlay}
            onAddInsight={() => { closeOverlay(); setShowInsightChat(true) }}
            onRemoveInsight={() => setInsightAdded(false)}
            showCard={showOverlay}
            insightAdded={insightAdded}
            insightAnimationKey={insightAnimationKey}
          />
        )}
      </AnimatePresence>

      </motion.div>{/* end slideable home content */}

      {/* TRÍ screen — slides in from the right, same as Search */}
      <AnimatePresence>
        {showTri && (
          <TriScreen
            onClose={() => { setShowTriScreen(false); extTriClose?.() }}
            onOpenChat={closeTriFlow}
          />
        )}
      </AnimatePresence>

      {/* Insight chat screen — "Add new insight" scripted conversation */}
      <AnimatePresence>
        {showInsightChat && (
          <InsightChatScreen
            onClose={() => setShowInsightChat(false)}
            onViewInsight={() => {
              setInsightAdded(true)
              setInsightAnimationKey(k => k + 1)
              setShowInsightChat(false)
              openOverlay()
            }}
          />
        )}
      </AnimatePresence>


      {/* Backdrop for TRÍ hover preview */}
      <AnimatePresence>
        {triHovered && !showTri && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20 pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-[64px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
