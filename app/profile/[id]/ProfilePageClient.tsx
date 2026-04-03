// app/profile/[id]/ProfilePageClient.tsx
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MapPin, GraduationCap, Calendar, Edit, Flag, MessageSquare,
  Phone, BookOpen, Clock
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { RatingStars } from '@/components/profile/RatingStars'
import { TrustBadges } from '@/components/profile/TrustBadges'
import { ProfileStats } from '@/components/profile/ProfileStats'
import { ReviewList } from '@/components/profile/ReviewList'
import { RatingSummary } from '@/components/profile/RatingSummary'
import { PageTransition } from '@/components/ui/PageTransition'
import { formatDate } from '@/lib/utils'

interface ProfilePageClientProps {
  profile: any
  isOwnProfile: boolean
  currentUserId?: string
}

export function ProfilePageClient({ profile, isOwnProfile, currentUserId }: ProfilePageClientProps) {
  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl border border-border bg-white shadow-card overflow-hidden"
          >
            {/* Background gradient bar */}
            <div className="h-24 w-full bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 80% 50%, white 0%, transparent 60%)`
                }}
              />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-10 mb-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                    <AvatarImage src={profile.profileImage || ''} alt={profile.name} />
                    <AvatarFallback name={profile.name} className="text-2xl" />
                  </Avatar>
                  {/* Online dot */}
                  <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  {isOwnProfile ? (
                    <Link href="/profile/edit">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Edit className="h-3.5 w-3.5" />
                        Edit Profile
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/messages?userId=${profile.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          Message
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon-sm">
                        <Flag className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Name + meta */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{profile.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    {profile.college && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {profile.college}
                        {profile.department && (
                          <span className="text-muted-foreground/60">· {profile.department}</span>
                        )}
                      </span>
                    )}
                    {profile.year && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" />
                        {profile.year}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Joined {formatDate(profile.createdAt, 'MMM yyyy')}
                    </span>
                  </div>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-3">
                  <RatingStars rating={profile.avgRating} size="md" showValue />
                  <span className="text-sm text-muted-foreground">
                    {profile.ratingCount} review{profile.ratingCount !== 1 ? 's' : ''}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {profile.completedGigs} gigs completed
                  </span>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-foreground/70 leading-relaxed">{profile.bio}</p>
                )}

                {/* Trust badges */}
                <TrustBadges
                  rating={profile.avgRating}
                  completedGigs={profile.completedGigs}
                  ratingCount={profile.ratingCount}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProfileStats
              avgRating={profile.avgRating}
              ratingCount={profile.ratingCount}
              completedGigs={profile.completedGigs}
              postedGigs={profile._count?.postedGigs}
            />
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Tabs defaultValue="reviews">
              <TabsList className="w-full">
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews ({profile.ratingCount})
                </TabsTrigger>
                <TabsTrigger value="about" className="flex-1">
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reviews" className="space-y-4">
                {profile.ratingCount > 0 && (
                  <RatingSummary
                    avgRating={profile.avgRating}
                    ratingCount={profile.ratingCount}
                  />
                )}
                <ReviewList reviews={profile.reviewsReceived || []} />
              </TabsContent>

              <TabsContent value="about" className="space-y-4">
                <div className="rounded-2xl border border-border bg-white shadow-soft p-5 space-y-4">
                  {profile.college && (
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-4.5 w-4.5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">College</p>
                        <p className="text-sm font-semibold mt-0.5">
                          {profile.college}
                          {profile.department && ` — ${profile.department}`}
                        </p>
                        {profile.year && (
                          <p className="text-xs text-muted-foreground">{profile.year}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Member Since</p>
                      <p className="text-sm font-semibold mt-0.5">{formatDate(profile.createdAt, 'MMMM yyyy')}</p>
                    </div>
                  </div>
                  {profile.bio && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">About</p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </PageTransition>
    </AppShell>
  )
}
