// app/gigs/create/page.tsx
'use client'
import { ChevronLeft, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { CreateGigForm } from '@/components/gigs/CreateGigForm'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/ui/PageTransition'

export default function CreateGigPage() {
  const router = useRouter()

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Post a Gig</h1>
              <p className="text-sm text-muted-foreground">Takes less than 60 seconds</p>
            </div>
          </div>

          {/* Tips banner */}
          <div className="mb-5 flex items-start gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-100">
            <Lightbulb className="h-5 w-5 text-brand-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-800">Tips for a great gig</p>
              <p className="text-xs text-brand-600 mt-0.5 leading-relaxed">
                Be specific about what you need, set a realistic budget, and add a clear deadline. Gigs with attachments get 2× more responses.
              </p>
            </div>
          </div>

          <CreateGigForm />
        </div>
      </PageTransition>
    </AppShell>
  )
}
