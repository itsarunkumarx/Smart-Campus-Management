# Smart Campus Management - Deployment Guide

This guide will help you deploy the Smart Campus Management application to **Render** (Backend), **Vercel** (Frontend), and **MongoDB Atlas** (Database).

---

## 1️⃣ MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new project called "Smart Campus"

### Step 2: Create a Cluster
1. Click **Create a Deployment**
2. Choose **Free Tier (Shared)**
3. Select your region (closest to your users)
4. Name it "smart-campus-cluster"
5. Click **Create Deployment**

### Step 3: Create Database User
1. Go to **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `campusadmin` (or your choice)
5. Password: Create a strong password
6. Click **Add User**

### Step 4: Get Connection String
1. Go to **Databases** → Click **Connect**
2. Choose **Drivers** → **Node.js**
3. Copy the connection string
4. Replace `<password>` with your user password
5. Replace `myFirstDatabase` with `smart-campus`

**Example:**
```
mongodb+srv://campusadmin:yourpassword@cluster.mongodb.net/smart-campus?retryWrites=true&w=majority
```

### Step 5: Whitelist IP Addresses
1. Go to **Network Access**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ For production, use specific IPs

---

## 2️⃣ Render Backend Deployment

### Step 1: Prepare Backend
1. Check that `backend/package.json` has start script:
   ```json
   "start": "node server.js"
   ```

2. Ensure `.env.example` exists in backend folder

### Step 2: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Grant access to your repository

### Step 3: Deploy Backend
1. Go to **Dashboard** → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `smart-campus-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free tier

### Step 4: Add Environment Variables
Click **Environment** and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | MongoDB connection string from Step 1 |
| `JWT_SECRET` | Generate a random string: `openssl rand -base64 32` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-vercel-frontend.vercel.app` |

### Step 5: Deploy
- Click **Create Web Service**
- Wait for deployment (2-3 minutes)
- Copy your Render backend URL: `https://your-app.onrender.com`

---

## 3️⃣ Vercel Frontend Deployment

### Step 1: Prepare Frontend
1. Update `frontend/.env.example`:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```

### Step 2: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Grant repository access

### Step 3: Deploy Frontend
1. Click **Add New** → **Project**
2. Select your repository
3. Configure:
   - **Framework:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 4: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-render-backend.onrender.com`
   - Select for Production

### Step 5: Deploy
- Click **Deploy**
- Wait for build (2-3 minutes)
- Get your Vercel URL: `https://your-app.vercel.app`

---

## 4️⃣ Update Backend with Frontend URL

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **Environment**
4. Update `CLIENT_URL` with your Vercel URL
5. Click **Save**
6. Service will automatically redeploy

---

## 5️⃣ Test Your Deployment

### Test Backend
```bash
curl https://your-render-backend.onrender.com/api/health
```

### Test Frontend
Visit: `https://your-vercel-app.vercel.app`

### Check Logs
- **Render:** Dashboard → Service → Logs
- **Vercel:** Dashboard → Project → Deployments → View Logs

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- ✅ Check IP whitelist in MongoDB Atlas
- ✅ Verify connection string format
- ✅ Check MONGO_URI in Render environment variables

### CORS Errors
- ✅ Update `CLIENT_URL` in backend with correct Vercel URL
- ✅ Check CORS configuration in `backend/server.js`

### Frontend can't reach API
- ✅ Verify `VITE_API_URL` in frontend environment
- ✅ Make sure Render backend is deployed
- ✅ Check for mixed HTTP/HTTPS issues

### Build Failures
- ✅ Check build logs in deployment platforms
- ✅ Verify Node.js version: `22.x` (already set in package.json)
- ✅ Delete `node_modules` and `package-lock.json` locally, then reinstall

---

## 📝 Update Process

When you push to GitHub:
1. **Render** automatically redeploys backend
2. **Vercel** automatically redeploys frontend
3. No manual deployment needed!

---

## 🚀 First Time Setup Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Connection string obtained
- [ ] Render account created and connected to GitHub
- [ ] Backend deployed to Render
- [ ] Render environment variables configured
- [ ] Vercel account created and connected to GitHub
- [ ] Frontend deployed to Vercel
- [ ] Frontend VITE_API_URL configured
- [ ] Backend CLIENT_URL updated with Vercel URL
- [ ] All services tested and working

---

## 💡 Tips

1. **Keep secrets safe:** Never commit `.env` files to GitHub
2. **Monitor logs:** Check deployment logs regularly
3. **Run locally first:** Test everything with `npm run dev`
4. **Use free tiers:** Render and Vercel free tiers are great for learning
5. **Upgrade when needed:** As traffic grows, upgrade your plans

---

For issues, check the official docs:
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
