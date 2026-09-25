import dotenv from 'dotenv'
dotenv.config()

import app from './app.js'
import connectDB from './config/db.js'

const PORT = process.env.PORT || 5000

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ API server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message)
    process.exit(1)
  })

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
})
