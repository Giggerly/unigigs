// app/login/LoginForm.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validation/auth'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/gigs'
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Login failed')

      setUser(json.user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast({ title: `Welcome back, ${json.user.name.split(' ')[0]}!`, variant: 'default' })
      router.push(redirect)
    } catch (err: any) {
      toast({ title: 'Sign in failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { ease: [0.25, 0.46, 0.45, 0.94] } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to your CampusGig account
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Phone */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="phone">Mobile Number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="9876543210"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-1">
          <Button type="submit" className="w-full gap-2" size="lg" loading={isLoading}>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-1 px-3 text-muted-foreground font-medium">
            New to CampusGig?
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link href="/register">
          <Button variant="outline" className="w-full" size="lg">
            Create an Account
          </Button>
        </Link>
      </motion.div>

      {/* Demo hint */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl bg-brand-50 border border-brand-100 p-3">
          <p className="text-xs text-brand-700 font-medium">Demo credentials</p>
          <p className="text-xs text-brand-600 mt-0.5">Phone: 9876543210 · Password: password123</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
