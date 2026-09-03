'use client'

import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import { SearchScreen } from '@/app/screens/home/page'
import { asset } from '../../lib/asset'

const PHONE_H = 956
const PHONE_W = 440

const PANELS = [
  {
    title: 'What about Search?',
    body: 'Search không chỉ trả lời câu hỏi “ở đâu?”, mà còn trả lời câu hỏi “muốn làm gì?”. AI sẽ phân tích ý định để điều hướng đến tính năng hoặc khởi tạo cuộc hội thoại phù hợp.',
  },
  {
    title: 'How the Search works',
    body: 'Mỗi kết quả tìm kiếm được chia thành hai nhóm: kết quả điều hướng (Features) và gợi ý AI. Điều này giúp người dùng vừa truy cập nhanh tính năng, vừa khám phá thông tin sâu hơn mà không cần mở chatbot từ đầu.',
  },
]

export function SearchSection() {
  const [baseScale, setBaseScale] = useState(1)
  const [panelIndex, setPanelIndex] = useState(0)
  const pinRef   = useRef(null)
  const phoneRef = useRef(null)

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

  useLayoutEffect(() => {
    const compute = () => setBaseScale((window.innerHeight - 256) / PHONE_H)
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  // panelIndex 1: scale up 1.5×, push down so top ~1/3 is clipped
  const phoneScale = panelIndex === 1 ? baseScale * 1.5 : baseScale
  const phoneY     = panelIndex === 1 ? window.innerHeight * 0.25 : 0

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 300, damping: 40, mass: 0.5 })

  // Drive panel swap from scroll progress
  useEffect(() => {
    return progress.on('change', v => {
      setPanelIndex(v >= 0.5 ? 1 : 0)
    })
  }, [progress])

  return (
    <section ref={pinRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-dvh flex overflow-hidden">

        {/* Left — text panels */}
        <div className="flex w-1/2 shrink-0 items-center justify-center bg-surface px-32 py-32">
          <div className="w-full max-w-160">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={panelIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                <h2 className="t-display text-content-primary">
                  {PANELS[panelIndex].title}
                </h2>
                <p className="t-body-lg text-neutral-500 max-w-3xl">
                  {PANELS[panelIndex].body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right — phone mockup */}
        <div className="flex w-1/2 shrink-0 items-center justify-center bg-surface-sunken overflow-hidden">
          <motion.div
            className="relative"
            animate={{ scale: phoneScale, y: phoneY }}
            transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            style={{ transformOrigin: 'center' }}
          >
            <div
              ref={phoneRef}
              className="overflow-hidden rounded-[44px] relative z-0"
              style={{ width: PHONE_W, height: PHONE_H }}
            >
              <SearchScreen
                autoType={panelIndex === 1}
              />
            </div>

            <img
              src={asset("/mockup.png")}
              alt=""
              className="absolute pointer-events-none z-10 max-w-none"
              style={{ top: -16, left: -16, width: PHONE_W + 32, height: PHONE_H + 32 }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  )
}
