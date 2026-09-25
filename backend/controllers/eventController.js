import Event from '../models/Event.js'
import { buildFilter, getPagination } from '../utils/queryHelpers.js'

// @desc   List events (public ones visible to all logged-in users)
// @route  GET /api/events
export const getEvents = async (req, res) => {
  const filter = buildFilter(req.query, ['title', 'location'])
  const { page, limit, skip, sort } = getPagination(req.query)

  if (req.user.role === 'student' || req.user.role === 'parent') {
    filter.isPublic = true
  }

  const [items, total] = await Promise.all([
    Event.find(filter).skip(skip).limit(limit).sort(sort || '-startDate'),
    Event.countDocuments(filter),
  ])
  res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
}

// @desc   Create event (admin/teacher)
// @route  POST /api/events
export const createEvent = async (req, res) => {
  const { title, description, category, startDate, endDate, location, isPublic } = req.body
  if (!title || !startDate) return res.status(400).json({ message: 'Title and start date are required' })

  const event = await Event.create({
    title,
    description,
    category,
    startDate,
    endDate,
    location,
    isPublic: isPublic !== false,
  })
  res.status(201).json(event)
}

// @desc   Update event
// @route  PUT /api/events/:id
export const updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!event) return res.status(404).json({ message: 'Event not found' })
  res.json(event)
}

// @desc   Delete event
// @route  DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })
  res.json({ message: 'Event deleted' })
}
