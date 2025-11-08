# Deployment Guide - TradieAI Pro

This guide will help you deploy TradieAI Pro to production. We'll use **Render** (recommended) or **Railway** as they're both excellent for Node.js apps.

## Prerequisites

- GitHub account (to host your code)
- OpenAI API key (optional, but recommended for AI features)
- Domain name (you mentioned you'll handle this)

## Option 1: Deploy to Render (Recommended)

Render is free to start and very easy to use.

### Step 1: Push Code to GitHub

1. Create a new repository on GitHub (name it `tradieaipro` or your preferred name)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/openland17/tradieaipro.git
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `tradieaipro` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or choose a paid plan for better performance)

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically, but good to have)
   - `OPENAI_API_KEY` = `your_openai_api_key_here` (optional but recommended)

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes first time)

### Step 3: Connect Your Domain

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed by Render:
   - Add a CNAME record pointing to your Render URL
   - Or add an A record if using root domain

Your app will be live at your domain!

---

## Option 2: Deploy to Railway

Railway is another great option with a free tier.

### Step 1: Push Code to GitHub

Same as Render - push your code to GitHub.

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign up/login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the build settings (we've included `railway.json`)
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `OPENAI_API_KEY` = `your_openai_api_key_here` (optional)

6. Railway will automatically deploy

### Step 3: Connect Your Domain

1. In Railway dashboard, go to your service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

---

## Option 3: Deploy to Fly.io

Fly.io is great for global deployment.

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login and Deploy

```bash
fly auth login
fly launch
```

Follow the prompts. Fly.io will create a `fly.toml` file.

### Step 3: Set Environment Variables

```bash
fly secrets set NODE_ENV=production
fly secrets set OPENAI_API_KEY=your_key_here
```

### Step 4: Deploy

```bash
fly deploy
```

---

## Environment Variables

Required:
- `NODE_ENV` = `production`

Optional but Recommended:
- `OPENAI_API_KEY` = Your OpenAI API key (get from https://platform.openai.com/api-keys)
- `PORT` = Usually set automatically by hosting platform

---

## Post-Deployment Checklist

- [ ] Test quote generation at your domain
- [ ] Test saving and sharing quotes
- [ ] Verify API endpoints work (`/api/generate`, `/api/save`, `/api/share/:slug`)
- [ ] Check that static files (CSS, JS) load correctly
- [ ] Test on mobile devices
- [ ] Set up monitoring (optional but recommended)

---

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+ (Render/Railway usually handle this)
- Check build logs for specific errors

### App Doesn't Load

- Verify `NODE_ENV=production` is set
- Check that client build completed (`client/dist` folder exists)
- Ensure start command is `cd server && npm start`

### API Errors

- Check that `OPENAI_API_KEY` is set correctly (if using AI features)
- Verify CORS is enabled (should be fine, we have it in code)
- Check server logs for errors

### Static Files Not Loading

- Verify the build created `client/dist` folder
- Check that static file serving is working (should be automatic)
- Clear browser cache

---

## Cost Estimates

**Free Tier (Good for Testing):**
- Render: Free tier available (with limitations)
- Railway: $5/month after free credits
- Fly.io: Free tier available

**Production (Recommended):**
- Render Starter: $7/month
- Railway Hobby: $5/month + usage
- Fly.io: Pay as you go (~$2-5/month for small traffic)

---

## Next Steps After Deployment

1. **Set up analytics** (Google Analytics, Plausible, etc.)
2. **Add error tracking** (Sentry, Rollbar)
3. **Set up monitoring** (UptimeRobot for free monitoring)
4. **Configure backups** (if using database later)
5. **Set up SSL** (usually automatic on these platforms)

---

## Support

If you run into issues:
1. Check the deployment platform's logs
2. Verify environment variables are set correctly
3. Test locally first with `NODE_ENV=production npm run build && npm start`

Good luck with your launch! 🚀

