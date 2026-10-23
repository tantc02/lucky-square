import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, getPlayerSession } from '@/lib/auth'
import { ensureEggStates } from '@/lib/eggs'

export async function GET(request: Request) {
  try {
    const isAdmin = new URL(request.url).searchParams.get('admin') === 'true'
    if (isAdmin) {
      if (!(await getAdminSession())) {
        return NextResponse.json({ error: 'Chưa đăng nhập admin' }, { status: 401 })
      }
    } else if (!(await getPlayerSession())) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập để chơi' }, { status: 401 })
    }

    const { eggCount } = await ensureEggStates()
    const eggs = await prisma.eggState.findMany({ orderBy: { eggIndex: 'asc' } })

    if (isAdmin) {
      const prizes = await prisma.eggPrize.findMany({ orderBy: { id: 'asc' } })
      return NextResponse.json({ eggCount, eggs, prizes })
    }

    return NextResponse.json({
      eggCount,
      eggs: eggs.map((egg) => ({
        eggIndex: egg.eggIndex,
        isOpened: egg.isOpened,
        prizeName: egg.isOpened ? egg.prizeName : null,
      })),
    })
  } catch (error) {
    console.error('Fetch eggs error:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách trứng' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })

  try {
    const body = await request.json()
    const prizeName = typeof body.prizeName === 'string' ? body.prizeName.trim() : ''
    const probability = body.probability === undefined ? 1 : Number(body.probability)
    if (!prizeName) return NextResponse.json({ error: 'Vui lòng nhập tên phần quà' }, { status: 400 })
    if (!Number.isInteger(probability) || probability < 0 || probability > 100) {
      return NextResponse.json({ error: 'Trọng số phải là số nguyên từ 0 đến 100' }, { status: 400 })
    }

    const prize = await prisma.eggPrize.create({
      data: { prizeName, probability, isActive: body.isActive !== false },
    })
    return NextResponse.json(prize, { status: 201 })
  } catch (error) {
    console.error('Create egg prize error:', error)
    return NextResponse.json({ error: 'Không thể thêm phần quà' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const id = Number(body.id)
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID phần quà không hợp lệ' }, { status: 400 })
    const existing = await prisma.eggPrize.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Không tìm thấy phần quà' }, { status: 404 })

    const probability = body.probability === undefined ? existing.probability : Number(body.probability)
    if (!Number.isInteger(probability) || probability < 0 || probability > 100) {
      return NextResponse.json({ error: 'Trọng số phải là số nguyên từ 0 đến 100' }, { status: 400 })
    }
    const prizeName = body.prizeName === undefined ? existing.prizeName : String(body.prizeName).trim()
    if (!prizeName) return NextResponse.json({ error: 'Tên phần quà không được để trống' }, { status: 400 })

    const updated = await prisma.eggPrize.update({
      where: { id },
      data: {
        prizeName,
        probability,
        ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update egg prize error:', error)
    return NextResponse.json({ error: 'Không thể cập nhật phần quà' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
  }

  try {
    const id = Number(new URL(request.url).searchParams.get('id'))
    if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: 'ID phần quà không hợp lệ' }, { status: 400 })
    await prisma.eggPrize.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete egg prize error:', error)
    return NextResponse.json({ error: 'Không thể xóa phần quà' }, { status: 500 })
  }
}
