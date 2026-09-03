'use client'

import Image from 'next/image'
import { useState } from 'react'
import HomeScreen from '@/app/screens/home/page'
import { asset } from '../lib/asset'

const PHONE_W = 440
const PHONE_H = 956

function TesterNote({ note }) {
  return (
    <aside className="fixed left-[calc(50%+260px)] top-1/2 z-20 w-[280px] -translate-y-1/2 rounded-[24px] border border-white/10 bg-white/8 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-[12px] font-medium uppercase leading-4 tracking-[0.12em] text-white/45">Tester note</p>
      <h2 className="mt-2 text-[20px] font-semibold leading-7">{note.title}</h2>
      <div className="mt-4 h-px w-full bg-white/10" />
      <ul className="mt-4 flex flex-col gap-3">
        {note.items.map((item) => (
          <li key={item} className="flex gap-3 text-[14px] leading-5 text-white/75">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#ff343d]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default function Home() {
  const [testerNote, setTesterNote] = useState({
    title: 'Home',
    items: ['Tap Current Balance to open the insight overlay.', 'Tap Search in the top bar.', 'Tap Ask anything... in the bottom bar.', 'Tap the four-dot menu button.'],
  })

  return (
    <main className="bg-black h-dvh w-full flex items-center justify-center overflow-hidden">
      <TesterNote note={testerNote} />
      <div className="relative shrink-0" style={{ width: PHONE_W, height: PHONE_H }}>
        {/* Phone frame — overflows 16px beyond the screen on each side */}
        <Image
          src={asset("/mockup.png")}
          alt=""
          width={PHONE_W + 32}
          height={PHONE_H + 32}
          className="absolute pointer-events-none z-10 max-w-none"
          style={{ top: -16, left: -16 }}
          priority
        />
        <div className="overflow-hidden rounded-[64px] relative z-0">
          <HomeScreen onTesterNoteChange={setTesterNote} />
        </div>
      </div>
    </main>
  )
}
