import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdminMode = searchParams.get('admin') === 'true'

    if (isAdminMode) {
      const session = await getAdminSession()
      if (!session) {
        return NextResponse.json({ error: 'Chưa đăng nhập admin' }, { status: 401 })
      }
      const options = await prisma.diceOption.findMany({
        orderBy: { id: 'asc' },
      })
      return NextResponse.json(options)
    }

    const options = await prisma.diceOption.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    })

    return NextResponse.json(options.map(({ id, label, emoji, description }) => ({ id, label, emoji, description })))
  } catch (error) {
    console.error('Fetch dice options error:', error)
    return NextResponse.json({ error: 'Không thể tải tùy chọn xúc xắc' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const body = await request.json()
    const { label, emoji = '🎲', description = '', isActive = true } = body

    if (!label?.trim()) {
      return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 })
    }

    const created = await prisma.diceOption.create({
      data: {
        label: label.trim(),
        emoji: emoji || '🎲',
        description: description?.trim() || '',
        isActive: Boolean(isActive),
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Create dice option error:', error)
    return NextResponse.json({ error: 'Không thể tạo tùy chọn' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const body = await request.json()
    const { id, label, emoji, description, isActive, probability } = body

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
    }

    const existing = await prisma.diceOption.findUnique({ where: { id: Number(id) } })
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy tùy chọn' }, { status: 404 })

    const nextProbability = probability === undefined ? existing.probability : Number(probability)
    const nextIsActive = isActive === undefined ? existing.isActive : Boolean(isActive)
    if (!Number.isInteger(nextProbability) || nextProbability < 0 || nextProbability > 100) {
      return NextResponse.json({ error: 'Trọng số phải là số nguyên từ 0 đến 100' }, { status: 400 })
    }

    const activeOptions = await prisma.diceOption.findMany({ where: { isActive: true } })
    const activeWeight = activeOptions.reduce((sum, option) => {
      if (option.id === Number(id)) return sum + (nextIsActive ? nextProbability : 0)
      return sum + option.probability
    }, 0) + (!existing.isActive && nextIsActive ? nextProbability : 0)
    if (activeWeight <= 0) {
      return NextResponse.json({ error: 'Cần có ít nhất một mặt đang bật với trọng số lớn hơn 0' }, { status: 400 })
    }

    const updated = await prisma.diceOption.update({
      where: { id: Number(id) },
      data: {
        ...(label !== undefined ? { label: label.trim() } : {}),
        ...(emoji !== undefined ? { emoji } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(probability !== undefined ? { probability: nextProbability } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update dice option error:', error)
    return NextResponse.json({ error: 'Không thể cập nhật tùy chọn' }, { status: 500 })
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

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
    }

    const option = await prisma.diceOption.findUnique({ where: { id: Number(id) } })
    if (!option) return NextResponse.json({ error: 'Không tìm thấy tùy chọn' }, { status: 404 })
    if (option.isActive && option.probability > 0) {
      const remainingWeight = await prisma.diceOption.aggregate({
        where: { isActive: true, id: { not: option.id } },
        _sum: { probability: true },
      })
      if ((remainingWeight._sum.probability ?? 0) <= 0) {
        return NextResponse.json({ error: 'Không thể xóa mặt duy nhất còn xác suất. Hãy tăng trọng số cho mặt khác trước.' }, { status: 400 })
      }
    }

    await prisma.diceOption.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true, message: 'Đã xóa tùy chọn' })
  } catch (error) {
    console.error('Delete dice option error:', error)
    return NextResponse.json({ error: 'Không thể xóa tùy chọn' }, { status: 500 })
  }
}
