import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlayerSession } from '@/lib/auth'
import { ensureEggStates } from '@/lib/eggs'

export async function POST(request: Request) {
  if (!(await getPlayerSession())) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập để chơi' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const eggIndex = Number(body.eggIndex)
    const playerName = typeof body.playerName === 'string' ? body.playerName.trim().slice(0, 30) : ''
    if (!Number.isInteger(eggIndex) || eggIndex < 0) {
      return NextResponse.json({ error: 'Vị trí trứng không hợp lệ' }, { status: 400 })
    }
    if (!playerName) return NextResponse.json({ error: 'Thiếu tên người chơi' }, { status: 400 })

    await ensureEggStates()
    const prizes = await prisma.eggPrize.findMany({
      where: { isActive: true, probability: { gt: 0 } },
      orderBy: { id: 'asc' },
    })
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.probability, 0)
    if (totalWeight <= 0) {
      return NextResponse.json({ error: 'Admin chưa cấu hình phần quà có xác suất lớn hơn 0' }, { status: 409 })
    }

    let draw = Math.random() * totalWeight
    let selectedPrize = prizes[prizes.length - 1]
    for (const prize of prizes) {
      draw -= prize.probability
      if (draw < 0) {
        selectedPrize = prize
        break
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const opened = await tx.eggState.updateMany({
        where: { eggIndex, isOpened: false },
        data: {
          isOpened: true,
          prizeName: selectedPrize.prizeName,
          openedBy: playerName,
          openedAt: new Date(),
        },
      })
      if (opened.count === 0) return null

      await tx.gameResult.create({
        data: {
          playerName,
          gameType: 'egg',
          resultLabel: selectedPrize.prizeName,
          resultMeta: JSON.stringify({ eggIndex }),
        },
      })
      return selectedPrize
    })

    if (!result) {
      const egg = await prisma.eggState.findUnique({ where: { eggIndex } })
      return NextResponse.json(
        { error: egg ? 'Trứng này đã được đập rồi' : 'Trứng không tồn tại' },
        { status: egg ? 409 : 404 },
      )
    }

    return NextResponse.json({ eggIndex, prizeName: result.prizeName })
  } catch (error) {
    console.error('Smash egg error:', error)
    return NextResponse.json({ error: 'Không thể đập trứng' }, { status: 500 })
  }
}
