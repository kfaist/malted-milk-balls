# RAILWAY DEPLOYMENT - QUICK STEPS

## STATUS: Code is pushed to GitHub! ✅

Repository: https://github.com/kfaist/malted-milk-balls

---

## RAILWAY DEPLOYMENT (5 minutes)

### In the Railway tab I just opened:

1. **Click "Deploy from GitHub repo"**

2. **Select repository:** `kfaist/malted-milk-balls`

3. **Railway will auto-detect and start building**

4. **Add Environment Variables:**
   Click on your deployment → "Variables" tab → Add these:

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

5. **Generate Public Domain:**
   Settings tab → "Domains" → "Generate Domain"

6. **Your site will be LIVE!** 🎉

---

## COPY-PASTE READY (for Railway Variables):

Variable 1:
```
LIVEKIT_API_KEY
```
Value 1:
```
APITw2Yp2Tv3yfg
```

Variable 2:
```
LIVEKIT_API_SECRET
```
Value 2:
```
eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW
```

Variable 3:
```
LIVEKIT_URL
```
Value 3:
```
wss://claymation-transformation-uxcmrb4f.livekit.cloud
```

Variable 4:
```
LIVEKIT_ROOM_NAME
```
Value 4:
```
claymation-live
```

---

## WHAT TO EXPECT:

- Build time: ~2 minutes
- After adding variables, Railway will redeploy automatically
- Generated URL will look like: `malted-milk-balls-production-xxxx.up.railway.app`

---

## THEN TEST:

1. Visit your Railway URL
2. Click "Start Experience"
3. Allow camera/microphone
4. You should see:
   - LEFT panel: Your camera
   - RIGHT panel: Waiting for TouchDesigner...

---

**I've opened Railway for you - just follow the steps above!** 🚀
