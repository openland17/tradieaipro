# Quick Start - Deploy to Production

## 🚀 Fastest Way to Go Live (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for production"
git branch -M main
git remote add origin https://github.com/openland17/tradieaipro.git
git push -u origin main
```

### Step 2: Deploy on Render (Recommended)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Settings:
   - **Name**: `tradieaipro`
   - **Build Command**: `npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or Starter $7/mo)
5. Environment Variables:
   - `NODE_ENV` = `production`
   - `OPENAI_API_KEY` = `your_key_here` (get from https://platform.openai.com)
6. Click **"Create Web Service"**
7. Wait 5-10 minutes for first build

### Step 3: Connect Your Domain

1. In Render dashboard → Your service → **Settings**
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS:
   - Add **CNAME** record: `www` → `your-app.onrender.com`
   - Or **A record** for root domain (use Render's IP)

**Done!** Your app is live at your domain! 🎉

---

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] OpenAI API key ready (optional but recommended)
- [ ] Domain purchased and DNS access ready
- [ ] Tested locally with `npm run build && npm start`

---

## 🔧 Environment Variables

**Required:**
- `NODE_ENV` = `production`

**Optional (but recommended):**
- `OPENAI_API_KEY` = Your OpenAI API key

**Auto-set by platform:**
- `PORT` = Automatically set by hosting platform

---

## 🧪 Test Your Deployment

After deployment, test these URLs:
- `https://yourdomain.com` - Main app
- `https://yourdomain.com/api/health` - Health check (should return `{"status":"ok"}`)
- `https://yourdomain.com/api/generate` - Test API (POST request)

---

## 💰 Cost Estimate

**Free Tier (Testing):**
- Render: Free (with limitations)
- Railway: $5/month after free credits

**Production (Recommended):**
- Render Starter: **$7/month** (best value)
- Railway Hobby: $5/month + usage

---

## 🆘 Need Help?

1. Check `DEPLOYMENT.md` for detailed instructions
2. Check Render/Railway logs for errors
3. Verify environment variables are set
4. Test locally first: `NODE_ENV=production npm run build && npm start`

---

## 🎯 Next Steps After Going Live

1. ✅ Test all features work
2. ✅ Set up Google Analytics
3. ✅ Add error tracking (Sentry)
4. ✅ Set up monitoring (UptimeRobot - free)
5. ✅ Start marketing! 🚀

Good luck! 🎉

