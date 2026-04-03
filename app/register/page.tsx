// app/register/page.tsx
import type { Metadata } from 'next'
import { RegisterForm } from './RegisterForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, rgba(129,150,251,0.2) 0%, transparent 50%)`
        }} />
        <div className="absolute top-32 right-20 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute bottom-20 left-16 w-48 h-48 rounded-full border border-white/5" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-lg">CG</span>
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">CampusGig</span>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Join your campus<br />marketplace
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                Earn money, get tasks done, and build a reputation that follows you through college.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: '⚡', title: 'Post in 30 seconds', desc: 'Quick form, instant visibility' },
                { icon: '🤝', title: 'Trusted profiles', desc: 'Ratings and reviews build real trust' },
                { icon: '💬', title: 'In-app chat', desc: 'Negotiate and confirm without leaving the app' },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4 bg-white/10 backdrop-blur rounded-2xl p-4">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{feature.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs">© 2024 CampusGig. Built for students, by students.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-1 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl gradient-brand flex items-center justify-center shadow-brand">
              <span className="text-white font-bold">CG</span>
            </div>
            <span className="font-bold text-xl">Uni<span className="text-brand-600">gigs</span></span>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
