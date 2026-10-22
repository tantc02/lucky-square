import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập admin' }, { status: 401 })
  }

  const config = await prisma.adminConfig.findFirst({ where: { id: 1 } })
  return NextResponse.json({
    hasAdminPassword: !!config?.adminPasswordHash,
    hasPlayerPassword: !!config?.playerPasswordHash,
    updatedAt: config?.updatedAt,
  })
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const { currentAdminPassword, newAdminPassword, newPlayerPassword } = await request.json()

    const config = await prisma.adminConfig.findFirst({ where: { id: 1 } })
    if (!config) {
      return NextResponse.json({ error: 'Cấu hình chưa được khởi tạo' }, { status: 404 })
    }

    // Verify current admin password
    const isCurrentValid = await bcrypt.compare(currentAdminPassword, config.adminPasswordHash)
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Mật khẩu quản trị hiện tại không đúng' }, { status: 400 })
    }

    const updateData: { adminPasswordHash?: string; playerPasswordHash?: string } = {}

    if (newAdminPassword?.trim()) {
      if (newAdminPassword.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu admin mới phải có ít nhất 6 ký tự' }, { status: 400 })
      }
      updateData.adminPasswordHash = await bcrypt.hash(newAdminPassword.trim(), 10)
    }

    if (newPlayerPassword?.trim()) {
      if (newPlayerPassword.length < 4) {
        return NextResponse.json({ error: 'Mật khẩu người chơi phải có ít nhất 4 ký tự' }, { status: 400 })
      }
      updateData.playerPasswordHash = await bcrypt.hash(newPlayerPassword.trim(), 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Vui lòng cung cấp mật khẩu mới cần thay đổi' }, { status: 400 })
    }

    await prisma.adminConfig.update({
      where: { id: 1 },
      data: updateData,
    })

    return NextResponse.json({ success: true, message: 'Cập nhật mật khẩu thành công!' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Có lỗi xảy ra khi cập nhật' }, { status: 500 })
  }
}
