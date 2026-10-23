import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPlayerSession } from '@/lib/auth'

export async function POST() {
  const session = await getPlayerSession()
  if (!session) {
    return NextResponse.json({ error: 'Vui lòng đăng nhập để lắc xí ngầu' }, { status: 401 })
  }

  try {
    const options = await prisma.diceOption.findMany({
      where: { isActive: true, probability: { gt: 0 } },
      orderBy: { id: 'asc' },
    })
    const totalWeight = options.reduce((sum, option) => sum + option.probability, 0)
    if (totalWeight <= 0) {
      return NextResponse.json({ error: 'Chưa có mặt xí ngầu nào có xác suất hợp lệ' }, { status: 409 })
    }

    let draw = Math.random() * totalWeight
    let selected = options[options.length - 1]
    for (const option of options) {
      draw -= option.probability
      if (draw < 0) {
        selected = option
        break
      }
    }

    return NextResponse.json({
      id: selected.id,
      label: selected.label,
      emoji: selected.emoji,
      description: selected.description,
    })
  } catch (error) {
    console.error('Roll dice error:', error)
    return NextResponse.json({ error: 'Không thể lắc xí ngầu' }, { status: 500 })
  }
}
