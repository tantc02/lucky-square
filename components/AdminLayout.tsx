'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/admin')
      .then((res) => {
        if (!res.ok) {
          router.push('/admin')
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        router.push('/admin')
      })
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/admin', { method: 'DELETE' })
    router.push('/admin')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Tổng Quan & Kết Quả', icon: '📊' },
    { href: '/admin/questions', label: 'Bộ Câu Hỏi & Trả Lời', icon: '❓' },
    { href: '/admin/boxes', label: 'Ô Vuông Bí Mật', icon: '🎁' },
    { href: '/admin/dice', label: 'Cục Lắc Xí Ngầu', icon: '🎲' },
    { href: '/admin/settings', label: 'Cài Đặt Mật Khẩu', icon: '⚙️' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-amber-600 font-semibold text-sm">
        Đang kiểm tra quyền quản trị...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 sm:p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-xl font-black text-slate-900 shadow-md shadow-amber-500/20 border border-amber-200">
              👑
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-slate-900">ADMIN PANEL</h2>
              <span className="text-[11px] text-amber-700 font-semibold">1 User Quản Trị Duy Nhất</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors font-medium"
          >
            <span>🎮</span>
            <span>Xem Giao Diện Người Chơi</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
          >
            <span>🚪</span>
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-6xl overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
