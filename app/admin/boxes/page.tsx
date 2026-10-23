'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface BoxAdminItem {
  boxIndex: number
  boxType: 'question' | 'unlucky' | 'dice' | 'egg'
  questionId: number | null
  isOpened: boolean
  openedBy: string | null
}

export default function AdminBoxesPage() {
  const [boxes, setBoxes] = useState<BoxAdminItem[]>([])
  const [questionsCount, setQuestionsCount] = useState(0)
  const [unluckyCount, setUnluckyCount] = useState(3)
  const [diceCount, setDiceCount] = useState(0)
  const [eggCount, setEggCount] = useState(0)
  const [totalBoxes, setTotalBoxes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const fetchBoxesData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/boxes?admin=true')
      const data = await res.json()
      if (data) {
        setQuestionsCount(data.questionsCount || 0)
        setUnluckyCount(data.unluckyCount ?? 3)
        setDiceCount(data.diceCount ?? 0)
        setEggCount(data.eggCount ?? 0)
        setTotalBoxes(data.totalBoxes || 0)
        if (Array.isArray(data.boxes)) {
          setBoxes(data.boxes)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBoxesData()
  }, [])

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/boxes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unluckyCount: Number(unluckyCount),
          diceCount: Number(diceCount),
          eggCount: Number(eggCount),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Đã lưu cấu hình và khởi tạo lại các ô thành công!')
        fetchBoxesData()
      } else {
        setMessage(data.error || 'Có lỗi xảy ra!')
      }
    } catch {
      setMessage('Lỗi khi lưu cấu hình!')
    } finally {
      setSaving(false)
    }
  }

  const handleResetBoard = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn XÁO LẠI và ĐẶT LẠI toàn bộ các ô bí mật từ đầu?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/boxes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (res.ok) {
        setMessage('Đã xáo lại và làm mới tất cả các ô!')
        fetchBoxesData()
      }
    } catch {
      setMessage('Lỗi khi xáo lại ô!')
    } finally {
      setSaving(false)
    }
  }

  const openedCount = boxes.filter((b) => b.isOpened).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">QUẢN LÝ Ô VUÔNG BÍ MẬT</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng số ô vuông = Câu hỏi + May mắn lần sau + Lắc xí ngầu + Lượt đập trứng
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Tổng số ô
            </span>
            <div className="text-2xl font-extrabold text-slate-900">{totalBoxes}</div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-rose-700 font-bold uppercase tracking-wider block mb-1">
              Ô câu hỏi
            </span>
            <div className="text-2xl font-extrabold text-rose-600">{questionsCount}</div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider block mb-1">
              May mắn lần sau
            </span>
            <div className="text-2xl font-extrabold text-amber-600">{unluckyCount}</div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block mb-1">
              Lắc xí ngầu 🎲
            </span>
            <div className="text-2xl font-extrabold text-emerald-600">{diceCount}</div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-amber-700 font-bold uppercase tracking-wider block mb-1">
              Ô trúng lượt đập trứng 🥚
            </span>
            <div className="text-2xl font-extrabold text-amber-600">{eggCount}</div>
          </div>
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] text-indigo-700 font-bold uppercase tracking-wider block mb-1">
              Đã mở / Chưa mở
            </span>
            <div className="text-2xl font-extrabold text-indigo-600">
              {openedCount} / {totalBoxes - openedCount}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Configuration Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>⚙️ Cấu Hình Số Lượng Ô</span>
            </h2>

            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số ô "Chúc bạn may mắn lần sau" <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={unluckyCount}
                  onChange={(e) => setUnluckyCount(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Người chơi trúng ô này sẽ không phải trả lời câu hỏi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số ô "Lắc xí ngầu" 🎲 <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={diceCount}
                  onChange={(e) => setDiceCount(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Người chơi trúng ô này sẽ được chuyển ngay sang màn hình tung xí ngầu.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Số ô trúng lượt "Đập trứng" 🥚
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={eggCount}
                  onChange={(e) => setEggCount(Math.max(0, parseInt(e.target.value) || 0))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:border-amber-500 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Số ô này được thêm vào bàn chơi và chuyển người chơi sang màn hình đập trứng.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Số câu hỏi hiện có:</span>
                  <strong className="text-slate-900">{questionsCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số ô may mắn lần sau:</span>
                  <strong className="text-amber-700">{unluckyCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số ô lắc xí ngầu:</span>
                  <strong className="text-emerald-700">{diceCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Số lượt đập trứng:</span>
                  <strong className="text-amber-700">{eggCount}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                  <span>Tổng ô hiển thị cho player:</span>
                  <span className="text-rose-600 text-sm">{questionsCount + Number(unluckyCount) + Number(diceCount) + Number(eggCount)}</span>
                </div>
              </div>

              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-rose-600 via-amber-600 to-emerald-600 hover:opacity-90 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : 'LƯU & CẬP NHẬT BÀN CHƠI'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleResetBoard}
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🔄</span>
                <span>Xáo & Đặt lại tất cả các ô</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Làm mới tất cả các ô ❌ trở về ô ❓ để bắt đầu ván mới
              </p>
            </div>
          </div>

          {/* List of current boxes */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🎁 Danh Sách Trạng Thái Các Ô ({boxes.length})</span>
              </h2>
              <button
                onClick={fetchBoxesData}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Làm mới
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Đang tải danh sách ô...</div>
            ) : boxes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Chưa có ô vuông nào được khởi tạo.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {boxes.map((box) => (
                  <div
                    key={box.boxIndex}
                    className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      box.isOpened
                        ? 'bg-slate-50 border-slate-200 opacity-70'
                        : 'bg-white border-amber-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">
                        #{String(box.boxIndex + 1).padStart(2, '0')}
                      </span>
                      <span className="text-base">
                        {box.isOpened ? '❌' : '❓'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          box.boxType === 'question'
                            ? 'bg-rose-100 text-rose-800'
                            : box.boxType === 'egg'
                            ? 'bg-amber-100 text-amber-800'
                            : box.boxType === 'dice'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {box.boxType === 'question'
                          ? 'Câu hỏi thử thách'
                          : box.boxType === 'egg'
                          ? 'Đập trứng 🥚'
                          : box.boxType === 'dice'
                          ? 'Lắc xí ngầu 🎲'
                          : 'May mắn lần sau'}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate">
                        {box.isOpened ? `Mở bởi: ${box.openedBy || 'Player'}` : 'Chưa mở'}
                      </p>
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
