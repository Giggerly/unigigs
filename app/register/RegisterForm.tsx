// app/register/RegisterForm.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Phone, Lock, User, Mail, BookOpen, Eye, EyeOff, ArrowRight, GraduationCap } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/lib/validation/auth'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { COLLEGE_YEARS } from '@/lib/constants'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [year, setYear] = useState('')
  const router = useRouter()
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, year }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Registration failed')

      setUser(json.user)
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })

      toast({ title: `Welcome to CampusGig, ${json.user.name.split(' ')[0]}!`, variant: 'default' })
      router.push('/gigs')
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { ease: [0.25, 0.46, 0.45, 0.94] } }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={itemVariants} className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="text-muted-foreground text-sm">
          Join your campus marketplace — it's free
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Arjun Sharma"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')}
          />
        </motion.div>

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

        {/* Email */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@dtu.ac.in"
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </motion.div>

        {/* College + Dept row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="college">College</Label>
            <Input
              id="college"
              placeholder="DTU"
              leftIcon={<GraduationCap className="h-4 w-4" />}
              error={errors.college?.message}
              {...register('college')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="CSE"
              leftIcon={<BookOpen className="h-4 w-4" />}
              error={errors.department?.message}
              {...register('department')}
            />
          </div>
        </motion.div>

        {/* Year */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label>Year</Label>
          <Select onValueChange={(val) => { setYear(val); setValue('year', val) }}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {COLLEGE_YEARS.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Password */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
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

        <motion.div variants={itemVariants} className="pt-1">
          <Button type="submit" className="w-full gap-2" size="lg" loading={isLoading}>
            Create Account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-1 px-3 text-muted-foreground font-medium">
            Already have an account?
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link href="/login">
          <Button variant="outline" className="w-full" size="lg">
            Sign In Instead
          </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
