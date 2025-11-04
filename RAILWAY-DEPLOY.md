# Deploy Malted Milk Balls to Railway (NEW PROJECT)

## STEP 1: Create GitHub Repository

```bash
cd C:\Users\krista-showputer\Desktop\malted-milk-balls

# Initialize git
git init
git add .
git commit -m "Initial commit: Malted Milk Balls streaming viewer"

# Create new repo on GitHub
# Go to: https://github.com/new
# Name it: malted-milk-balls
# Description: LiveKit-powered claymation streaming viewer
# Click: Create repository

# Push to GitHub
git remote add origin https://github.com/kfaist/malted-milk-balls.git
git branch -M main
git push -u origin main
```

---

## STEP 2: Create NEW Railway Project

1. Go to https://railway.com
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **malted-milk-balls** repository
5. Railway will auto-detect Node.js and start building

---

## STEP 3: Add Environment Variables

In Railway dashboard:

1. Click on your new deployment
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add these:

```
LIVEKIT_API_KEY
APITw2Yp2Tv3yfg

LIVEKIT_API_SECRET
eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW

LIVEKIT_URL
wss://claymation-transformation-uxcmrb4f.livekit.cloud

LIVEKIT_ROOM_NAME
claymation-live
```

4. Click **"Deploy"** to restart with new variables

---

## STEP 4: Generate Public URL

1. In Railway dashboard, click **"Settings"** tab
2. Under **"Domains"**, click **"Generate Domain"**
3. You'll get a URL like: `malted-milk-balls-production-xxxx.up.railway.app`

---

## STEP 5: Test Your Deployment

