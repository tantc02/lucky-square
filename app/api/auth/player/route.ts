import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createToken, PLAYER_COOKIE_NAME } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu' }, { status: 400 })
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

    const isValid = await bcrypt.compare(password, config.playerPasswordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Mật khẩu truy cập không đúng' }, { status: 401 })
    }

    const token = await createToken({ role: 'player' }, '7d')
    const cookieStore = cookies()
    cookieStore.set(PLAYER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ success: true, message: 'Đăng nhập thành công' })
  } catch (error) {
    console.error('Player auth error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại' }, { status: 500 })
  }
}
