// app/api/upload/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { apiError } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf', 'text/plain',
]

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) return apiError('No files provided')
    if (files.length > 5) return apiError('Max 5 files allowed')

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'attachments')
    await mkdir(uploadDir, { recursive: true })

    const uploaded: string[] = []

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return apiError(`Invalid file type: ${file.type}`)
      }
      if (file.size > 5 * 1024 * 1024) {
        return apiError(`File too large: ${file.name}`)
      }

      const ext = file.name.split('.').pop() || 'bin'
      const filename = `${session.userId}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const filepath = path.join(uploadDir, filename)
      const bytes = await file.arrayBuffer()
      await writeFile(filepath, Buffer.from(bytes))
      uploaded.push(`/uploads/attachments/${filename}`)
    }

    return Response.json({ urls: uploaded })
  } catch (err: any) {
    return apiError(err.message || 'Upload failed', 500)
  }
}
