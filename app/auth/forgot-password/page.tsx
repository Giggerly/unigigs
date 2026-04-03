// app/auth/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Mail, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="rounded-3xl border border-border bg-white shadow-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Forgot Password?</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Enter the phone number or email associated with your account and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identity">Email or Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="identity"
                      type="text"
                      placeholder="e.g. 9876543210 or your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-2xl shadow-brand" 
                  loading={loading}
                  disabled={!email}
                >
                  Send Reset Link
                </Button>
              </form>

              <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-brand-600 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you're having trouble receiving the link, please contact your campus admin or reach out to us at support@unigigs.com.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-border bg-white shadow-card p-10 text-center space-y-6"
            >
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Check your inbox</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>. Please click the link to continue.
                </p>
              </div>
              
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Return to Login
                  </Button>
                </Link>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-brand-600 font-medium hover:underline mt-6"
                >
                  Didn't receive it? Resend link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
