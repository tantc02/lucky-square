'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import MysteryBoxes, { BoxItem } from '@/components/MysteryBoxes'
import DiceRoller, { DiceOptionItem } from '@/components/DiceRoller'

function PlayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [playerName, setPlayerName] = useState<string>('')
  const [mode, setMode] = useState<'boxes' | 'dice'>('boxes')

  // Mystery Box state
  const [boxes, setBoxes] = useState<BoxItem[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Dice state
  const [diceOptions, setDiceOptions] = useState<DiceOptionItem[]>([])
  const [isRolling, setIsRolling] = useState(false)

  // Result popup state
  const [lastResult, setLastResult] = useState<{
    gameType: 'box' | 'dice'
    boxType?: 'question' | 'unlucky' | 'dice'
    label: string
    question?: {
      id: number
      questionText: string
      answerText: string
      category?: string
      imageUrl?: string | null
    } | null
    meta?: string
  } | null>(null)
  const [showResultModal, setShowResultModal] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)

  // History list
  const [myHistory, setMyHistory] = useState<
    { id: number; gameType: string; resultLabel: string; createdAt: string }[]
  >([])

  // Load player name & data
  const fetchBoxes = async () => {
    try {
      const res = await fetch('/api/boxes')
      const data = await res.json()
      if (data && Array.isArray(data.boxes)) {
        setBoxes(data.boxes)
      }
    } catch (err) {
      console.error('Error fetching boxes:', err)
    }
  }

  const fetchRecentHistory = async () => {
    try {
      const res = await fetch('/api/results?limit=10')
      const data = await res.json()
      if (Array.isArray(data)) {
        setMyHistory(data)
      }
    } catch {
      // Ignored
    }
  }

  useEffect(() => {
    const queryName = searchParams.get('player')
    const localName = localStorage.getItem('lucky_player_name')
    const finalName = queryName || localName

    if (!finalName) {
      router.push('/')
      return
    }
    setPlayerName(finalName)

    fetchBoxes()

    // Fetch dice options
    fetch('/api/dice')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDiceOptions(data)
        }
      })
      .catch((err) => console.error('Error fetching dice:', err))

    fetchRecentHistory()
  }, [router, searchParams])

  // Handle Box Opened callback
  const handleBoxOpened = (res: {
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
  }) => {
    setShowAnswer(false)
    setLastResult({
      gameType: 'box',
      boxType: res.boxType,
      label: res.resultLabel,
      question: res.question,
    })
    setShowResultModal(true)

    // Nếu rơi vào ô lắc xí ngầu thì mở qua tung xí ngầu luôn!
    if (res.boxType === 'dice') {
      setMode('dice')
    }

    // Refresh boxes & history
    fetchBoxes()
    fetchRecentHistory()
  }

  // Handle Dice Roll End
  const handleDiceEnd = async (selected: DiceOptionItem) => {
    setShowAnswer(false)
    const label = `${selected.emoji} ${selected.label}`
    setLastResult({
      gameType: 'dice',
      label,
      meta: selected.description,
    })
    setShowResultModal(true)

    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          gameType: 'dice',
          resultLabel: label,
          resultMeta: selected.description,
        }),
      })
      fetchRecentHistory()
    } catch (err) {
      console.error('Failed to save dice result:', err)
    }
  }

  const requestDiceOutcome = async (): Promise<DiceOptionItem> => {
    const response = await fetch('/api/dice/roll', { method: 'POST' })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Không thể lắc xí ngầu. Vui lòng thử lại.')
    }
    return data as DiceOptionItem
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎁</span>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 bg-clip-text text-transparent">
                MYSTERY ARENA
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Player badge */}
            <div className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-300 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500">Player:</span>
              <span className="font-bold text-slate-800 max-w-[120px] truncate">{playerName || 'Ẩn danh'}</span>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('lucky_player_name')
                router.push('/')
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors font-medium"
              title="Đổi người chơi"
            >
              Thoát
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Play Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 max-w-md mx-auto shadow-sm">
            <button
              onClick={() => !isRunning && !isRolling && setMode('boxes')}
              disabled={isRunning || isRolling}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'boxes'
                  ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">🎁</span>
              <span>Ô VUÔNG BÍ MẬT</span>
            </button>
            <button
              onClick={() => !isRunning && !isRolling && setMode('dice')}
              disabled={isRunning || isRolling}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'dice'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">🎲</span>
              <span>LẮC XÍ NGẦU</span>
            </button>
          </div>

          {/* Interactive Game Arena */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative shadow-xl shadow-slate-200/50 min-h-[500px] flex items-center justify-center">
            {mode === 'boxes' ? (
              <MysteryBoxes
                boxes={boxes}
                playerName={playerName}
                onBoxOpened={handleBoxOpened}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
              />
            ) : (
              <DiceRoller
                options={diceOptions}
                onRollRequest={requestDiceOutcome}
                onRollEnd={handleDiceEnd}
                isRolling={isRolling}
                setIsRolling={setIsRolling}
              />
            )}
          </div>
        </div>

        {/* Sidebar Column: Rules & History */}
        <div className="space-y-6">
          {/* Box Game Guide */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-2xl">💡</span>
              <h3 className="text-base font-bold text-rose-950">Quy Tắc Ô Bí Mật</h3>
            </div>
            <ul className="text-xs text-rose-900/80 space-y-1.5 list-disc list-inside">
              <li>Mỗi ô <strong>❓</strong> chứa câu hỏi bí mật, ô <em>"May mắn lần sau"</em>, hoặc ô <em>"Lắc xí ngầu 🎲"</em>.</li>
              <li>Khi nhấn nút, vệt đỏ chạy lướt ngẫu nhiên và chốt lại ô trúng thưởng.</li>
              <li>Nếu trúng ô <strong>🎲 Lắc xí ngầu</strong>, màn hình sẽ mở qua tung xí ngầu luôn!</li>
              <li>Ô đã mở hiển thị <strong>❌</strong> và không được chọn lại.</li>
            </ul>
          </div>

          {/* Game Results History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>📜</span>
                <span>Lịch Sử Lượt Chơi</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">Tự động lưu</span>
            </div>

            {myHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Chưa có kết quả nào. Hãy bắt đầu chọn ô để ghi danh!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {myHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">
                        {item.gameType === 'box' ? '🎁' : '🎲'}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block truncate">
                          {item.resultLabel}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Đã lưu
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Result Celebration Modal */}
      {showResultModal && lastResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border-2 border-amber-400 rounded-3xl p-6 text-center shadow-2xl relative animate-bounce-in">
            {lastResult.boxType === 'dice' ? (
              // Dice outcome from box
              <div>
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-emerald-200 animate-bounce">
                  🎲
                </div>
                <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                  Ô Bí Mật May Mắn
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 mb-2 font-display">
                  TRÚNG Ô LẮC XÍ NGẦU! 🎲
                </h3>
                <p className="text-sm text-slate-600 mb-6 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  Chúc mừng bạn đã mở trúng ô đặc biệt! Hệ thống đã chuyển sang bàn Tung Xí Ngầu để bạn lắc ngay bây giờ.
                </p>

                <p className="text-[11px] text-emerald-700 mb-5 flex items-center justify-center gap-1 font-medium">
                  <span>✓</span> Kết quả mở ô đã được lưu cho player <strong>{playerName}</strong>
                </p>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>🎲</span>
                  <span>TUNG XÍ NGẦU NGAY</span>
                </button>
              </div>
            ) : lastResult.boxType === 'unlucky' ? (
              // Unlucky outcome
              <div>
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-amber-200">
                  🍀
                </div>
                <span className="text-xs uppercase font-extrabold text-amber-700 tracking-wider">
                  Kết quả mở ô
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 mb-2 font-display">
                  Chúc bạn may mắn lần sau!
                </h3>
                <p className="text-sm text-slate-600 mb-6 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-200">
                  Bạn không phải trả lời câu hỏi nào ở lượt này. Chúc bạn may mắn ở các lượt sau! 🌟
                </p>
                <p className="text-[11px] text-emerald-700 mb-5 flex items-center justify-center gap-1 font-medium">
                  <span>✓</span> Kết quả đã được ghi vào hệ thống cho player <strong>{playerName}</strong>
                </p>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-rose-600 hover:opacity-90 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all"
                >
                  TIẾP TỤC CHƠI
                </button>
              </div>
            ) : lastResult.question ? (
              // Question outcome
              <div>
                <div className="w-16 h-16 rounded-3xl bg-rose-100 text-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-rose-200">
                  ❓
                </div>
                <span className="text-xs uppercase font-extrabold text-rose-600 tracking-wider">
                  Bạn đã bốc trúng câu hỏi thử thách
                </span>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-4 text-left">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                    Nội dung câu hỏi:
                  </span>
                  <p className="text-base font-bold text-slate-900 leading-snug">
                    {lastResult.question.questionText}
                  </p>
                  {lastResult.question.imageUrl && (
                    <img src={lastResult.question.imageUrl} alt="Ảnh minh họa câu hỏi" className="mt-3 max-h-64 w-full rounded-xl border border-slate-200 object-contain" />
                  )}

                  {lastResult.question.answerText && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      {showAnswer ? (
                        <div>
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-0.5">
                            Gợi ý / Đáp án:
                          </span>
                          <p className="text-sm text-slate-700 font-medium">
                            {lastResult.question.answerText}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="text-xs text-amber-700 hover:text-amber-800 underline font-semibold"
                        >
                          Xem gợi ý / đáp án
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-emerald-700 mb-5 flex items-center justify-center gap-1 font-medium">
                  <span>✓</span> Kết quả đã được ghi vào hệ thống cho player <strong>{playerName}</strong>
                </p>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-rose-500/25 transition-all"
                >
                  TIẾP TỤC CHƠI
                </button>
              </div>
            ) : (
              // Dice roll outcome from Dice tab
              <div>
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-3xl flex items-center justify-center mx-auto mb-3 shadow-md border border-emerald-200">
                  🎲
                </div>
                <span className="text-xs uppercase font-extrabold text-emerald-700 tracking-wider">
                  Kết quả lắc xí ngầu
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2 mb-2 font-display">
                  {lastResult.label}
                </h3>
                {lastResult.meta && (
                  <p className="text-xs text-slate-600 mb-4 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    {lastResult.meta}
                  </p>
                )}

                <p className="text-[11px] text-emerald-700 mb-5 flex items-center justify-center gap-1 font-medium">
                  <span>✓</span> Kết quả đã được ghi vào hệ thống cho player <strong>{playerName}</strong>
                </p>

                <button
                  onClick={() => setShowResultModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                >
                  TIẾP TỤC CHƠI
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-amber-600 font-bold">Đang tải phòng chơi...</div>}>
      <PlayContent />
    </Suspense>
  )
}
