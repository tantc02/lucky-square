'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface DiceOptionItem {
  id: number
  label: string
  emoji: string
  description: string
  isActive: boolean
}

const COMMON_EMOJIS = ['🎲', '🍺', '🍻', '🎉', '🎁', '😈', '❓', '👑', '💥', '🍹', '🎯', '🔥']

export default function AdminDicePage() {
  const [options, setOptions] = useState<DiceOptionItem[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [editId, setEditId] = useState<number | null>(null)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('🎲')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchOptions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dice?admin=true')
      const data = await res.json()
      if (Array.isArray(data)) {
        setOptions(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptions()
  }, [])

  const resetForm = () => {
    setEditId(null)
    setLabel('')
    setEmoji('🎲')
    setDescription('')
    setIsActive(true)
  }

  const handleEdit = (opt: DiceOptionItem) => {
    setEditId(opt.id)
    setLabel(opt.label)
    setEmoji(opt.emoji)
    setDescription(opt.description)
    setIsActive(opt.isActive)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    setSaving(true)
    setMessage('')
    try {
      if (editId) {
        const res = await fetch('/api/dice', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editId,
            label,
            emoji,
            description,
            isActive,
          }),
        })
        if (res.ok) {
          setMessage('Cập nhật tùy chọn xí ngầu thành công!')
          resetForm()
          fetchOptions()
        }
      } else {
        const res = await fetch('/api/dice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            label,
            emoji,
            description,
            isActive,
          }),
        })
        if (res.ok) {
          setMessage('Thêm tùy chọn mới thành công!')
          resetForm()
          fetchOptions()
        }
      }
    } catch {
      setMessage('Lỗi khi lưu dữ liệu!')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tùy chọn xí ngầu này?')) return
    try {
      const res = await fetch(`/api/dice?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchOptions()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">QUẢN LÝ CỤC LẮC XÍ NGẦU</h1>
          <p className="text-xs text-slate-500 mt-1">
            Khai báo các mặt kết quả và hành động khi người chơi lắc xí ngầu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Add / Edit Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span>{editId ? '✏️ Chỉnh Sửa Tùy Chọn' : '➕ Thêm Mặt Xí Ngầu Mới'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên kết quả <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="VD: Uống 1 ly, Thách thức, Miễn phí..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Biểu tượng Emoji
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-300">
                    {emoji}
                  </span>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm"
                  />
                </div>
                {/* Emoji quick picks */}
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-base hover:bg-slate-100 transition-colors ${
                        emoji === em ? 'border-amber-500 bg-amber-50' : ''
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mô tả / Hướng dẫn hành động
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="VD: Người chơi phải thực hiện ngay trước bàn..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="diceActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-0"
                />
                <label htmlFor="diceActive" className="text-xs font-bold text-slate-700">
                  Kích hoạt trong xúc xắc
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
                >
                  {saving ? 'Đang lưu...' : editId ? 'Lưu Thay Đổi' : 'Thêm Vào Xí Ngầu'}
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

          {/* List of Dice Options */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🎲 Danh Sách Các Mặt Xí Ngầu</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {options.length} tùy chọn
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Đang tải danh sách...</div>
            ) : options.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Chưa có tùy chọn nào. Hãy thêm ở bên trái!</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 group hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="text-3xl p-2 rounded-2xl bg-white border border-slate-200 shrink-0 shadow-sm">
                        {opt.emoji}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-slate-900 block truncate">
                          {opt.label}
                        </span>
                        {opt.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {opt.description}
                          </p>
                        )}
                        <span className={`text-[10px] inline-block mt-1.5 font-semibold ${opt.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                          ● {opt.isActive ? 'Đang hoạt động' : 'Tạm tắt'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(opt)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(opt.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
                        title="Xóa tùy chọn"
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
