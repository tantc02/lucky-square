'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!playerName.trim()) {
      setError('Vui lòng nhập tên người chơi!')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu truy cập!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Mật khẩu không đúng!')
        setLoading(false)
        return
      }

      localStorage.setItem('lucky_player_name', playerName.trim())
      router.push(`/play?player=${encodeURIComponent(playerName.trim())}`)
    } catch {
      setError('Không thể kết nối tới máy chủ. Vui lòng thử lại!')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-50">
      {/* Decorative ambient background accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Admin quick entry pill */}
      <div className="absolute top-6 right-6">
        <Link
          href="/admin"
          className="text-xs px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-rose-600 transition-all flex items-center gap-1.5 shadow-sm font-medium"
        >
          <span>🔐</span>
          <span>Khu vực Quản trị (Admin)</span>
        </Link>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-amber-400 text-4xl shadow-xl shadow-rose-500/20 mb-4 border border-rose-200">
            🎁
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
            Ô VUÔNG BÍ MẬT
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Thử vận may với Ô vuông bí mật & Lắc xí ngầu tương tác
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">
          <form onSubmit={handleStartGame} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Mật khẩu phòng chơi <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu do ban tổ chức cấp..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Mặc định ban đầu: <code className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">play2024</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Tên người chơi (Player Name) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="VD: Tuấn Anh, Lan Anh, Nguyễn Văn A..."
                maxLength={30}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all text-sm font-medium"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2 font-medium">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/25 active:scale-[0.99] transition-all disabled:opacity-50 text-base flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Đang xác thực...' : 'VÀO BÀN CHƠI'}</span>
              <span className="text-lg">➔</span>
            </button>
          </form>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-2xl block mb-1">🎁</span>
            <span className="text-xs font-bold text-slate-800 block">Ô vuông bí mật</span>
            <span className="text-[11px] text-slate-500">Highlight đỏ chạy ngẫu nhiên</span>
          </div>
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-2xl block mb-1">🎲</span>
            <span className="text-xs font-bold text-slate-800 block">Cục lắc 3D</span>
            <span className="text-[11px] text-slate-500">Âm thanh & kết quả sống động</span>
          </div>
        </div>
      </div>
    </main>
  )
}
