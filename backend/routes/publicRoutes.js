import { Router } from 'express'
import Announcement from '../models/Announcement.js'
import Event from '../models/Event.js'
import Trip from '../models/Trip.js'

const router = Router()

// @desc   Public site info (no auth)
// @route  GET /api/public/info
router.get('/info', (req, res) => {
  res.json({
    name: 'Greenwood International School',
    tagline: 'Nurturing Minds, Building Futures',
    founded: 1998,
    address: '45 Meadowbrook Avenue, Springfield, CA 90210',
    phone: '+1 (555) 234-8890',
    email: 'office@greenwoodschool.edu',
    hours: 'Mon – Fri: 8:00 AM – 4:00 PM',
  })
})

// @desc   Public announcements
// @route  GET /api/public/announcements
router.get('/announcements', async (req, res) => {
  const items = await Announcement.find({ published: true })
    .sort('-publishedAt')
    .limit(6)
    .select('title body category priority publishedAt')
  res.json(items)
})

// @desc   Public events
// @route  GET /api/public/events
router.get('/events', async (req, res) => {
  const items = await Event.find({ isPublic: true }).sort('-startDate').limit(8)
  res.json(items)
})

// @desc   Public upcoming trips (registration requires login)
// @route  GET /api/public/trips
router.get('/trips', async (req, res) => {
  const items = await Trip.find({ isPublic: true, status: { $in: ['open', 'closed'] } })
    .sort('startDate')
    .limit(6)
    .select('title destination description category startDate endDate costPerStudent capacity status')
    .lean()
  const withCounts = items.map((t) => ({
    ...t,
    registeredCount: t.registrations ? t.registrations.length : 0,
    registrations: undefined,
  }))
  res.json(withCounts)
})

export default router
