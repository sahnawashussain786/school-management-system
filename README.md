# Junior Champ's Higher Secondary School, Chandia - Management System

A full-stack school management system built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

### Public Website
- Home page with hero section, stats, and announcements
- About page with mission, vision, and leadership
- Academics page showcasing curriculum
- Admissions page with application process and FAQs
- School Trips listing with registration info
- News & Events page (pulls from API)
- Contact page with inquiry form

### Admin/Staff Portal
- Dashboard with role-specific stats
- Student management (CRUD, class assignment)
- Teacher management (CRUD, subject/class assignment)
- Class management (grade sections, homeroom teachers)
- Subject management
- Timetable management (weekly schedule per class)
- Attendance tracking (daily register per class)
- Exam management (schedule, marks, results, publishing)
- Assignment management (create, submissions, grading)
- Fee management (invoice generation, payments, stats)
- Announcement management
- Event calendar management
- School trip planning and registration management
- Library management (books, borrowing, returns)

### Student/Parent Portal
- Overview dashboard
- Personal attendance tracking
- Exam results (published exams only)
- My assignments (view, submit work)
- Class timetable
- Fee invoices and payment history
- School trip registration with consent
- Library loans tracking
- Announcements (role-filtered)
- Profile management

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, React Router 7, React Toastify
- **Backend:** Node.js, Express 4
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with httpOnly cookies
- **Security:** Helmet, CORS, express-mongo-sanitize, rate limiting

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or MongoDB Atlas connection string

### Installation

```bash
# Install all dependencies
npm run install:all

# Set up environment variables (copy .env.example to .env)
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Seed the database with demo data
npm run seed

# Start development servers
npm run dev
```

### Demo Accounts

After seeding, use these credentials:

| Role    | Email               | Password     |
|---------|---------------------|--------------|
| Admin   | admin@school.edu    | admin123     |
| Teacher | sarah@school.edu    | teacher123   |
| Student | student1@school.edu | student123   |
| Parent  | parent@school.edu   | parent123    |

## Project Structure

```
school-management-system/
├── backend/
│   ├── controllers/     # Route handlers
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routers
│   ├── middleware/     # Auth, error handling
│   ├── utils/          # Helper functions
│   ├── config/         # DB connection
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context (auth)
│   │   ├── api/        # API client
│   │   └── hooks/      # Custom hooks
│   └── index.html
└── package.json
```

## API Endpoints

### Public (no auth)
- `GET /api/public/info` - School information
- `GET /api/public/announcements` - Published announcements
- `GET /api/public/events` - Public events
- `GET /api/public/trips` - Public trips

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Protected Routes (require auth)
- `/api/users` - User management (admin)
- `/api/students` - Student management
- `/api/teachers` - Teacher management
- `/api/classes` - Class management
- `/api/subjects` - Subject management
- `/api/timetable` - Timetable management
- `/api/attendance` - Attendance tracking
- `/api/exams` - Exam management
- `/api/assignments` - Assignment management
- `/api/fees` - Fee management
- `/api/trips` - Trip management
- `/api/library` - Library management
- `/api/announcements` - Announcements
- `/api/events` - Events
- `/api/dashboard` - Dashboard stats

## Deployment

### Vercel Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGO_URI` - MongoDB connection string
   - `JWT_SECRET` - Random secret string
   - `JWT_EXPIRES_IN` - Token expiration (e.g., 7d)
   - `CLIENT_URL` - Your Vercel domain

### Environment Variables

Create a `.env` file in the backend folder:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/schoolms
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## License

MIT
