import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// Helper to initialize or re-sync mystery boxes
async function ensureMysteryBoxes() {
  const config = await prisma.adminConfig.findFirst({ where: { id: 1 } })
  const unluckyCount = config?.unluckyCount ?? 3
  const diceCount = config?.diceCount ?? 0

  const questions = await prisma.question.findMany({
    where: { isActive: true },
    orderBy: { id: 'asc' },
  })

  const totalBoxes = questions.length + unluckyCount + diceCount

  // Check existing boxes
  const existingBoxes = await prisma.mysteryBoxState.findMany({
    orderBy: { boxIndex: 'asc' },
  })

  // If total count changed or empty, initialize boxes
  if (existingBoxes.length !== totalBoxes) {
    await prisma.mysteryBoxState.deleteMany({})

    // Create array of types
    const boxAssignments: { type: 'question' | 'unlucky' | 'dice'; questionId?: number }[] = []

    questions.forEach((q) => {
      boxAssignments.push({ type: 'question', questionId: q.id })
    })

    for (let i = 0; i < unluckyCount; i++) {
      boxAssignments.push({ type: 'unlucky' })
    }

    for (let i = 0; i < diceCount; i++) {
      boxAssignments.push({ type: 'dice' })
    }

    // Shuffle assignments
    for (let i = boxAssignments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[boxAssignments[i], boxAssignments[j]] = [boxAssignments[j], boxAssignments[i]]
    }

    // Save to DB
    for (let i = 0; i < boxAssignments.length; i++) {
      await prisma.mysteryBoxState.create({
        data: {
          boxIndex: i,
          boxType: boxAssignments[i].type,
          questionId: boxAssignments[i].questionId || null,
          isOpened: false,
        },
      })
    }
  }

  return { questionsCount: questions.length, unluckyCount, diceCount, totalBoxes }
}

// GET: Fetch list of boxes for player or admin
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdminMode = searchParams.get('admin') === 'true'

    const { questionsCount, unluckyCount, diceCount, totalBoxes } = await ensureMysteryBoxes()

    const boxes = await prisma.mysteryBoxState.findMany({
      orderBy: { boxIndex: 'asc' },
    })

    // If admin, can return full details
    if (isAdminMode) {
      const session = await getAdminSession()
      if (session) {
        return NextResponse.json({
          questionsCount,
          unluckyCount,
          diceCount,
          totalBoxes,
          boxes,
        })
      }
    }

    // For player: mask the content of unopened boxes so players cannot cheat via DevTools!
    const maskedBoxes = boxes.map((b) => ({
      boxIndex: b.boxIndex,
      isOpened: b.isOpened,
      openedBy: b.openedBy,
      boxType: b.isOpened ? b.boxType : undefined, // Only revealed if opened
    }))

    return NextResponse.json({
      questionsCount,
      unluckyCount,
      diceCount,
      totalBoxes,
      boxes: maskedBoxes,
    })
  } catch (error) {
    console.error('Fetch mystery boxes error:', error)
    return NextResponse.json({ error: 'Không thể tải danh sách ô vuông' }, { status: 500 })
  }
}

// POST: Open a box (when random animation picks an unopened box)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { boxIndex, playerName = 'Người chơi' } = body

    if (boxIndex === undefined || boxIndex === null) {
      return NextResponse.json({ error: 'Thiếu vị trí ô' }, { status: 400 })
    }

    const box = await prisma.mysteryBoxState.findUnique({
      where: { boxIndex: Number(boxIndex) },
    })

    if (!box) {
      return NextResponse.json({ error: 'Ô vuông không tồn tại' }, { status: 404 })
    }

    if (box.isOpened) {
      return NextResponse.json({ error: 'Ô này đã được mở trước đó!' }, { status: 400 })
    }

    // Mark as opened
    await prisma.mysteryBoxState.update({
      where: { boxIndex: Number(boxIndex) },
      data: {
        isOpened: true,
        openedBy: playerName.trim(),
        openedAt: new Date(),
      },
    })

    let resultLabel = ''
    let questionData = null

    if (box.boxType === 'unlucky') {
      resultLabel = 'Chúc bạn may mắn lần sau 🍀'
    } else if (box.boxType === 'dice') {
      resultLabel = 'Trúng ô: Lắc Xí Ngầu! 🎲'
    } else {
      // Find the question
      const question = await prisma.question.findUnique({
        where: { id: box.questionId! },
      })
      if (question) {
        resultLabel = `Câu hỏi: ${question.questionText}`
        questionData = question
      } else {
        resultLabel = 'Thử thách bất ngờ!'
      }
    }

    // Log game result
    await prisma.gameResult.create({
      data: {
        playerName: playerName.trim(),
        gameType: 'box',
        resultLabel,
        resultMeta: JSON.stringify({
          boxIndex: Number(boxIndex),
          boxType: box.boxType,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      boxIndex: Number(boxIndex),
      boxType: box.boxType,
      resultLabel,
      question: questionData,
    })
  } catch (error) {
    console.error('Open box error:', error)
    return NextResponse.json({ error: 'Lỗi khi mở ô vuông' }, { status: 500 })
  }
}

// PUT: Admin updates config (e.g. unluckyCount, diceCount) or resets all boxes
export async function PUT(request: Request) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Không có quyền quản trị' }, { status: 401 })
    }

    const body = await request.json()
    const { unluckyCount, diceCount, action } = body

    if (action === 'reset') {
      // Reset all boxes and re-shuffle
      await prisma.mysteryBoxState.deleteMany({})
      await ensureMysteryBoxes()
      return NextResponse.json({ success: true, message: 'Đã xáo và làm mới tất cả các ô!' })
    }

    if (unluckyCount !== undefined || diceCount !== undefined) {
      const updateData: { unluckyCount?: number; diceCount?: number } = {}
      if (unluckyCount !== undefined) {
        updateData.unluckyCount = Math.max(0, parseInt(unluckyCount) || 0)
      }
      if (diceCount !== undefined) {
        updateData.diceCount = Math.max(0, parseInt(diceCount) || 0)
      }

      await prisma.adminConfig.update({
        where: { id: 1 },
        data: updateData,
      })

      // Recreate boxes with new count
      await prisma.mysteryBoxState.deleteMany({})
      await ensureMysteryBoxes()

      return NextResponse.json({ success: true, message: 'Đã cập nhật cấu hình ô bí mật!' })
    }

    return NextResponse.json({ error: 'Không có thao tác nào' }, { status: 400 })
  } catch (error) {
    console.error('Update boxes config error:', error)
    return NextResponse.json({ error: 'Lỗi cập nhật cấu hình ô' }, { status: 500 })
  }
}
