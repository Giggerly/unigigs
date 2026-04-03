// app/privacy/page.tsx
'use client'
import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'

export default function PrivacyPolicyPage() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8 py-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group">
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-6 shadow-soft">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: October 2023</p>
        </div>

        <div className="prose prose-sm prose-slate max-w-none space-y-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p className="leading-relaxed text-foreground/80">
              We collect information you provide to us, such as your name, phone number, college details, and profile information. This is used to build trust and prevent spam on the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. How We Use Information</h2>
            <p className="leading-relaxed text-foreground/80">
              Your profile information (name, college, rating) is visible to other users. Contact details like phone number and email are used for login and optional features like WhatsApp connectivity. We do NOT sell your data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Security</h2>
            <p className="leading-relaxed text-foreground/80">
              We take security seriously and use industry-standard encryption for your data. However, no platform is 100% secure, and you should use strong, unique passwords.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Cookies</h2>
            <p className="leading-relaxed text-foreground/80">
              We use session cookies to keep you logged in and improve your browsing experience.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Your Choices</h2>
            <p className="leading-relaxed text-foreground/80">
              You can update your profile or delete your account at any time by contacting us.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Have privacy concerns? Contact us at <a href="mailto:privacy@unigigs.com" className="text-brand-600 hover:underline">privacy@unigigs.com</a>
          </p>
        </div>
      </div>
    </AppShell>
  )
}
