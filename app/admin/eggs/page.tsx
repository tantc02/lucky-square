'use client'

import React, { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface EggPrizeItem {
  id: number
  prizeName: string
  probability: number
  isActive: boolean
}

export default function AdminEggsPage() {
  const [prizes, setPrizes] = useState<EggPrizeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [prizeName, setPrizeName] = useState('')
  const [probability, setProbability] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchPrizes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/eggs?admin=true')
      const data = await response.json()
      if (response.ok && Array.isArray(data.prizes)) setPrizes(data.prizes)
      else setMessage(data.error || 'Không thể tải danh sách phần quà.')
    } catch {
      setMessage('Không thể kết nối để tải danh sách phần quà.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPrizes() }, [])

  const resetForm = () => {
    setEditingId(null)
    setPrizeName('')
    setProbability(1)
    setIsActive(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!prizeName.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/eggs', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingId ? { id: editingId } : {}),
          prizeName,
          probability,
          isActive,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data.error || 'Không thể lưu phần quà.')
        return
      }
      setMessage(editingId ? 'Đã cập nhật phần quà.' : 'Đã thêm phần quà.')
      resetForm()
      await fetchPrizes()
    } catch {
      setMessage('Không thể kết nối để lưu phần quà.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa phần quà này?')) return
    const response = await fetch(`/api/eggs?id=${id}`, { method: 'DELETE' })
    const data = await response.json()
    if (response.ok) {
      setMessage('Đã xóa phần quà.')
      fetchPrizes()
    } else {
      setMessage(data.error || 'Không thể xóa phần quà.')
    }
  }

  const activeWeight = prizes.reduce((sum, prize) => sum + (prize.isActive ? prize.probability : 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">QUẢN LÝ ĐẬP TRỨNG 🥚</h1>
          <p className="mt-1 text-xs text-slate-500">Thêm phần quà và đặt trọng số để xác định xác suất trúng từng phần quà.</p>
        </header>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">{editingId ? '✏️ Sửa phần quà' : '➕ Thêm phần quà'}</h2>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Tên phần quà
              <input
                value={prizeName}
                onChange={(event) => setPrizeName(event.target.value)}
                maxLength={120}
                required
                placeholder="VD: Quà bí mật, thêm một lượt..."
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-medium normal-case tracking-normal text-slate-900"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Trọng số xác suất (0–100)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={probability}
                onChange={(event) => setProbability(event.target.value === '' ? 0 : Number(event.target.value))}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-bold text-slate-900"
              />
              <span className="mt-1 block text-[11px] font-normal normal-case tracking-normal text-slate-500">
                Xác suất được chuẩn hóa theo tổng trọng số các phần quà đang bật.
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4 rounded" />
              Kích hoạt phần quà
            </label>
            {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">{message}</p>}
            <div className="flex gap-2">
              <button disabled={saving} className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Thêm phần quà'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700">Hủy</button>}
            </div>
          </form>

          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">🎁 Danh sách phần quà ({prizes.length})</h2>
              <button onClick={fetchPrizes} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Làm mới</button>
            </div>
            {loading ? <p className="py-10 text-center text-sm text-slate-400">Đang tải…</p> : prizes.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Chưa có phần quà. Hãy thêm ở bên trái.</p>
            ) : prizes.map((prize) => (
              <article key={prize.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-slate-900">🥚 {prize.prizeName}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {prize.isActive ? 'Đang bật' : 'Đang tắt'} · Trọng số {prize.probability} · Xác suất {prize.isActive && activeWeight > 0 ? `${(prize.probability / activeWeight * 100).toFixed(1)}%` : '—'}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => { setEditingId(prize.id); setPrizeName(prize.prizeName); setProbability(prize.probability); setIsActive(prize.isActive) }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">Sửa</button>
                  <button onClick={() => handleDelete(prize.id)} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">Xóa</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
