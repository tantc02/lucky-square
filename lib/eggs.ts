import { prisma } from '@/lib/prisma'

export async function ensureEggStates() {
  const config = await prisma.adminConfig.findUnique({ where: { id: 1 } })
  const eggCount = config?.eggCount ?? 0
  const eggs = await prisma.eggState.findMany({ orderBy: { eggIndex: 'asc' } })

  if (eggs.length !== eggCount) {
    await prisma.eggState.deleteMany({})
    if (eggCount > 0) {
      await prisma.eggState.createMany({
        data: Array.from({ length: eggCount }, (_, eggIndex) => ({ eggIndex })),
      })
    }
  }

  return { eggCount }
}
