# Smart Campus Management System

An enterprise-level MERN stack application for managing campus operations, with role-based access for students, faculty, and administrators.

## 🚀 Features

- **Authentication**: JWT-based auth with HTTP-only cookies
- **Role-Based Access**: Separate portals for Student, Faculty, and Admin
- **Social Features**: Posts, likes, comments, and discussion boards
- **Attendance Tracking**: Real-time attendance with analytics
- **Placement Portal**: Job postings and application management
- **Scholarship Management**: Apply and track scholarship applications
- **Event Management**: Create, register, and manage campus events
- **Complaint System**: Submit and track complaint resolution
- **AI Assistant**: Mock AI helper for academic queries (ready for real API integration)
- **Notifications**: System-wide announcements and alerts

## 🛠 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt password hashing
- Rate limiting & security (Helmet, CORS)

### Frontend
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Axios
- Context API for state management

## 📁 Project Structure

```
prince college/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── services/
    │   └── App.jsx
    └── public/
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/smart-campus
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 👥 Default Credentials

You'll need to create users through the registration page or MongoDB directly.

### Creating Admin User (MongoDB):
```javascript
use smart-campus
db.users.insertOne({
  name: "Admin User",
  username: "admin",
  email: "admin@campus.edu",
  password: "$2a$10$HASH", // Use bcrypt to hash password
  role: "admin",
  isSuspended: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Student
- `GET /api/student/dashboard` - Get dashboard data
- `GET /api/student/attendance` - Get attendance records
- `POST /api/student/placement/:id/apply` - Apply for placement
- `POST /api/student/scholarship/:id/apply` - Apply for scholarship

### Faculty
- `GET /api/faculty/dashboard` - Get dashboard data
- `POST /api/faculty/announcement` - Create announcement
- `POST /api/faculty/attendance` - Mark attendance
- `GET /api/faculty/students` - Get department students

### Admin
- `GET /api/admin/dashboard` - Get system analytics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/user/:id/suspend` - Suspend/unsuspend user
- `DELETE /api/admin/user/:id` - Delete user
- `POST /api/admin/placement` - Create placement
- `POST /api/admin/scholarship` - Create scholarship

## 🎨 Design System

- **Primary Color**: Deep Indigo (#4F46E5)
- **Secondary Color**: Sky Blue (#0EA5E9)
- **Accent Color**: Soft Cyan (#22D3EE)
- **Background**: Light Gray (#F3F4F6)

## 🔒 Security Features

- HTTP-only JWT cookies
- Password hashing with bcrypt
- Rate limiting on API routes
- Helmet security headers
- CORS configuration
- Input validation
- Role-based access control

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

This is an educational project. Feel free to fork and enhance!

## 📧 Support

For issues or questions, please create an issue in the repository.
