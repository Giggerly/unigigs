// app/profile/edit/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { EditProfileForm } from '@/components/profile/EditProfileForm'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/PageTransition'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Edit Profile</h1>
              <p className="text-sm text-muted-foreground">Update your public profile</p>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-border bg-white shadow-card p-6">
            {isLoading || !user ? (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <EditProfileForm
                user={user}
                onSuccess={() => router.push(`/profile/${user.id}`)}
              />
            )}
          </div>
        </div>
      </PageTransition>
    </AppShell>
  )
}
