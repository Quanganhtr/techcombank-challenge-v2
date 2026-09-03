'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { asset } from '../../lib/asset'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function IntroduceTri() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 56])

  return (
    <section ref={sectionRef} className="bg-surface-raised flex flex-col items-center justify-between gap-16 md:gap-32 pt-16 md:pt-32 px-8 md:px-16 pb-0 min-h-dvh">

      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="flex flex-col items-center gap-4 text-center max-w-(--spacing-max-width) w-full"
      >
        <h2 className="t-display text-content-primary w-full">Introduce TRÍ</h2>
        <p className="t-body-lg text-neutral-500 max-w-[768px]">
          TRÍ (Techcombank Reliable Intelligence) được tích hợp trực tiếp trên app, có năng lực biến dữ liệu thô thành những thông tin dễ hiểu và được cá nhân hoá 1:1. Dựa trên insight này, TRÍ đưa ra các hành động, gợi ý cụ thể để người dùng tối ưu hóa dòng tiền và gia tăng tài sản theo đúng khẩu vị đầu tư của họ.
        </p>
      </motion.div>

      {/* Phone image — overflow-hidden clips bottom, showing top portion of the phone */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ y: imageY }}
        className="relative overflow-hidden w-full max-w-[725px] aspect-[725/720]"
      >
        <Image
          src={asset("/introduce-tri.png")}
          alt="TRÍ — Techcombank AI companion on iPhone"
          fill
          sizes="(max-width: 768px) 100vw, 725px"
          className="object-cover object-top"
          unoptimized
        />
      </motion.div>

    </section>
  )
}
