import { buildFilter, getPagination } from '../utils/queryHelpers.js'

/**
 * Creates a reusable CRUD controller set for a mongoose model.
 */
export const createCrud = (Model, { textFields = ['name'], populate = [], searchable = true, sortBy = '-createdAt' } = {}) => {
  const list = async (req, res) => {
    const filter = searchable ? buildFilter(req.query, textFields) : {}
    const { page, limit, skip, sort } = getPagination(req.query)

    let q = Model.find(filter).skip(skip).limit(limit).sort(req.query.sort || sortBy)
    for (const p of populate) q = q.populate(p)

    const [items, total] = await Promise.all([
      q,
      Model.countDocuments(filter),
    ])

    res.json({ items, page, pages: Math.ceil(total / limit) || 1, total })
  }

  const getOne = async (req, res) => {
    let q = Model.findById(req.params.id)
    for (const p of populate) q = q.populate(p)
    const item = await q
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json(item)
  }

  const create = async (req, res) => {
    const item = await Model.create(req.body)
    const populated = await Model.findById(item._id)
    res.status(201).json(populated)
  }

  const update = async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!item) return res.status(404).json({ message: 'Not found' })
    const populated = await Model.findById(item._id)
    res.json(populated)
  }

  const remove = async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Not found' })
    res.json({ message: 'Deleted successfully' })
  }

  return { list, getOne, create, update, remove }
}
