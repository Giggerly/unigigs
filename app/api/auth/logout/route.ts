// app/api/auth/logout/route.ts
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('campusgig-token')
  return Response.json({ success: true })
}
