// prisma/seed.ts
import { PrismaClient, GigCategory, GigStatus, LocationMode, ContactPreference } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      name: 'Admin User',
      phone: '9999999999',
      email: 'admin@campusgig.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      college: 'DTU',
      department: 'Administration',
      year: 'Staff',
      bio: 'Platform administrator',
    },
  })

  // Create sample users
  const hash = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      name: 'Arjun Sharma',
      phone: '9876543210',
      email: 'arjun@dtu.ac.in',
      passwordHash: hash,
      college: 'DTU',
      department: 'Computer Science',
      year: '3rd Year',
      bio: 'Full-stack dev, love building things',
      avgRating: 4.8,
      ratingCount: 12,
      completedGigs: 15,
    },
  })

  const user2 = await prisma.user.upsert({
    where: { phone: '9876543211' },
    update: {},
    create: {
      name: 'Priya Mehta',
      phone: '9876543211',
      email: 'priya@dtu.ac.in',
      passwordHash: hash,
      college: 'DTU',
      department: 'Design',
      year: '2nd Year',
      bio: 'Graphic designer & illustrator',
      avgRating: 4.9,
      ratingCount: 8,
      completedGigs: 10,
    },
  })

  const user3 = await prisma.user.upsert({
    where: { phone: '9876543212' },
    update: {},
    create: {
      name: 'Rahul Verma',
      phone: '9876543212',
      email: 'rahul@dtu.ac.in',
      passwordHash: hash,
      college: 'DTU',
      department: 'Mechanical',
      year: '4th Year',
      bio: 'Quick errand runner, very reliable',
      avgRating: 4.5,
      ratingCount: 20,
      completedGigs: 25,
    },
  })

  // Create sample gigs
  const gig1 = await prisma.gig.create({
    data: {
      title: 'Need PPT designed for project presentation',
      description: 'I need a clean, professional 15-slide PowerPoint for my final year project presentation on ML. Must include charts, infographics, and a modern design. Content will be provided.',
      category: GigCategory.CREATIVE_DIGITAL,
      budget: 500,
      isNegotiable: true,
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isUrgent: true,
      locationMode: LocationMode.ONLINE,
      contactPref: ContactPreference.IN_APP,
      status: GigStatus.POSTED,
      posterId: user1.id,
      tags: ['PPT', 'Design', 'Presentation'],
    },
  })

  await prisma.gig.create({
    data: {
      title: 'Pick up food from Gate 2 canteen',
      description: 'Need someone to pick up my food order from the Gate 2 canteen and deliver to Block C hostel. Food will be pre-paid.',
      category: GigCategory.CAMPUS_ERRANDS,
      budget: 50,
      isNegotiable: false,
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000),
      isUrgent: true,
      locationMode: LocationMode.ON_CAMPUS,
      contactPref: ContactPreference.BOTH,
      status: GigStatus.POSTED,
      posterId: user2.id,
      tags: ['Delivery', 'Food', 'Hostel'],
    },
  })

  await prisma.gig.create({
    data: {
      title: 'Python assignment help — Data Structures',
      description: 'Need help understanding and completing a data structures assignment in Python. Topics: BST, graphs, dynamic programming. Looking for someone to explain and help.',
      category: GigCategory.ACADEMIC_SUPPORT,
      budget: 300,
      isNegotiable: true,
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isUrgent: false,
      locationMode: LocationMode.ONLINE,
      contactPref: ContactPreference.IN_APP,
      status: GigStatus.POSTED,
      posterId: user3.id,
      tags: ['Python', 'Tutoring', 'CS'],
    },
  })

  await prisma.gig.create({
    data: {
      title: 'Selling MacBook charger 60W — good condition',
      description: 'Original Apple MacBook charger 60W MagSafe 2. Works perfectly. Selling because I upgraded. Price negotiable for quick sale.',
      category: GigCategory.MARKETPLACE,
      budget: 800,
      isNegotiable: true,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isUrgent: false,
      locationMode: LocationMode.ON_CAMPUS,
      contactPref: ContactPreference.WHATSAPP,
      status: GigStatus.POSTED,
      posterId: user1.id,
      tags: ['Apple', 'Charger', 'Electronics'],
    },
  })

  await prisma.gig.create({
    data: {
      title: 'Print and spiral bind my thesis — 80 pages',
      description: 'Need color printing and spiral binding for 80-page thesis. 2 copies needed. Preferably near campus or can arrange pickup/delivery.',
      category: GigCategory.SERVICES,
      budget: 200,
      isNegotiable: true,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUrgent: true,
      locationMode: LocationMode.ON_CAMPUS,
      contactPref: ContactPreference.IN_APP,
      status: GigStatus.POSTED,
      posterId: user2.id,
      tags: ['Printing', 'Thesis', 'Binding'],
    },
  })

  // Create sample reviews for user1
  await prisma.review.create({
    data: {
      gigId: gig1.id,
      reviewerId: user2.id,
      revieweeId: user1.id,
      rating: 5,
      comment: 'Excellent work! Delivered ahead of time with amazing quality.',
    },
  })

  console.log('✅ Seed complete!')
  console.log('👤 Admin: phone=9999999999, password=admin123')
  console.log('👤 User1: phone=9876543210, password=password123')
  console.log('👤 User2: phone=9876543211, password=password123')
  console.log('👤 User3: phone=9876543212, password=password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
