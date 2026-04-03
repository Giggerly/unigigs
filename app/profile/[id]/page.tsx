// app/profile/[id]/page.tsx
import { notFound } from 'next/navigation'
import { profileService } from '@/services/auth/profileService'
import { getSession } from '@/lib/auth/session'
import { ProfilePageClient } from './ProfilePageClient'

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  try {
    const { id } = await params
    const profile = await profileService.getProfile(id)
    return { title: `${profile.name} — CampusGig` }
  } catch {
    return { title: 'Profile' }
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  try {
    const { id } = await params
    const [profile, session] = await Promise.all([
      profileService.getProfile(id),
      getSession(),
    ])

    const isOwnProfile = session?.userId === id

    return (
      <ProfilePageClient
        profile={profile}
        isOwnProfile={isOwnProfile}
        currentUserId={session?.userId}
      />
    )
  } catch {
    notFound()
  }
}
