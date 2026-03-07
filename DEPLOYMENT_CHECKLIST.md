# 🚀 Deployment Quick Checklist

## MongoDB Atlas (Database)
- [ ] Sign up at https://mongodb.com/cloud/atlas
- [ ] Create free cluster
- [ ] Create database user (campusadmin)
- [ ] Copy connection string: `mongodb+srv://campusadmin:PASSWORD@cluster.mongodb.net/smart-campus?retryWrites=true&w=majority`
- [ ] Allow 0.0.0.0/0 in Network Access

## Render (Backend)
- [ ] Sign up at https://render.com with GitHub
- [ ] Click: New → Web Service
- [ ] Select repository and set root directory to `backend`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Add environment variables:
  ```
  MONGO_URI = [Your MongoDB connection string]
  JWT_SECRET = [Generate random: openssl rand -base64 32]
  NODE_ENV = production
  CLIENT_URL = [Will be your Vercel URL]
  ```
- [ ] Deploy and copy URL (e.g., https://smart-campus-backend.onrender.com)

## Vercel (Frontend)
- [ ] Sign up at https://vercel.com with GitHub
- [ ] Click: Add New → Project
- [ ] Select repository and set root directory to `frontend`
- [ ] Framework: Vite
- [ ] Build: `npm run build`
- [ ] Output: `dist`
- [ ] Add environment variable:
  ```
  VITE_API_URL = [Your Render backend URL]
  ```
- [ ] Deploy and copy URL (e.g., https://smart-campus.vercel.app)

## Final Step
- [ ] Update Render backend `CLIENT_URL` with Vercel frontend URL
- [ ] Test: https://smart-campus.vercel.app

## Testing URLs
```
Frontend: https://smart-campus.vercel.app
Backend: https://smart-campus-backend.onrender.com/api/health
```

---

## 📌 Important Notes

1. **Render free tier:** Goes to sleep after 15 minutes of inactivity (will wake on request)
2. **Auto-redeploy:** Pushing to GitHub automatically triggers deploys
3. **CORS:** Already configured in backend for any origin
4. **File uploads:** Use Render's file storage or upgrade to paid tier
5. **Email:** Add own SMTP credentials in environment variables if needed

---

## 💾 Don't Forget to Push to GitHub!

```bash
cd "c:\Users\ARUNKUMAR\Documents\smart campus management"
git add .env.example render.yaml DEPLOYMENT_SETUP.md DEPLOYMENT_CHECKLIST.md
git commit -m "Add deployment configuration files"
git push origin main
```
