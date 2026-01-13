# FastAPI Backend Deployment Guide

## Quick Deployment Options

### Option 1: Railway (Recommended - Easiest)

**Why Railway?**
- ✅ Free tier: 500 hours/month (~$5 credit)
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL (or connect to Neon)
- ✅ Zero configuration needed
- ✅ Custom domains

**Steps:**

1. **Install Railway CLI** (optional)
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy via GitHub (Recommended)**

   a. Push your code to GitHub:
   ```bash
   cd backend
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin master
   ```

   b. Go to [Railway.app](https://railway.app)

   c. Click "Start a New Project"

   d. Select "Deploy from GitHub repo"

   e. Choose your repository

   f. Railway will auto-detect FastAPI and deploy!

3. **Set Environment Variables**

   In Railway dashboard → Variables:
   ```
   DATABASE_URL = <your-neon-database-url>
   BETTER_AUTH_SECRET = <same-as-frontend>
   CORS_ORIGINS = ["https://your-frontend.vercel.app"]
   DEBUG = false
   ```

4. **Get Your API URL**

   Railway will provide: `https://your-app.railway.app`

   Update frontend `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

5. **Done! 🎉**

   Test: `curl https://your-app.railway.app/health`

---

### Option 2: Render

**Why Render?**
- ✅ Free tier (750 hours/month)
- ✅ Automatic HTTPS
- ✅ Easy setup
- ⚠️ Slower cold starts on free tier

**Steps:**

1. **Push to GitHub**
   ```bash
   cd backend
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin master
   ```

2. **Deploy on Render**

   a. Go to [Render.com](https://render.com)

   b. Click "New +" → "Web Service"

   c. Connect your GitHub repository

   d. Configure:
   - **Name**: todo-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

   e. Click "Create Web Service"

3. **Set Environment Variables**

   In Render dashboard → Environment:
   ```
   DATABASE_URL = <your-neon-database-url>
   BETTER_AUTH_SECRET = <same-as-frontend>
   CORS_ORIGINS = ["https://your-frontend.vercel.app"]
   DEBUG = false
   PYTHON_VERSION = 3.11.0
   ```

4. **Get Your API URL**

   Render provides: `https://your-app.onrender.com`

   Update frontend:
   ```
   NEXT_PUBLIC_API_URL=https://your-app.onrender.com
   ```

5. **Done! 🎉**

---

### Option 3: Vercel (Serverless)

**Why Vercel?**
- ✅ Same platform as frontend
- ✅ Free tier generous
- ⚠️ Serverless (connection pooling needed)
- ⚠️ Cold starts

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create `vercel.json`** (already created below)

3. **Deploy**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add BETTER_AUTH_SECRET
   vercel env add CORS_ORIGINS
   ```

5. **Done!**

---

### Option 4: Fly.io

**Why Fly.io?**
- ✅ Free tier: 3 shared VMs
- ✅ Global edge network
- ✅ Good performance

**Steps:**

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Launch App**
   ```bash
   cd backend
   flyctl launch
   ```

4. **Set Secrets**
   ```bash
   flyctl secrets set DATABASE_URL="<your-neon-url>"
   flyctl secrets set BETTER_AUTH_SECRET="<secret>"
   flyctl secrets set CORS_ORIGINS='["https://your-frontend.vercel.app"]'
   ```

5. **Deploy**
   ```bash
   flyctl deploy
   ```

---

## Quick Comparison

| Platform | Free Tier | Setup Difficulty | Cold Start | Best For |
|----------|-----------|------------------|------------|----------|
| **Railway** | 500hrs/month | ⭐⭐⭐⭐⭐ Easiest | Fast | **Recommended** |
| **Render** | 750hrs/month | ⭐⭐⭐⭐ Easy | Slow | Budget-friendly |
| **Vercel** | Generous | ⭐⭐⭐ Medium | Slow | Same as frontend |
| **Fly.io** | 3 VMs | ⭐⭐⭐ Medium | Fast | Global apps |

---

## Post-Deployment Checklist

After deployment, verify:

- [ ] Health endpoint works: `curl https://your-api.com/health`
- [ ] Database migrations ran: Check logs for "alembic upgrade head"
- [ ] Environment variables set correctly
- [ ] Frontend can connect to API
- [ ] CORS configured with frontend URL
- [ ] Authentication works (test signup/login)
- [ ] Tasks CRUD operations work

---

## Troubleshooting

### Error: Database connection failed
- Check DATABASE_URL format: `postgresql://user:pass@host.neon.tech/db?sslmode=require`
- Verify Neon database is accessible from internet

### Error: CORS policy
- Add frontend URL to CORS_ORIGINS: `["https://your-frontend.vercel.app"]`
- Format must be JSON array string

### Error: 401 Unauthorized
- Verify BETTER_AUTH_SECRET matches between frontend and backend
- Check JWT token is being sent in Authorization header

### Error: Module not found
- Ensure all dependencies in requirements.txt
- Check Python version is 3.11+

---

## Environment Variables Reference

```bash
# Required
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
BETTER_AUTH_SECRET=your-32-byte-secret-here

# Optional
CORS_ORIGINS=["https://your-frontend.vercel.app"]
DEBUG=false
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=1
```

---

## Monitoring

### Railway
- Logs: Railway dashboard → Deployments → Logs
- Metrics: Dashboard → Metrics tab

### Render
- Logs: Render dashboard → Logs
- Metrics: Dashboard → Metrics tab

### Health Check
```bash
# Check API is alive
curl https://your-api.com/health

# Expected response:
{
  "status": "healthy",
  "version": "2.0.0"
}
```

---

## Updating Deployment

### Railway / Render
Just push to GitHub:
```bash
git add .
git commit -m "Update API"
git push origin master
```

Auto-deploys! 🚀

### Vercel
```bash
vercel --prod
```

---

## Cost Estimates

**Free Tier Usage:**
- Railway: $5/month credit → ~500 hours
- Render: 750 hours/month
- Vercel: 100GB bandwidth/month
- Fly.io: 3 shared VMs

**For this Todo app:** All free tiers are sufficient! 🎉

---

## Next Steps

1. Deploy backend to Railway (easiest)
2. Get API URL: `https://your-app.railway.app`
3. Update frontend `.env.local` with API URL
4. Deploy frontend to Vercel
5. Update CORS_ORIGINS in backend with frontend URL
6. Test end-to-end!

**Recommended Flow:**
1. Backend → Railway
2. Frontend → Vercel
3. Database → Neon (already set up)

All three have free tiers and work perfectly together! 🚀
