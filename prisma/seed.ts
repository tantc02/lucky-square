import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminHash = await bcrypt.hash('admin123', 10)
  const playerHash = await bcrypt.hash('play2024', 10)

  await prisma.adminConfig.upsert({
    where: { id: 1 },
    update: {
      unluckyCount: 3,
    },
    create: {
      id: 1,
      adminPasswordHash: adminHash,
      playerPasswordHash: playerHash,
      unluckyCount: 3,
    },
  })

  // Ensure default questions exist
  const existingQuestions = await prisma.question.count()
  if (existingQuestions === 0) {
    const questions = [
      { questionText: 'Bạn thích ăn món gì nhất vào ngày mưa?', answerText: 'Người chơi tự do chia sẻ', category: 'fun' },
      { questionText: 'Kỷ niệm đáng nhớ nhất thời học sinh của bạn là gì?', answerText: 'Chia sẻ một kỷ niệm vui hoặc hài hước', category: 'deep' },
      { questionText: 'Nếu trúng số 10 tỷ, việc đầu tiên bạn làm là gì?', answerText: 'Chia sẻ ước mơ thật lòng', category: 'fun' },
      { questionText: 'Hát một đoạn bài hát mà bạn thích nhất ngay bây giờ!', answerText: 'Thực hiện thử thách hát 1 câu điệp khúc', category: 'dare' },
      { questionText: 'Ai là người có ảnh hưởng lớn nhất đến bạn?', answerText: 'Kể về một người đặc biệt', category: 'deep' },
      { questionText: 'Kể một tật xấu dễ thương của bạn mà ít ai biết?', answerText: 'Chia sẻ thật thà', category: 'fun' },
    ]
    for (const q of questions) {
      await prisma.question.create({ data: q })
    }
  }

  // Ensure default dice exist
  const existingDice = await prisma.diceOption.count()
  if (existingDice === 0) {
    const diceOptions = [
      { label: 'Uống 1 ly', emoji: '🍺', description: 'Uống 1 ly ngay cùng mọi người!' },
      { label: 'Uống 2 ly', emoji: '🍻', description: 'Uống 2 ly cạn chén!' },
      { label: 'Chỉ định người khác uống', emoji: '👉', description: 'Chọn 1 người bất kỳ trong bàn uống thay' },
      { label: 'Thách thức hành động', emoji: '😈', description: 'Nhận 1 thử thách hài hước từ nhóm' },
      { label: 'Miễn phí lượt này', emoji: '🎉', description: 'Bạn an toàn qua lượt này!' },
      { label: 'Bốc 1 câu hỏi bí mật', emoji: '❓', description: 'Trả lời 1 câu hỏi ngẫu nhiên' },
    ]
    for (const opt of diceOptions) {
      await prisma.diceOption.create({ data: opt })
    }
  }

  console.log('✅ Seed xong Mystery Box & Dice!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
