'use client'

import React, { useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { sound } from '@/lib/audio'

export interface BoxItem {
  boxIndex: number
  isOpened: boolean
  openedBy?: string
  boxType?: string
}

interface MysteryBoxesProps {
  boxes: BoxItem[]
  playerName: string
  onBoxOpened: (result: {
    boxIndex: number
    boxType: 'question' | 'unlucky' | 'dice'
    resultLabel: string
    question?: {
      id: number
      questionText: string
      answerText: string
      category?: string
      imageUrl?: string | null
    } | null
  }) => void
  disabled?: boolean
  isRunning: boolean
  setIsRunning: (running: boolean) => void
}

export default function MysteryBoxes({
  boxes,
  playerName,
  onBoxOpened,
  disabled = false,
  isRunning,
  setIsRunning,
}: MysteryBoxesProps) {
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const unopenedBoxes = boxes.filter((b) => !b.isOpened)
  const allOpened = boxes.length > 0 && unopenedBoxes.length === 0

  const startMysteryRun = () => {
    if (isRunning || disabled || unopenedBoxes.length === 0) return

    setIsRunning(true)

    // Pick target randomly from unopened boxes
    const randomIndex = Math.floor(Math.random() * unopenedBoxes.length)
    const targetBox = unopenedBoxes[randomIndex]

    // Create a sequence of indices to highlight, ending on targetBox.boxIndex
    const totalSteps = 28 + Math.floor(Math.random() * 8)
    const sequence: number[] = []

    for (let i = 0; i < totalSteps - 1; i++) {
      const pick = unopenedBoxes[Math.floor(Math.random() * unopenedBoxes.length)]
      sequence.push(pick.boxIndex)
    }
    sequence.push(targetBox.boxIndex)

    let currentStep = 0

    // Step-by-step runner with decelerating timeout
    const runNextStep = () => {
      const currentBoxIndex = sequence[currentStep]
      setHighlightedIndex(currentBoxIndex)
      sound.playTick()

      currentStep++

      if (currentStep < sequence.length) {
        // Calculate delay: starts fast (45ms), slows down towards the end (up to 480ms)
        const progress = currentStep / sequence.length
        let delay = 45

        if (progress > 0.6) delay = 90
        if (progress > 0.75) delay = 160
        if (progress > 0.88) delay = 280
        if (progress > 0.95) delay = 480

        timerRef.current = setTimeout(runNextStep, delay)
      } else {
        // Final pick landed!
        setTimeout(async () => {
          try {
            const res = await fetch('/api/boxes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                boxIndex: targetBox.boxIndex,
                playerName,
              }),
            })
            const data = await res.json()

            if (res.ok) {
              sound.playWin()
              confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
              })

              onBoxOpened(data)
            }
          } catch (err) {
            console.error('Failed to open box:', err)
          } finally {
            setIsRunning(false)
            setHighlightedIndex(null)
          }
        }, 500)
      }
    }

    runNextStep()
  }

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      {/* Action button */}
      <div className="mb-6 text-center">
        <button
          onClick={startMysteryRun}
          disabled={isRunning || disabled || allOpened}
          className="px-8 py-3.5 bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-red-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 mx-auto"
        >
          <span className="text-2xl">{isRunning ? '⚡' : '🎁'}</span>
          <span>
            {isRunning
              ? 'Đang tìm ô bí mật...'
              : allOpened
              ? 'Đã mở hết tất cả ô!'
              : 'BẮT ĐẦU CHỌN Ô BÍ MẬT'}
          </span>
        </button>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          Còn lại <strong>{unopenedBoxes.length}</strong> / {boxes.length} ô chưa mở
        </p>
      </div>

      {/* Grid of Mystery Boxes */}
      <div className="w-full max-w-4xl grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 sm:gap-4 p-2">
        {boxes.map((box) => {
          const isHighlighted = highlightedIndex === box.boxIndex
          const isOpened = box.isOpened

          return (
            <div
              key={box.boxIndex}
              className={`relative aspect-square rounded-2xl p-3 flex flex-col items-center justify-between border-2 transition-all duration-150 ${
                isHighlighted
                  ? 'bg-red-600 border-red-500 text-white shadow-2xl shadow-red-500/60 scale-105 z-20 ring-4 ring-red-400/80 animate-pulse'
                  : isOpened
                  ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 shadow-none'
                  : 'bg-white border-amber-300/80 hover:border-amber-400 text-slate-800 shadow-md shadow-amber-500/10 hover:shadow-lg'
              }`}
            >
              {/* Box index number pill */}
              <div className="w-full flex items-center justify-between">
                <span
                  className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                    isHighlighted
                      ? 'bg-white/20 text-white'
                      : isOpened
                      ? 'bg-slate-200 text-slate-500'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  #{String(box.boxIndex + 1).padStart(2, '0')}
                </span>
                {isOpened && (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                    Đã mở
                  </span>
                )}
              </div>

              {/* Center Emoji */}
              <div className="text-3xl sm:text-4xl my-auto transition-transform">
                {isOpened ? (
                  <span className="text-red-500 font-black">❌</span>
                ) : (
                  <span className={isHighlighted ? 'animate-bounce text-white' : 'text-amber-500'}>
                    ❓
                  </span>
                )}
              </div>

              {/* Bottom status text */}
              <span
                className={`text-[10px] font-semibold truncate max-w-full text-center ${
                  isHighlighted
                    ? 'text-white'
                    : isOpened
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}
              >
                {isOpened ? (box.openedBy ? box.openedBy : 'Đã mở') : 'Chưa mở'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
