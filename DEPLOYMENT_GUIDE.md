# Institutional Deployment Guide (Vercel & Render)

Follow these protocols to synchronize your environment variables across the cloud grid.

## 🔗 Render (Backend)
Set these in **Dashboard > Environment**:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `(Random String)` | Use a strong alphanumeric key |
| `PORT` | `5000` | Render will also set this automatically |
| `FRONTEND_URL` | `https://your-app.vercel.app` | **CRITICAL**: Your final Vercel URL |
| `BACKEND_URL` | `https://your-app.onrender.com` | Your Rent URL (for Keep-Alive Pulse) |
| `GOOGLE_CLIENT_ID` | `(Same as .env)` | Your Google OAuth ID |

---

## 🎨 Vercel (Frontend)
Set these in **Settings > Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://your-app.onrender.com/api` | **CRITICAL**: Your Render API URL |
| `VITE_GOOGLE_CLIENT_ID` | `(Same as .env)` | Your Google OAuth ID |

---

## 🚀 Deployment Steps
1. **Backend**: Link your GitHub repo to Render. Specify `npm install` for Build Command and `npm start` for Start Command.
2. **Frontend**: Link your GitHub repo to Vercel. Vercel will auto-detect Vite. 
3. **Sync**: Once both are deployed, ensure `FRONTEND_URL` on Render matches your Vercel domain, and `VITE_API_URL` on Vercel points to your Render instance.
