'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password) {
      setError('Vui lòng nhập mật khẩu quản trị!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Mật khẩu quản trị không chính xác!')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-md shadow-amber-500/10">
            🔐
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">ĐĂNG NHẬP QUẢN TRỊ</h1>
          <p className="text-xs text-slate-500 mt-1">Cổng cấu hình dành cho Admin duy nhất</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu Quản trị
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu admin..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 text-sm"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Mật khẩu ban đầu: <code className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">admin123</code>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP ADMIN'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium">
            ← Quay lại trang chơi
          </Link>
        </div>
      </div>
    </div>
  )
}
