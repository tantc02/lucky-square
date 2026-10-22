import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 50
    const gameType = searchParams.get('type')

    const results = await prisma.gameResult.findMany({
      where: gameType ? { gameType } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Fetch game results error:', error)
    return NextResponse.json({ error: 'Không thể tải kết quả' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playerName, gameType, resultLabel, resultMeta = '' } = body

    if (!playerName?.trim() || !gameType || !resultLabel) {
      return NextResponse.json({ error: 'Thiếu thông tin kết quả trò chơi' }, { status: 400 })
    }

    const created = await prisma.gameResult.create({
      data: {
        playerName: playerName.trim(),
        gameType,
        resultLabel: String(resultLabel),
        resultMeta: typeof resultMeta === 'object' ? JSON.stringify(resultMeta) : String(resultMeta),
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Save game result error:', error)
    return NextResponse.json({ error: 'Không thể lưu kết quả' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id === 'all') {
      await prisma.gameResult.deleteMany({})
      return NextResponse.json({ success: true, message: 'Đã xóa toàn bộ lịch sử' })
    }

    if (id) {
      await prisma.gameResult.delete({ where: { id: Number(id) } })
      return NextResponse.json({ success: true, message: 'Đã xóa kết quả' })
    }

    return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
  } catch (error) {
    console.error('Delete result error:', error)
    return NextResponse.json({ error: 'Không thể xóa kết quả' }, { status: 500 })
  }
}
