'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { asset } from '../../lib/asset'

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

export function DynamicCreativeSection() {
  return (
    <section className="bg-black min-h-dvh flex flex-col items-center justify-center px-8 py-16 md:px-32 md:py-32 gap-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="flex flex-col items-center gap-4 text-center"
      >
        <h2 className="t-display text-content-inverse max-w-4xl">
          AI-powered<br />Dynamic Creative
        </h2>
        <p className="t-body-lg text-neutral-500 max-w-2xl">
          Thay vì thiết kế một banner cố định cho mỗi chiến dịch, AI sẽ dựa trên các tập asset (title, background, CTA, graphics,...) được tạo trước để hình thành banner phù hợp từ dữ liệu tài chính, mục tiêu và hành vi của từng người dùng.{' '}
          Theo ví dụ bên dưới, chúng ta có tổng cộng 3,125 biến thể banner khác nhau.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={fadeInUp}
        className="w-full max-w-3xl"
      >
        <Image
          src={asset("/banner-multi.png")}
          alt="AI-powered Dynamic Creative — 3,125 banner variants"
          width={768}
          height={554}
          className="w-full h-auto"
        />
      </motion.div>
    </section>
  )
}
