'use client'

import React, { useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { sound } from '@/lib/audio'

export interface DiceOptionItem {
  id: number
  label: string
  emoji: string
  description: string
}

interface DiceRollerProps {
  options: DiceOptionItem[]
  onRollRequest: () => Promise<DiceOptionItem>
  onRollEnd: (result: DiceOptionItem) => void
  disabled?: boolean
  isRolling: boolean
  setIsRolling: (rolling: boolean) => void
}

export default function DiceRoller({
  options,
  onRollRequest,
  onRollEnd,
  disabled = false,
  isRolling,
  setIsRolling,
}: DiceRollerProps) {
  const [rotation, setRotation] = useState({ x: 15, y: -25 })
  const [selectedOption, setSelectedOption] = useState<DiceOptionItem | null>(null)
  const [rollError, setRollError] = useState('')
  const rattleIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Dice face rotation mapping for 6 standard faces
  const faceRotations = [
    { x: 0, y: 0 },       // Face 1 (Front)
    { x: 0, y: -90 },     // Face 2 (Right)
    { x: 0, y: -180 },    // Face 3 (Back)
    { x: 0, y: 90 },      // Face 4 (Left)
    { x: -90, y: 0 },     // Face 5 (Top)
    { x: 90, y: 0 },      // Face 6 (Bottom)
  ]

  const rollDice = async () => {
    if (isRolling || disabled || options.length === 0) return

    setIsRolling(true)
    setSelectedOption(null)
    setRollError('')

    // Play rattle sound every 80ms for 1.6s
    rattleIntervalRef.current = setInterval(() => {
      sound.playDiceRattle()
    }, 85)

    let winningOption: DiceOptionItem
    try {
      winningOption = await onRollRequest()
    } catch (error) {
      if (rattleIntervalRef.current) clearInterval(rattleIntervalRef.current)
      setIsRolling(false)
      setRollError(error instanceof Error ? error.message : 'Không thể lắc xí ngầu. Vui lòng thử lại.')
      return
    }

    const randomIndex = options.findIndex((option) => option.id === winningOption.id)
    if (randomIndex < 0) {
      if (rattleIntervalRef.current) clearInterval(rattleIntervalRef.current)
      setIsRolling(false)
      setRollError('Danh sách mặt xí ngầu đã thay đổi. Hãy tải lại trang.')
      return
    }

    // Choose target face mapping
    const faceIndex = randomIndex % faceRotations.length
    const baseTarget = faceRotations[faceIndex]

    // Add multiple full 360-degree rotations for high-speed tumbling effect
    const randomExtraTurnsX = (3 + Math.floor(Math.random() * 2)) * 360
    const randomExtraTurnsY = (3 + Math.floor(Math.random() * 2)) * 360

    setRotation({
      x: baseTarget.x + randomExtraTurnsX,
      y: baseTarget.y + randomExtraTurnsY,
    })

    setTimeout(() => {
      if (rattleIntervalRef.current) clearInterval(rattleIntervalRef.current)
      setIsRolling(false)
      setSelectedOption(winningOption)
      sound.playWin()

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
      })

      onRollEnd(winningOption)
    }, 1500)
  }

  // Display labels on the 6 cube faces
  const getFaceItem = (index: number) => {
    if (options.length === 0) return { emoji: '🎲', label: '---' }
    return options[index % options.length]
  }

  return (
    <div className="flex flex-col items-center justify-center select-none py-6">
      {/* 3D Perspective Scene */}
      <div
        className="w-56 h-56 flex items-center justify-center cursor-pointer"
        style={{ perspective: '800px' }}
        onClick={rollDice}
      >
        <div
          className="dice-cube"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {/* Face 1 */}
          <div className="dice-face face-1 flex-col p-2 text-center border-amber-400">
            <span className="text-3xl">{getFaceItem(0).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(0).label}</span>
          </div>

          {/* Face 2 */}
          <div className="dice-face face-2 flex-col p-2 text-center border-emerald-400">
            <span className="text-3xl">{getFaceItem(1).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(1).label}</span>
          </div>

          {/* Face 3 */}
          <div className="dice-face face-3 flex-col p-2 text-center border-blue-400">
            <span className="text-3xl">{getFaceItem(2).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(2).label}</span>
          </div>

          {/* Face 4 */}
          <div className="dice-face face-4 flex-col p-2 text-center border-purple-400">
            <span className="text-3xl">{getFaceItem(3).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(3).label}</span>
          </div>

          {/* Face 5 */}
          <div className="dice-face face-5 flex-col p-2 text-center border-rose-400">
            <span className="text-3xl">{getFaceItem(4).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(4).label}</span>
          </div>

          {/* Face 6 */}
          <div className="dice-face face-6 flex-col p-2 text-center border-cyan-400">
            <span className="text-3xl">{getFaceItem(5).emoji}</span>
            <span className="text-xs font-bold text-slate-800 line-clamp-2 mt-1">{getFaceItem(5).label}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 text-center">
        <button
          onClick={rollDice}
          disabled={isRolling || disabled || options.length === 0}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          <span className="text-2xl animate-spin-slow">🎲</span>
          <span>{isRolling ? 'Đang lắc xí ngầu...' : 'LẮC XÍ NGẦU NGAY'}</span>
        </button>
        <p className="text-xs text-slate-500 mt-2 font-medium">Bấm nút hoặc click trực tiếp vào cục xí ngầu</p>
        {rollError && <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">{rollError}</p>}
      </div>

      {/* Instant Result Card */}
      {selectedOption && !isRolling && (
        <div className="mt-6 p-4 rounded-xl bg-white border border-emerald-300 text-center max-w-sm animate-slide-up shadow-xl shadow-emerald-100/60">
          <div className="text-4xl mb-1">{selectedOption.emoji}</div>
          <h4 className="text-lg font-bold text-emerald-600">{selectedOption.label}</h4>
          {selectedOption.description && (
            <p className="text-sm text-slate-600 mt-1">{selectedOption.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
