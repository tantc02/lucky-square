'use client'

import React, { useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

export default function AdminSettingsPage() {
  const [currentAdminPassword, setCurrentAdminPassword] = useState('')
  const [newPlayerPassword, setNewPlayerPassword] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!currentAdminPassword) {
      setError('Vui lòng nhập mật khẩu quản trị hiện tại để xác thực!')
      return
    }

    if (!newPlayerPassword && !newAdminPassword) {
      setError('Vui lòng điền mật khẩu người chơi mới hoặc mật khẩu quản trị mới!')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentAdminPassword,
          newPlayerPassword: newPlayerPassword.trim() || undefined,
          newAdminPassword: newAdminPassword.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Có lỗi xảy ra!')
      } else {
        setMessage('Cập nhật cài đặt mật khẩu thành công!')
        setCurrentAdminPassword('')
        setNewPlayerPassword('')
        setNewAdminPassword('')
      }
    } catch {
      setError('Lỗi kết nối!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-display">CÀI ĐẶT MẬT KHẨU</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý mật khẩu truy cập của người chơi (Player) và mật khẩu tài khoản quản trị (Admin)
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Player Password Section */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <div>
                  <h3 className="text-sm font-bold text-amber-900">1. Đổi Mật Khẩu Người Chơi (Player Access)</h3>
                  <p className="text-xs text-amber-700/80">
                    Người chơi bắt buộc phải nhập đúng mật khẩu này tại trang chủ mới được tham gia quay
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={newPlayerPassword}
                  onChange={(e) => setNewPlayerPassword(e.target.value)}
                  placeholder="Nhập mật khẩu player mới (VD: event2024, lucky888...)"
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Để trống nếu không muốn đổi mật khẩu người chơi.
                </span>
              </div>
            </div>

            {/* Admin Master Password Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Đổi Mật Khẩu Quản Trị (Admin Password)</h3>
                  <p className="text-xs text-slate-500">
                    Dùng để đăng nhập vào trang quản lý này (chỉ 1 user duy nhất)
                  </p>
                </div>
              </div>

              <div>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Nhập mật khẩu admin mới (tối thiểu 6 ký tự)..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 shadow-sm"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Để trống nếu không muốn đổi mật khẩu admin.
                </span>
              </div>
            </div>

            {/* Authentication verification */}
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
                Xác thực: Mật khẩu Admin HIỆN TẠI <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={currentAdminPassword}
                onChange={(e) => setCurrentAdminPassword(e.target.value)}
                placeholder="Nhập mật khẩu admin hiện tại để xác nhận..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {saving ? 'Đang cập nhật...' : 'LƯU THIẾT LẬP MẬT KHẨU'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
