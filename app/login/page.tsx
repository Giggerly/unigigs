// app/login/page.tsx
import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(129,150,251,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(100,116,247,0.2) 0%, transparent 40%)`
        }} />
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute bottom-32 right-16 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 backdrop-blur-xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="Unigigs" className="h-10 w-10 object-contain" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Unigigs</span>
          </div>

          {/* Pitch */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Campus work,<br />done fast.
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                Post gigs, find workers, and build trust — all in one place. No more WhatsApp chaos.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '500+', label: 'Gigs Posted' },
                { value: '4.8★', label: 'Avg Rating' },
                { value: '<2min', label: 'Avg Response' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-white/60 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
              <p className="text-white/90 text-sm leading-relaxed italic">
                "Found a designer for my PPT in 10 minutes. This is so much better than the WhatsApp group."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-brand-400 flex items-center justify-center text-white text-xs font-semibold">A</div>
                <span className="text-white/70 text-xs">Arjun, CSE 3rd Year · DTU</span>
              </div>
            </div>
          </div>

          <p className="text-white/40 text-xs">© 2024 Unigigs. Built for students, by students.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-1">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="flex flex-col items-center">
              <img src="/logo.png" alt="Unigigs" className="h-9 w-9 object-contain" />
            </div>
            <span className="font-bold text-xl">Uni<span className="text-brand-600">gigs</span></span>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
