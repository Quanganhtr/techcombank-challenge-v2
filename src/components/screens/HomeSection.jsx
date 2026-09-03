'use client'

import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValue, LayoutGroup } from 'framer-motion'
import HomeScreen from '@/app/screens/home/page'
import { asset } from '../../lib/asset'

const TITLE_TOP = 128
const TEXT_GAP  = 64
const PHONE_H   = 956
const PHONE_W   = 440

// Y positions in phone-screen coordinates (440×956) where each button centers
// Layout: status(36) + outer-pt(8) + inner-card → header(64) + balance(88) + promo+actions(260) + transaction
const BALANCE_Y     = 168   // center of balance amount row
const TRANSACTION_Y = 515   // center of Transaction History header row
const TRI_Y         = 896   // center of TRÍ input in bottom bar (956 − 32pb − 28half)

// Gap from visual mockup edge (mockup overflows 16px beyond phone screen)
// 24px from mockup = 24 + 16 = 40px from phone screen edge
const BTN_GAP = 40

function ArrowBtn({ direction = 'right', onClick, onMouseEnter, onMouseLeave, style, label }) {
  return (
    <motion.button
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      className="absolute bg-surface rounded-full p-3 shadow-lg flex items-center justify-center z-30"
    >
      <span
        className="material-symbols-outlined leading-none select-none text-content-primary"
        style={{ fontSize: 40 }}
      >
        {direction === 'right' ? 'arrow_right_alt' : 'arrow_left_alt'}
      </span>
    </motion.button>
  )
}

const PANELS = {
  balance: {
    side: 'left',
    title: 'Balance AI layer',
    body: 'Balance không còn chỉ là một con số. AI bổ sung một lớp Intelligence Layer giúp giải thích tình hình tài chính và chuyển dữ liệu thành những hành động có thể thực hiện được.',
  },
  transaction: {
    side: 'right',
    title: 'Transaction AI layer',
    body: 'TRÍ tự động filter giao dịch và tạo group - giúp người dùng hiểu ngay mình đang chi tiêu vào đâu mà không cần lọc thủ công.',
  },
  tri: {
    side: 'right',
    title: 'TRÍ AI screen',
    body: 'TRÍ là nơi người dùng có thể chủ động bắt đầu những cuộc hội thoại tài chính chuyên sâu khi cần phân tích, lập kế hoạch hoặc nhận tư vấn cá nhân hóa.',
  },
}

export function HomeSection() {
  const pinRef   = useRef(null)
  const textRef  = useRef(null)
  const phoneRef = useRef(null)
  const [viewport,   setViewport]   = useState({ width: 1920, height: 1080 })
  const [textHeight, setTextHeight] = useState(250)
  const [active, setActive] = useState(null)       // null | 'balance' | 'transaction' | 'tri'
  const [hoveredBtn, setHoveredBtn] = useState(null) // null | 'balance' | 'transaction' | 'tri'

  useEffect(() => {
    const el = phoneRef.current
    if (!el) return
    const block = (e) => {
      e.preventDefault()
      const px = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
      window.scrollBy(0, px)
    }
    el.addEventListener('wheel', block, { passive: false })
    return () => el.removeEventListener('wheel', block)
  }, [])

  const cursorX = useMotionValue(-200)
  const cursorY = useMotionValue(-200)
  useEffect(() => {
    const move = (e) => { cursorX.set(e.clientX); cursorY.set(e.clientY + 40) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [cursorX, cursorY])

  useLayoutEffect(() => {
    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      if (textRef.current) setTextHeight(textRef.current.getBoundingClientRect().height)
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

  /* ── Intro text: blur + fade out ───────────────────────────────── */
  const textFilter  = useTransform(progress, [0, 0.2], ['blur(0px)', 'blur(16px)'])
  const textOpacity = useTransform(progress, [0, 0.2], [1, 0])

  /* ── Phone: rise then scale down, completes at 0.6 ─────────────── */
  const initialPhoneTop = TITLE_TOP + textHeight + TEXT_GAP
  const finalScale      = (viewport.height - TITLE_TOP * 2) / PHONE_H
  const finalCssTop     = (viewport.height - PHONE_H) / 2

  const rawStop    = Math.max(0.01, Math.min(0.99,
    (initialPhoneTop - TITLE_TOP) / Math.max(initialPhoneTop - finalCssTop, 1)
  ))
  const risingEnd  = rawStop * 0.6
  const scalingEnd = 0.6

  const phoneTop   = useTransform(progress,
    [0, risingEnd, scalingEnd, 1],
    [initialPhoneTop, TITLE_TOP, finalCssTop, finalCssTop]
  )
  const phoneScale = useTransform(progress,
    [0, risingEnd, scalingEnd, 1],
    [1, 1, finalScale, finalScale]
  )

  /* ── Buttons slide up + fade in once phone is settled ──────────── */
  // ArrowBtn height = p-3(12×2) + icon(40) = 64px → half = 32px for centering
  // Combined y: centering (-32) + slide offset (16→0)
  const btnOpacity = useTransform(progress, [0.55, 0.7], [0, 1])
  const btnY       = useTransform(progress, [0.55, 0.7], [-32 + 16, -32])

  const toggle = (key) => setActive(prev => prev === key ? null : key)

  const panelWidth = `calc(50vw - ${PHONE_W / 2}px)`

  return (
    <section ref={pinRef} className="relative h-[250vh]">
      <div className="bg-black sticky top-0 h-screen w-full overflow-hidden">

        {/* Intro text */}
        <motion.div
          ref={textRef}
          style={{ filter: textFilter, opacity: textOpacity }}
          className="absolute inset-x-0 top-32 z-10 flex flex-col gap-4 items-center text-center px-8 md:px-32 pointer-events-none"
        >
          <h2 className="t-display text-content-inverse max-w-3xl w-full">
            What does TRÍ help in home?
          </h2>
          <p className="t-body-lg text-neutral-500 max-w-3xl">
            TRÍ đóng vai trò là một &apos;AI Layer&apos; ẩn sau mọi Data Component trên màn hình Home. Chỉ với một điểm chạm, người dùng ngay lập tức tiếp cận được các phân tích tài chính chuyên sâu.
          </p>
        </motion.div>

        {/* Left text panel */}
        <AnimatePresence>
          {active && PANELS[active]?.side === 'left' && (
            <motion.div
              key={`left-${active}`}
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: panelWidth }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center px-8"
            >
              <div className="w-full max-w-120 flex flex-col gap-3">
                <h1 className="t-h1 text-content-inverse">{PANELS[active].title}</h1>
                <p className="t-body-lg text-neutral-500">{PANELS[active].body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right text panel */}
        <AnimatePresence>
          {active && PANELS[active]?.side === 'right' && (
            <motion.div
              key={`right-${active}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: panelWidth }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center px-8"
            >
              <div className="w-full max-w-120 flex flex-col gap-3">
                <h1 className="t-h1 text-content-inverse">{PANELS[active].title}</h1>
                <p className="t-body-lg text-neutral-500">{PANELS[active].body}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone mockup */}
        <motion.div
          style={{ top: phoneTop }}
          className="absolute left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div style={{ scale: phoneScale }} className="relative" layoutRoot>

            {/* → Balance button — left of phone, aligned with balance amount */}
            <ArrowBtn
              direction="right"
              label="Show Balance AI layer"
              onClick={() => toggle('balance')}
              onMouseEnter={() => setHoveredBtn('balance')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                opacity: btnOpacity,
                top: BALANCE_Y,
                right: `calc(100% + ${BTN_GAP}px)`,
                y: btnY,
              }}
            />

            {/* ← Transaction button — right of phone, aligned with AI insights */}
            <ArrowBtn
              direction="left"
              label="Show Transaction AI layer"
              onClick={() => toggle('transaction')}
              onMouseEnter={() => setHoveredBtn('transaction')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                opacity: btnOpacity,
                top: TRANSACTION_Y,
                left: `calc(100% + ${BTN_GAP}px)`,
                y: btnY,
              }}
            />

            {/* ← TRÍ button — right of phone, aligned with bottom nav TRÍ button */}
            <ArrowBtn
              direction="left"
              label="Show TRÍ screen"
              onClick={() => toggle('tri')}
              onMouseEnter={() => setHoveredBtn('tri')}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                opacity: btnOpacity,
                top: TRI_Y,
                left: `calc(100% + ${BTN_GAP}px)`,
                y: btnY,
              }}
            />

            <Image
              src={asset("/mockup.png")}
              alt=""
              width={PHONE_W + 32}
              height={PHONE_H + 32}
              className="absolute pointer-events-none z-10 max-w-none"
              style={{ top: -16, left: -16 }}
            />
            <div ref={phoneRef} className="overflow-hidden rounded-[44px] relative z-0">
              <LayoutGroup id="home-section-mockup">
              <HomeScreen
                overlayOpen={active === 'balance'}
                onOverlayClose={() => setActive(null)}
                balanceHovered={hoveredBtn === 'balance' && active !== 'balance'}
                transactionOpen={active === 'transaction'}
                onTransactionClose={() => setActive(null)}
                transactionHovered={hoveredBtn === 'transaction' && active !== 'transaction'}
                triOpen={active === 'tri'}
                onTriClose={() => setActive(null)}
                triHovered={hoveredBtn === 'tri' && active !== 'tri'}
              />
              </LayoutGroup>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* Custom cursor pill — appears 16px below pointer on ArrowBtn hover */}
      <AnimatePresence>
        {hoveredBtn && (
          <motion.div
            className="fixed z-9999 pointer-events-none"
            style={{ left: 0, top: 0, x: cursorX, y: cursorY }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className="bg-surface rounded-full px-6 py-4 shadow-xl" style={{ transform: 'translateX(-50%)' }}>
              <span className="t-label-lg text-content-primary whitespace-nowrap">Click me</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
