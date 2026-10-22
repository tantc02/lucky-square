'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface GameResultItem {
  id: number
  playerName: string
  gameType: string
  resultLabel: string
  resultMeta: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [results, setResults] = useState<GameResultItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')

  const fetchResults = async () => {
    setLoading(true)
    try {
      const url = filterType === 'all' ? '/api/results?limit=100' : `/api/results?limit=100&type=${filterType}`
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setResults(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [filterType])

  const handleDelete = async (id: number | 'all') => {
    const confirmMsg = id === 'all' ? 'Bạn có chắc chắn muốn xóa TOÀN BỘ lịch sử?' : 'Xóa kết quả này?'
    if (!window.confirm(confirmMsg)) return

    try {
      const res = await fetch(`/api/results?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchResults()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const totalBoxes = results.filter((r) => r.gameType === 'box').length
  const totalDice = results.filter((r) => r.gameType === 'dice').length
  const uniquePlayers = new Set(results.map((r) => r.playerName)).size

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">TỔNG QUAN & LỊCH SỬ KẾT QUẢ</h1>
            <p className="text-xs text-slate-500 mt-1">Theo dõi thời gian thực kết quả mở ô vuông và lắc xí ngầu của người chơi</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchResults}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 border border-slate-200 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>🔄</span> Làm mới
            </button>
            {results.length > 0 && (
              <button
                onClick={() => handleDelete('all')}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-colors"
              >
                🗑️ Xóa toàn bộ
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
              Tổng lượt chơi
            </span>
            <div className="text-3xl font-extrabold text-slate-900">{results.length}</div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-rose-700 font-bold uppercase tracking-wider block mb-1">
              Lượt mở ô vuông
            </span>
            <div className="text-3xl font-extrabold text-rose-600">{totalBoxes}</div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block mb-1">
              Lượt lắc xí ngầu
            </span>
            <div className="text-3xl font-extrabold text-emerald-600">{totalDice}</div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-cyan-700 font-bold uppercase tracking-wider block mb-1">
              Người chơi tham gia
            </span>
            <div className="text-3xl font-extrabold text-cyan-600">{uniquePlayers}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            Tất cả ({results.length})
          </button>
          <button
            onClick={() => setFilterType('box')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'box'
                ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            🎁 Ô vuông ({totalBoxes})
          </button>
          <button
            onClick={() => setFilterType('dice')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'dice'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
            }`}
          >
            🎲 Xí ngầu ({totalDice})
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm animate-pulse">Đang tải kết quả...</div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">Chưa ghi nhận lượt chơi nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">Người chơi</th>
                    <th className="py-3.5 px-4">Trò chơi</th>
                    <th className="py-3.5 px-4">Kết quả trúng</th>
                    <th className="py-3.5 px-4">Chi tiết</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {r.playerName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] ${
                            r.gameType === 'box'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {r.gameType === 'box' ? '🎁 Ô vuông' : '🎲 Xí ngầu'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {r.resultLabel}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {r.resultMeta || '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Xóa kết quả này"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
