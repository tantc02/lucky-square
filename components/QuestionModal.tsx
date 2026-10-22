'use client'

import React, { useState, useEffect } from 'react'

interface QuestionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
  const [question, setQuestion] = useState<{ questionText: string; answerText?: string; category?: string } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchRandomQuestion = async () => {
    setLoading(true)
    setShowAnswer(false)
    try {
      const res = await fetch('/api/questions?random=true')
      const data = await res.json()
      setQuestion(data)
    } catch {
      setQuestion({ questionText: 'Hãy chia sẻ một điều bạn tự hào nhất về bản thân!' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchRandomQuestion()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-4 border border-amber-200 shadow-sm">
          ❓
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">Thử Thách Trả Lời Câu Hỏi</h3>
        <p className="text-xs text-slate-500 mb-5">Player hãy suy nghĩ và trả lời thật lòng nhé!</p>

        {loading ? (
          <div className="py-8 text-slate-400 text-sm animate-pulse">Đang bốc câu hỏi may rủi...</div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5 text-left shadow-sm">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-1.5">
              Câu hỏi:
            </span>
            <p className="text-base text-slate-900 font-semibold leading-relaxed">
              {question?.questionText || 'Không có câu hỏi nào.'}
            </p>

            {question?.answerText && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                {showAnswer ? (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      Gợi ý / Đáp án:
                    </span>
                    <p className="text-sm text-slate-700 font-medium">{question.answerText}</p>
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
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={fetchRandomQuestion}
            disabled={loading}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            Đổi câu khác 🔄
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all"
          >
            Đã hoàn thành ✅
          </button>
        </div>
      </div>
    </div>
  )
}
