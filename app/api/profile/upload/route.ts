// app/api/profile/upload/route.ts
import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { profileService } from '@/services/auth/profileService'
import { apiError } from '@/lib/utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return apiError('Unauthorized', 401)

    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) return apiError('No image provided')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return apiError('Invalid file type. Use JPEG, PNG, or WebP')
    }

    if (file.size > 5 * 1024 * 1024) {
      return apiError('File too large. Max 5MB')
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(uploadDir, { recursive: true })

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${session.userId}-${Date.now()}.${ext}`
    const filepath = path.join(uploadDir, filename)

    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    const imageUrl = `/uploads/avatars/${filename}`
    const user = await profileService.updateProfileImage(session.userId, imageUrl)

    return Response.json({ user, imageUrl })
  } catch (err: any) {
    return apiError(err.message || 'Upload failed', 500)
  }
}
