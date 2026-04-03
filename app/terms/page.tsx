// app/terms/page.tsx
'use client'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'

export default function TermsOfServicePage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 py-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 shadow-soft">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: October 2023</p>
        </div>

        <div className="prose prose-sm prose-slate max-w-none space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
            <p className="leading-relaxed text-foreground/80">
              Welcome to Unigigs! By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. Please read them carefully.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Use of the Platform</h2>
            <p className="leading-relaxed text-foreground/80">
              Unigigs is a marketplace designed for campus students to collaborate on tasks, projects, and gigs. You must be currently enrolled in a college or university to use this platform. Use of real names and verified college contacts is required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. User Responsibilities</h2>
            <p className="leading-relaxed text-foreground/80">
              Users are responsible for the content they post and the agreements they make. Unigigs is not liable for disputes between users but provides a reporting system to help maintain community standards.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Prohibited Activities</h2>
            <p className="leading-relaxed text-foreground/80">
              Spamming, harassment, illegal content, and academic dishonesty (e.g., selling answers for graded exams) are strictly prohibited and will lead to account suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Payments and Fees</h2>
            <p className="leading-relaxed text-foreground/80">
              Unigigs enables negotiation but does not currently handle financial transactions directly. Users should use secure, peer-to-peer methods and verify completion before final payment.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Questions about our terms? Contact us at <a href="mailto:legal@unigigs.com" className="text-brand-600 hover:underline">legal@unigigs.com</a>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
