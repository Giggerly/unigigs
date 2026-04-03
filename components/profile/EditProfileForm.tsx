// components/profile/EditProfileForm.tsx
'use client'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Camera, User, Mail, Phone, BookOpen, GraduationCap, FileText, MessageCircle } from 'lucide-react'
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validation/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/hooks/use-toast'
import { useAuthStore } from '@/store/authStore'
import { COLLEGE_YEARS } from '@/lib/constants'
import type { AuthUser } from '@/store/authStore'

interface EditProfileFormProps {
  user: AuthUser
  onSuccess?: () => void
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(user.profileImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setUser } = useAuthStore()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email || '',
      college: user.college || '',
      department: user.department || '',
      year: user.year || '',
      bio: user.bio || '',
      whatsappNumber: user.whatsappNumber || '',
    },
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Use JPEG, PNG, or WebP', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 5MB allowed', variant: 'destructive' })
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/profile/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setUser({ ...user, profileImage: json.imageUrl })
      toast({ title: 'Photo updated!', variant: 'default' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setUser({ ...user, ...json.user })
      toast({ title: 'Profile updated!', variant: 'default' })
      onSuccess?.()
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="space-y-6"
    >
      {/* Avatar upload */}
      <motion.div variants={itemVariants} className="flex items-center gap-5">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            <AvatarImage src={previewImage || ''} alt={user.name} />
            <AvatarFallback name={user.name} className="text-2xl" />
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageChange}
        />
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Change photo
          </button>
          <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG or WebP · Max 5MB</p>
        </div>
      </motion.div>

      {/* Name */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Your full name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name')}
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

      {/* WhatsApp */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="whatsapp">
          WhatsApp Number <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="whatsapp"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="For WhatsApp contact preference"
          leftIcon={<MessageCircle className="h-4 w-4" />}
          error={errors.whatsappNumber?.message}
          {...register('whatsappNumber')}
        />
      </motion.div>

      {/* College + Dept */}
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
        <Label>Year of Study</Label>
        <Select
          defaultValue={user.year || ''}
          onValueChange={(val) => setValue('year', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your year" />
          </SelectTrigger>
          <SelectContent>
            {COLLEGE_YEARS.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Bio */}
      <motion.div variants={itemVariants} className="space-y-1.5">
        <Label htmlFor="bio">
          Bio <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell others what you're good at or what you're looking for..."
          className="min-h-[90px]"
          error={errors.bio?.message}
          {...register('bio')}
        />
        <p className="text-xs text-muted-foreground">Max 300 characters</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          Save Changes
        </Button>
      </motion.div>
    </motion.form>
  )
}
