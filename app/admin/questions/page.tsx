'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface QuestionItem {
  id: number
  questionText: string
  answerText: string
  isActive: boolean
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [editId, setEditId] = useState<number | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [answerText, setAnswerText] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/questions?admin=true')
      const data = await res.json()
      if (Array.isArray(data)) {
        setQuestions(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setQuestionText('')
    setAnswerText('')
    setIsActive(true)
  }

  const handleEdit = (q: QuestionItem) => {
    setEditId(q.id)
    setQuestionText(q.questionText)
    setAnswerText(q.answerText)
    setIsActive(q.isActive)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionText.trim()) return

    setSaving(true)
    setMessage('')
    try {
      if (editId) {
        const res = await fetch('/api/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            questionText,
            answerText,
            isActive,
          }),
        })
        if (res.ok) {
          setMessage('Cập nhật câu hỏi thành công!')
          resetForm()
          fetchQuestions()
        }
      } else {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText,
            answerText,
            isActive,
          }),
        })
        if (res.ok) {
          setMessage('Thêm câu hỏi mới thành công!')
          resetForm()
          fetchQuestions()
        }
      }
    } catch {
      setMessage('Lỗi khi lưu câu hỏi!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchQuestions()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">KHAI BÁO BỘ CÂU HỎI & TRẢ LỜI</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý ngân hàng câu hỏi thử thách ngẫu nhiên khi người chơi quay hoặc lắc trúng ô câu hỏi
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Add / Edit Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>{editId ? '✏️ Chỉnh Sửa Câu Hỏi' : '➕ Thêm Câu Hỏi Mới'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội dung câu hỏi <span className="text-amber-500">*</span>
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="VD: Điều điên rồ nhất bạn từng làm là gì?..."
                  required
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gợi ý đáp án / Câu trả lời chuẩn (nếu có)
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="VD: Tùy người chơi chia sẻ, hoặc đáp án câu đố vui..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="qActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-0"
                />
                <label htmlFor="qActive" className="text-xs font-bold text-slate-700">
                  Kích hoạt trong bộ câu hỏi
                </label>
              </div>

              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                  {message}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-indigo-500/20"
                >
                  {saving ? 'Đang lưu...' : editId ? 'Lưu Thay Đổi' : 'Thêm Vào Bộ Câu Hỏi'}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold border border-slate-200"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Questions */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>❓ Danh Sách Câu Hỏi ({questions.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Đang tải danh sách...</div>
            ) : questions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Chưa có câu hỏi nào. Hãy thêm ở bên trái!</div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 group hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-slate-900 block">
                          {q.questionText}
                        </span>
                        {q.answerText && (
                          <p className="text-xs text-emerald-700 font-medium mt-1">
                            <strong>Đáp án:</strong> {q.answerText}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                          <span className={q.isActive ? 'text-emerald-700 font-semibold' : 'text-slate-400'}>
                            {q.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(q)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Xóa câu hỏi"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
