// components/gigs/CreateGigForm.tsx
'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import {
  FileText, DollarSign, Clock, MapPin, Tag, Upload, X,
  Zap, ArrowLeftRight, Users, RotateCcw, CheckCircle,
} from 'lucide-react'
import { createGigSchema, type CreateGigInput } from '@/lib/validation/gig'
import { useCreateGig } from '@/hooks/useGigs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GIG_CATEGORIES, LOCATION_MODES, CONTACT_PREFERENCES } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'

interface CreateGigFormProps {
  editData?: Partial<CreateGigInput>
  gigId?: string
  onSuccess?: (gig: any) => void
}

export function CreateGigForm({ editData, gigId, onSuccess }: CreateGigFormProps) {
  const router = useRouter()
  const createGig = useCreateGig()
  const [tags, setTags] = useState<string[]>(editData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGigInput>({
    resolver: zodResolver(createGigSchema),
    defaultValues: {
      isNegotiable: false,
      isUrgent: false,
      isRepeat: false,
      locationMode: 'ONLINE',
      contactPref: 'IN_APP',
      tags: [],
      ...editData,
    },
  })

  const budget = watch('budget')
  const isNegotiable = watch('isNegotiable')
  const isUrgent = watch('isUrgent')

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 5) {
      const next = [...tags, t]
      setTags(next)
      setValue('tags', next)
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag)
    setTags(next)
    setValue('tags', next)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json()
      if (res.ok) setAttachments((prev) => [...prev, ...json.urls])
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: CreateGigInput) => {
    const payload = { ...data, attachments }
    const gig = await createGig.mutateAsync(payload)
    onSuccess?.(gig)
    router.push(`/gigs/${gig.id}`)
  }

  const sectionClass = 'rounded-2xl border border-border bg-white p-5 space-y-5 shadow-soft'
  const sectionTitle = 'text-base font-bold text-foreground mb-1'
  const sectionSub = 'text-xs text-muted-foreground'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Section 1 — Basic Info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={sectionClass}
      >
        <div>
          <h2 className={sectionTitle}>📝 Basic Info</h2>
          <p className={sectionSub}>What do you need done?</p>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Gig Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            placeholder='e.g. "Need PPT designed for project presentation"'
            error={errors.title?.message}
            {...register('title')}
          />
          <p className="text-xs text-muted-foreground">Be specific — this is the first thing workers see</p>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label>Category <span className="text-destructive">*</span></Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GIG_CATEGORIES.map((cat) => {
              const current = watch('category')
              const isActive = current === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setValue('category', cat.value as any)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
                    isActive
                      ? 'border-brand-400 bg-brand-50 text-brand-700'
                      : 'border-border hover:border-brand-200 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="text-xs leading-tight">{cat.label}</span>
                </button>
              )
            })}
          </div>
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
          <Textarea
            id="description"
            placeholder="Describe the task clearly — scope, deliverables, requirements, any special notes. For written work: mention the number of pages, word count, and format. For design: include dimensions, style preferences, and examples."
            className="min-h-[130px]"
            error={errors.description?.message}
            {...register('description')}
          />
          {/* Guidelines callout */}
          <div className="rounded-xl bg-brand-50 border border-brand-100 p-3 space-y-1">
            <p className="text-xs font-semibold text-brand-700">📋 Posting Guidelines</p>
            <ul className="text-xs text-brand-600 space-y-0.5 list-disc list-inside leading-relaxed">
              <li>Be specific about the scope (e.g., number of pages/slides for documents)</li>
              <li>Include deadlines and any format requirements</li>
              <li>Mention if the work is for academic or personal use</li>
              <li>No illegal, academic dishonesty, or NSFW tasks — these will be removed</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Section 2 — Budget & Deadline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={sectionClass}
      >
        <div>
          <h2 className={sectionTitle}>💰 Budget & Deadline</h2>
          <p className={sectionSub}>Set clear expectations</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (₹) <span className="text-destructive">*</span></Label>
            <Input
              id="budget"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="500"
              leftIcon={<span className="text-muted-foreground font-medium text-sm">₹</span>}
              error={errors.budget?.message}
              {...register('budget', { valueAsNumber: true })}
            />
            {budget > 0 && (
              <p className="text-xs text-brand-600 font-medium">{formatCurrency(budget)}</p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Deadline <span className="text-destructive">*</span></Label>
            <Input
              id="deadline"
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              error={errors.deadline?.message}
              {...register('deadline')}
            />
          </div>
        </div>

        {/* Toggles row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">Negotiable</p>
                <p className="text-xs text-muted-foreground">Allow counter-offers</p>
              </div>
            </div>
            <Switch
              checked={isNegotiable}
              onCheckedChange={(v) => setValue('isNegotiable', v)}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Urgent</p>
                <p className="text-xs text-muted-foreground">Boost visibility</p>
              </div>
            </div>
            <Switch
              checked={isUrgent}
              onCheckedChange={(v) => setValue('isUrgent', v)}
            />
          </div>
        </div>
      </motion.div>

      {/* Section 3 — Details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={sectionClass}
      >
        <div>
          <h2 className={sectionTitle}>📍 Details</h2>
          <p className={sectionSub}>Help workers understand the work context</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Location mode */}
          <div className="space-y-1.5">
            <Label>Location Mode</Label>
            <Select
              defaultValue="ONLINE"
              onValueChange={(v) => setValue('locationMode', v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.icon} {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contact preference */}
          <div className="space-y-1.5">
            <Label>Preferred Contact</Label>
            <Select
              defaultValue="IN_APP"
              onValueChange={(v) => setValue('contactPref', v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_PREFERENCES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>


        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags <span className="text-muted-foreground font-normal">(optional, max 5)</span></Label>
          <div className="flex gap-2">
            <Input
              placeholder='e.g. "Python", "Design"'
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1 text-xs font-medium"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Section 4 — Attachments */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={sectionClass}
      >
        <div>
          <h2 className={sectionTitle}>📎 Attachments</h2>
          <p className={sectionSub}>Reference files, images, or examples (optional)</p>
        </div>

        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/plain"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-border hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer"
        >
          <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
            {uploading ? (
              <div className="h-5 w-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload files'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Images, PDF, or text · Max 5MB each · Up to 5 files</p>
          </div>
        </button>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((url, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border border-border">
                <FileText className="h-4 w-4 text-brand-600 shrink-0" />
                <span className="text-xs text-foreground/80 truncate flex-1">
                  {url.split('/').pop()}
                </span>
                <button
                  type="button"
                  onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pb-4"
      >
        <Button
          type="submit"
          size="xl"
          className="w-full gap-2"
          loading={createGig.isPending}
        >
          <CheckCircle className="h-5 w-5" />
          {gigId ? 'Update Gig' : 'Post Gig'}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Your gig will be live immediately and visible to all campus users
        </p>
      </motion.div>
    </form>
  )
}
