/**
 * Marks fields ending in "Fields" in req.query as "advanced" so that
 * mongoose advancedResults-style filtering can be used if extended later.
 * Also builds a mongoose filter object from common query params.
 *
 * Supported query params:
 *  - q          : text search against "name"/"title"/etc. (model-specific)
 *  - search     : alias of q
 *  - role, status, class, subject, trip, student, teacher, month, year,
 *    date, from, to, category, priority, gradeLevel, active, paid
 */
export const buildFilter = (query = {}, textFields = ['name']) => {
  const filter = {}
  const { q, search, ...rest } = query

  const text = q || search
  if (text && textFields.length) {
    const rx = { $regex: String(text).trim(), $options: 'i' }
    filter.$or = textFields.map((f) => ({ [f]: rx }))
  }

  const directMap = {
    role: 'role',
    status: 'status',
    class: 'class',
    classId: 'class',
    subject: 'subject',
    subjectId: 'subject',
    trip: 'trip',
    tripId: 'trip',
    student: 'student',
    teacher: 'teacher',
    month: 'month',
    year: 'year',
    category: 'category',
    priority: 'priority',
    gradeLevel: 'gradeLevel',
    type: 'type',
  }

  for (const [param, field] of Object.entries(directMap)) {
    if (rest[param] !== undefined && rest[param] !== '') {
      filter[field] = rest[param]
    }
  }

  // Date range filters
  if (rest.from || rest.to) {
    filter.date = {}
    if (rest.from) filter.date.$gte = new Date(rest.from)
    if (rest.to) filter.date.$lte = new Date(rest.to)
  }

  return filter
}

/**
 * Extracts pagination and sort options from query string.
 */
export const getPagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50))
  const skip = (page - 1) * limit

  let sort = query.sort || '-createdAt'
  if (sort === 'name') sort = 'name'
  return { page, limit, skip, sort }
}

/**
 * Wraps a model query in a paginated response envelope.
 */
export const paginate = async (modelQuery, page, limit) => {
  const [items, total] = await Promise.all([
    modelQuery.clone().exec(),
    modelQuery.model.countDocuments(modelQuery.getFilter()),
  ])
  return {
    items,
    page,
    pages: Math.ceil(total / limit) || 1,
    total,
  }
}
