import Announcement from '../models/Announcement.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List announcements (role-aware audience)
// @route  GET /api/announcements
export const getAnnouncements = async (req, res) => {
  const filter = buildFilter(req.query, ['title', 'body'])
  const { page, limit, skip, sort } = getPagination(req.query)

  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    filter.audience = { $in: ['all', req.user.role === 'parent' ? 'parents' : 'students'] }
  }

  const [items, total] = await Promise.all([
    Announcement.find(filter).skip(skip).limit(limit).sort(sort || '-publishedAt').populate('author', 'name'),
    Announcement.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Create announcement (admin/teacher)
// @route  POST /api/announcements
export const createAnnouncement = async (req, res) => {
  const { title, body, category, priority, audience, published } = req.body
  if (!title || !body) return res.status(400).json({ message: 'Title and body are required' })

  const announcement = await Announcement.create({
    title,
    body,
    category,
    priority,
    audience,
    published: published !== false,
    author: req.user._id,
  })
  res.status(201).json(announcement)
}

// @desc   Update announcement
// @route  PUT /api/announcements/:id
export const updateAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' })

  const fields = ['title', 'body', 'category', 'priority', 'audience', 'published']
  for (const key of fields) {
    if (req.body[key] !== undefined) announcement[key] = req.body[key]
  }
  await announcement.save()
  res.json(announcement)
}

// @desc   Delete announcement
// @route  DELETE /api/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id)
  if (!announcement) return res.status(404).json({ message: 'Announcement not found' })
  res.json({ message: 'Announcement deleted' })
}
