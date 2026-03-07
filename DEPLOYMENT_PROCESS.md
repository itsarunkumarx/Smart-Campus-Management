# 🚀 Smart Campus Management - Deployment Process

## Phase 1: Prepare Your Code (LOCAL)

### Step 1: Commit All Changes to GitHub
```bash
cd "c:\Users\ARUNKUMAR\Documents\smart campus management"
git status
git add -A
git commit -m "Prepare for deployment to Render and Vercel"
git push origin main
```

✅ **Verify:** Go to GitHub and check all files are pushed


## Phase 2: Set Up MongoDB Atlas (Database)

### Step 1: Create MongoDB Account
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Click **Sign Up** → Create account with email
3. Create a new project → Name: `Smart-Campus`

### Step 2: Create Cluster
1. Click **Create a Deployment**
2. Select **FREE TIER (M0)**
3. Choose your region (closest to you)
4. Click **Create Deployment** (wait 5-10 minutes)

### Step 3: Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Username: `campusadmin`
5. Password: Create a STRONG password (save it!)
6. Click **Add User**

### Step 4: Get Connection String
1. Go to **Databases** → Click **Connect** on your cluster
2. Choose **Drivers** → **Node.js**
3. Copy the connection string
4. Replace `<username>` with `campusadmin`
5. Replace `<password>` with your password
6. Replace `myFirstDatabase` with `smart-campus`

**Example:**
```
mongodb+srv://campusadmin:YOUR_PASSWORD@cluster.mongodb.net/smart-campus?retryWrites=true&w=majority
```

✅ **Save this! You'll need it for Render**


## Phase 3: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Click **Sign Up**
3. Choose **Sign up with GitHub**
4. Authorize Render to access your GitHub

### Step 2: Deploy Backend Service
1. Go to **Dashboard** → Click **New +** → **Web Service**
2. Select your `Smart-Campus-Management` repository
3. Click **Connect**

### Step 3: Configure Backend
Fill in the form:
- **Name:** `smart-campus-backend`
- **Environment:** `Node`
- **Region:** Choose closest to your users
- **Branch:** `main`
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Plan:** `Free`

### Step 4: Add Environment Variables
1. Scroll down to **Environment** section
2. Click **Add Environment Variable** for each:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://campusadmin:PASSWORD@cluster.mongodb.net/smart-campus?retryWrites=true&w=majority` |
| `JWT_SECRET` | Generate random: Open PowerShell and run `[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString())) | Write-Host` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://smart-campus.vercel.app` (you'll add this later) |

### Step 5: Deploy
1. Click **Create Web Service**
2. Wait for build (2-5 minutes)
3. When done, you'll see a URL like: `https://smart-campus-backend.onrender.com`
4. **COPY THIS URL** - you need it for Vercel!

✅ **Check logs** for any errors. MongoDB connection should show `✅ MongoDB Connected`


## Phase 4: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel

### Step 2: Deploy Frontend
1. Click **Add New...** → **Project**
2. Select your `Smart-Campus-Management` repository
3. Click **Import**

### Step 3: Configure Frontend
Fill in the form:
- **Framework Preset:** `Vite`
- **Root Directory:** Set to `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Step 4: Add Environment Variables
1. Go to **Environment Variables**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://smart-campus-backend.onrender.com`
   - **Select:** Production

### Step 5: Deploy
1. Click **Deploy**
2. Wait for build (1-3 minutes)
3. When done, you'll get a URL like: `https://smart-campus-xxxxx.vercel.app`
4. **COPY THIS URL**

✅ **Visit your URL** to see your frontend live!


## Phase 5: Update Backend with Frontend URL

### Go Back to Render
1. Open [render.com/dashboard](https://render.com/dashboard)
2. Click your `smart-campus-backend` service
3. Go to **Environment** (left sidebar)
4. Find `FRONTEND_URL` variable
5. Update it with your Vercel URL (from Phase 4)
6. Click **Save Changes**

The backend will automatically redeploy!

✅ **Wait 2 minutes** for redeploy to complete


## Phase 6: Test Everything

### Test 1: Backend Health Check
```
https://smart-campus-backend.onrender.com/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Test 2: Frontend Load
```
https://smart-campus-xxxxx.vercel.app
```
Should show your Smart Campus app!

### Test 3: API Connection
1. Open your frontend
2. Try to login or access any API endpoint
3. Check that it connects without CORS errors

### Test 4: Check Logs
**Render Logs:** Dashboard → Service → Logs (check for MongoDB connection)
**Vercel Logs:** Dashboard → Project → Deployments → View Logs


## Phase 7: Push Final Deployment Files to GitHub

```bash
cd "c:\Users\ARUNKUMAR\Documents\smart campus management"
git add -A
git commit -m "Deployment complete - Render and Vercel configured"
git push origin main
```

---

## ✅ Deployment Complete!

| Component | URL | Status |
|-----------|-----|--------|
| **Frontend** | https://smart-campus-xxxxx.vercel.app | 🟢 Live |
| **Backend** | https://smart-campus-backend.onrender.com | 🟢 Live |
| **Database** | MongoDB Atlas | 🟢 Connected |

---

## 🔗 Useful Links

- Frontend: [Your Vercel URL]
- Backend: [Your Render URL]
- MongoDB Atlas: https://cloud.mongodb.com
- Render Dashboard: https://render.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard

---

## ⚠️ Important Notes

1. **Render Free Tier:** Goes to sleep after 15 min of inactivity (wakes on request)
2. **Auto-Redeploy:** Pushing to GitHub automatically triggers new deployments
3. **Keep Secrets Safe:** Never commit `.env` files
4. **Monitoring:** Check logs regularly for errors
5. **Upgrade Later:** When you get traffic, upgrade to paid plans

---

## 🆘 Troubleshooting

### MongoDB Connection Error
- ✅ Check IP whitelist in MongoDB Atlas → Network Access → 0.0.0.0/0
- ✅ Verify connection string is correct
- ✅ Check MONGO_URI in Render environment

### Frontend can't reach API
- ✅ Verify `VITE_API_URL` matches your Render backend URL
- ✅ No trailing slash: `https://smart-campus-backend.onrender.com` ✅
- ✅ With slash is WRONG: `https://smart-campus-backend.onrender.com/` ❌

### Port Issues
- ✅ Make sure `PORT=5000` is in Render environment
- ✅ Don't close the terminal running your local backend

---

Ready to deploy? Start with **Phase 2**! 🚀
