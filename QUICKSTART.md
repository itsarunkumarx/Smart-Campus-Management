# 🚀 Quick Start Guide

## Smart Campus Management System

### Prerequisites
Before running the application, ensure you have:
- ✅ Node.js installed (v16 or higher)
- ✅ MongoDB running (either locally or MongoDB Atlas cloud)

---

## Step 1: Install MongoDB (If Not Already Installed)

### Option A: MongoDB Local Installation
Download and install from: https://www.mongodb.com/try/download/community

After installation, start MongoDB:
```bash
# Windows - MongoDB should start automatically as a service
# Or manually start it with:
mongod
```

### Option B: MongoDB Atlas (Cloud - Recommended for Quick Start)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/smart-campus`)

---

## Step 2: Configure Environment Variables

### Backend Configuration
Edit `backend/.env` file:
```env
# For Local MongoDB:
MONGO_URI=mongodb://localhost:27017/smart-campus

# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/smart-campus

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration
The `frontend/.env` is already configured:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 3: Install Dependencies

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies  
```bash
cd frontend
npm install
```

---

## Step 4: Start the Servers

### Terminal 1 - Start Backend (Port 5000)
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
✅ Server running on port 5000
```

### Terminal 2 - Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

---

## Step 5: Access the Application

Open your browser and navigate to:
**http://localhost:5173**

You should see the Smart Campus landing page!

---

## 🎯 Testing the Application

### Create Your First User

1. Click **"Get Started"** or **"Register"**
2. Fill in the student registration form
3. After registration, you'll be redirected to login
4. Login with your credentials
5. You'll be redirected to the Student Dashboard!

### Creating Admin/Faculty Users

Since there's no registration page for admin/faculty, you need to create them via MongoDB:

#### Method 1: Using MongoDB Compass (GUI)
1. Open MongoDB Compass
2. Connect to your database
3. Navigate to `smart-campus` database → `users` collection
4. Insert a new document:

```json
{
  "name": "Admin User",
  "username": "admin",
  "email": "admin@campus.edu",
  "password": "$2a$10$YourHashedPasswordHere",
  "role": "admin",
  "isSuspended": false,
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Method 2: Using MongoDB Shell
```bash
mongosh

use smart-campus

db.users.insertOne({
  name: "Admin User",
  username: "admin",
  email: "admin@campus.edu", 
  password: "$2a$10$X8qP9YmZ1234567890abc",  // You'll need to hash this
  role: "admin",
  isSuspended: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note**: For the password, you'll need to hash it using bcrypt. For testing, you can temporarily modify the registration endpoint or create a simple script.

---

## 🔧 Troubleshooting

### Backend won't start?
- ✅ Check MongoDB is running: `mongosh` (should connect without errors)
- ✅ Check `.env` file exists in `backend/` folder
- ✅ Verify MONGO_URI in `.env` is correct
- ✅ Run `npm install` in backend folder

### Frontend shows connection errors?
- ✅ Make sure backend is running on port 5000
- ✅ Check browser console for errors
- ✅ Verify `VITE_API_URL` in `frontend/.env`

### Can't login?
- ✅ Make sure you registered first as a student
- ✅ Check if MongoDB has the user document
- ✅ Verify password was entered correctly

---

## 📱 Application Features

### Student Portal
- Dashboard with attendance percentage
- View upcoming events
- Apply for placements
- Apply for scholarships
- Submit complaints
- Social feed (posts)
- AI Assistant

### Faculty Portal
- Department dashboard
- Create announcements
- Mark student attendance
- View department students
- Manage events

### Admin Portal
- System analytics
- Manage all users (suspend/delete)
- Create placements & scholarships
- Handle complaints
- Moderate posts
- System-wide announcements

---

## 🎉 You're All Set!

The application is now running and ready to use. Explore the different features and dashboards!

For detailed API documentation, see the main [README.md](./README.md)
