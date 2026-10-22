import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isRandom = searchParams.get('random') === 'true'
    const isAdminMode = searchParams.get('admin') === 'true'

    if (isAdminMode) {
      const session = await getAdminSession()
      if (!session) {
        return NextResponse.json({ error: 'Chưa đăng nhập admin' }, { status: 401 })
      }
      const questions = await prisma.question.findMany({
        orderBy: { id: 'desc' },
      })
      return NextResponse.json(questions)
    }

    if (isRandom) {
      const activeQuestions = await prisma.question.findMany({
        where: { isActive: true },
      })
      if (activeQuestions.length === 0) {
        return NextResponse.json({ questionText: 'Hãy chia sẻ một kỷ niệm vui nhất của bạn!', answerText: '' })
      }
      const randomIndex = Math.floor(Math.random() * activeQuestions.length)
      return NextResponse.json(activeQuestions[randomIndex])
    }

    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { id: 'desc' },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Fetch questions error:', error)
    return NextResponse.json({ error: 'Không thể tải câu hỏi' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const body = await request.json()
    const { questionText, answerText = '', category = 'general', isActive = true } = body

    if (!questionText?.trim()) {
      return NextResponse.json({ error: 'Nội dung câu hỏi không được để trống' }, { status: 400 })
    }

    const created = await prisma.question.create({
      data: {
        questionText: questionText.trim(),
        answerText: answerText?.trim() || '',
        category: category?.trim() || 'general',
        isActive: Boolean(isActive),
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json({ error: 'Không thể tạo câu hỏi' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
    }

    const body = await request.json()
    const { id, questionText, answerText, category, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
    }

    const updated = await prisma.question.update({
      where: { id: Number(id) },
      data: {
        ...(questionText !== undefined ? { questionText: questionText.trim() } : {}),
        ...(answerText !== undefined ? { answerText: answerText.trim() } : {}),
        ...(category !== undefined ? { category: category.trim() } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update question error:', error)
    return NextResponse.json({ error: 'Không thể cập nhật câu hỏi' }, { status: 500 })
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

    await prisma.question.delete({
      where: { id: Number(id) },
    })

    return NextResponse.json({ success: true, message: 'Đã xóa câu hỏi' })
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json({ error: 'Không thể xóa câu hỏi' }, { status: 500 })
  }
}
