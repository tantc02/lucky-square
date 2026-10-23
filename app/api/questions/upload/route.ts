import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

const allowedContentTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Không có quyền thực hiện' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as HandleUploadBody
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Re-check authorization when issuing a short-lived upload token.
        const currentSession = await getAdminSession()
        if (!currentSession) throw new Error('Không có quyền thực hiện')
        if (!pathname.startsWith('question-images/')) throw new Error('Đường dẫn upload không hợp lệ')

        return {
          allowedContentTypes,
          maximumSizeInBytes: 4 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uploadedBy: 'admin' }),
        }
      },
      onUploadCompleted: async () => {
        // The question record is saved separately after the upload succeeds.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Question image upload error:', error)
    return NextResponse.json({ error: 'Không thể tải ảnh lên' }, { status: 400 })
  }
}
