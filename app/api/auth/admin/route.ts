import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken, getAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, session })
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu quản trị' }, { status: 400 })
    }

    let config = await prisma.adminConfig.findFirst({ where: { id: 1 } })
    if (!config) {
      const defaultAdminHash = await bcrypt.hash('admin123', 10)
      const defaultPlayerHash = await bcrypt.hash('play2024', 10)
      config = await prisma.adminConfig.create({
        data: {
          id: 1,
          adminPasswordHash: defaultAdminHash,
          playerPasswordHash: defaultPlayerHash,
        },
      })
    }

    const isValid = await bcrypt.compare(password, config.adminPasswordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Mật khẩu quản trị không đúng' }, { status: 401 })
    }

    const token = await createToken({ role: 'admin' }, '1d')
    const cookieStore = cookies()
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({ success: true, message: 'Đăng nhập admin thành công' })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
  return NextResponse.json({ success: true, message: 'Đã đăng xuất' })
}
