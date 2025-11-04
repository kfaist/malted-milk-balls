# 🎯 AUTO VIRTUAL CAMERA SETUP - NO BABYSITTING!

This setup makes user video **automatically appear in OBS** when they visit your site.

## HOW IT WORKS:
1. User visits website → camera auto-starts
2. Browser notifies Node server
3. Server tells OBS via WebSocket to refresh
4. Video appears in OBS automatically!

---

## ⚙️ ONE-TIME SETUP (15 minutes)

### STEP 1: Install OBS WebSocket Plugin

1. Download: https://github.com/obsproject/obs-websocket/releases
2. Install obs-websocket (latest version, v5.x)
3. Restart OBS
4. In OBS: Tools → WebSocket Server Settings
   - Enable WebSocket server
   - Port: **4455** (default)
   - Set password (optional) or leave blank
   - Click "Show Connect Info" and note the details

### STEP 2: Configure OBS Scene

1. Create new scene: **"Claymation-Live"**
2. Add Source → Browser
   - Name it: **"User-Camera-Browser"**
   - URL: `http://localhost:3000/auto-camera.html`
   - Width: **1280**
   - Height: **720**
   - FPS: **30**
   - ✅ Check "Refresh browser when scene becomes active"
   - ✅ Check "Shutdown source when not visible"
3. Click OK

### STEP 3: Install Node Dependencies

Open PowerShell in your project folder:

```powershell
cd C:\Users\krista-showputer\Desktop\malted-milk-balls
npm install
```

This installs:
- obs-websocket-js (to control OBS)
- ws (WebSocket server)

### STEP 4: Start Your Server

```powershell
npm start
```

You should see:
```
[server] Listening on :3000
[server] Claymation Mirror: http://localhost:3000
[OBS] Connected to OBS WebSocket ✓
```

---

## 🚀 HOW TO USE

### FOR LOCAL TESTING:
1. Make sure OBS is running
2. Run `npm start` in your project folder
3. User visits: `http://localhost:3000/auto-camera.html`
4. Camera starts automatically
5. **Video appears in OBS Browser Source!**

### FOR DEPLOYED VERSION (Railway):
1. Push to GitLab
2. Railway auto-deploys
3. User visits: `https://your-app.railway.app/auto-camera.html`
4. Camera starts automatically
5. For remote OBS control, set environment variable:
   ```
   OBS_HOST=your-computer-ip:4455
   ```

---

## 📡 CONNECTING TO TOUCHDESIGNER

Once video is in OBS:

### Option A: NDI (What you have working!)
1. In OBS: Filters → NDI Output
2. TouchDesigner: NDI In TOP
3. Done!

### Option B: Spout/Syphon
1. In OBS: Add Spout filter to browser source
2. TouchDesigner: Spout In TOP
3. Done!

### Option C: Virtual Camera
1. In OBS: Start Virtual Camera
2. TouchDesigner: Video Device In TOP → select "OBS Virtual Camera"
3. Done!

---

## 🔧 TROUBLESHOOTING

### "OBS Not connected ✗"
- Make sure OBS is running
- Check obs-websocket plugin is installed
- Verify port 4455 is not blocked
- Check WebSocket password matches (or is empty)

### "Camera not starting"
- Browser needs HTTPS for camera on remote sites
- Railway provides HTTPS automatically
- For local testing, localhost works fine

### "Browser source shows error"
- Check server is running (`npm start`)
- Visit `http://localhost:3000/auto-camera.html` in regular browser first
- Allow camera permission

### "Video laggy in OBS"
- Reduce browser source resolution (try 1280x720 or 854x480)
- Lower FPS to 24 or 30
- Check CPU usage

---

## 🎨 NEXT STEPS

Once video is in OBS:
1. **NDI to TouchDesigner** ✓ (you have this working!)
2. **Apply StreamDiffusion effects** in TouchDesigner
3. **Send back via NDI** to OBS
4. **Stream or record** final output!

---

## 📝 ENVIRONMENT VARIABLES (Optional)

Create `.env` file:
```
PORT=3000
OBS_HOST=localhost:4455
OBS_PASSWORD=your-password-if-set
```

---

## 🚨 IMPORTANT NOTES

- The browser source URL `http://localhost:3000/auto-camera.html` only works when server is running locally
- For production, use your Railway URL in the OBS browser source
- Camera permission must be granted by user (browser security requirement)
- Once permission is granted, camera auto-starts on every page load
- Server automatically tells OBS when new user connects!

**THIS IS THE "NO BABYSITTING" SOLUTION YOU WANTED!** 🎉
