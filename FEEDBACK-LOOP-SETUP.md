# 🔄 COMPLETE FEEDBACK LOOP - Show Processed Video to Viewer

Your viewer will see TWO panels:
- **LEFT:** Their camera (what they send)
- **RIGHT:** Processed claymation (what TouchDesigner creates)

## 🎯 OPTIONS TO DISPLAY NDI OUTPUT IN BROWSER

### OPTION 1: OBS + OBS-WEBSOCKET-JS (Easiest, Local Only)
**For local installations where OBS is on same computer**

1. Add NDI source to OBS scene:
   - Sources → Add → NDI Source
   - Select "TouchDesigner" from dropdown
   
2. Use OBS Virtual Camera:
   - Start Virtual Camera in OBS
   - Add another browser source that captures virtual camera
   - Won't work for remote viewers ❌

### OPTION 2: OBS + RTMP Streaming (Best for Web)
**Stream processed output that browser can watch**

1. **Setup OBS RTMP Output:**
   - Install nginx-rtmp on your server OR use a service
   - OBS → Settings → Stream
   - Service: Custom
   - Server: `rtmp://your-server/live`
   - Stream Key: `claymation`

2. **Update auto-camera.html to watch stream:**
   ```javascript
   // In processedVideo setup:
   processedVideo.src = 'https://your-server/hls/claymation.m3u8';
   ```

**Services that make this easy:**
- **Mux.com** - Simple RTMP → HLS
- **AWS IVS** - Low latency streaming
- **Restream.io** - RTMP relay service

### OPTION 3: NDI-WebRTC Bridge (Medium Complexity)
**Convert NDI to WebRTC for browser viewing**

Use: **NDI-WebRTC-Bridge** (open source)
- https://github.com/neilyoung/NDI-WebRTC-Bridge

1. Install on your computer
2. Configure to receive TouchDesigner NDI
3. Browser connects via WebRTC
4. Updates needed in server.js

### OPTION 4: TouchDesigner Web Client DAT (Simplest!)
**TouchDesigner can serve video directly to browsers**

1. **In TouchDesigner:**
   - Add **Web Client DAT**
   - Set to Server mode
   - Port: 9980
   - Connect your NDI Out to it

2. **Update auto-camera.html:**
   ```javascript
   processedVideo.src = 'http://localhost:9980/video';
   ```

3. **For remote access:**
   - Expose port 9980
   - Use ngrok: `ngrok http 9980`
   - Update with ngrok URL

---

## 🚀 RECOMMENDED SETUP (Easiest to Start)

### PHASE 1: Local Testing (5 minutes)
1. Use **Option 4** - TouchDesigner Web Client DAT
2. Viewer sees their camera + placeholder for processed video
3. Test that camera → OBS → NDI → TD works

### PHASE 2: Add Feedback (10 minutes)
1. Add Web Client DAT in TouchDesigner
2. Update processedVideo.src to TD web server
3. Now viewer sees processed output!

### PHASE 3: Deploy for Real Use
1. Use **Option 2** - RTMP streaming
2. OBS streams processed output to cloud
3. Browser watches HLS stream
4. Works for remote viewers!

---

## 📋 QUICK START - TouchDesigner Web Client Method

### In TouchDesigner:

1. Add **Web Client DAT** to your network
2. Set parameters:
   ```
   Server/Client: Server
   Port: 9980
   Protocol: HTTP
   ```

3. Add **Web Server DAT**:
   ```
   Port: 9980
   Custom Pages: Enable
   ```

4. Add **Movie File Out TOP**:
   - Connect your final claymation output
   - Format: h264/mjpeg
   - Output to web server

### Update Your Browser:

Add this to `auto-camera.html` (line 124):
```javascript
// After camera starts, try to connect to TD output
setTimeout(() => {
    processedVideo.src = 'http://localhost:9980/video.mjpg';
    processedVideo.play().catch(err => {
        console.log('Waiting for TouchDesigner stream...');
    });
}, 2000);
```

---

## 🎨 TESTING THE FULL LOOP

1. **Start TouchDesigner** with your claymation .toe file
2. **Start OBS** with Browser Source pointing to auto-camera.html
3. **Run server**: `npm start`
4. **Visit in browser**: `http://localhost:3000/auto-camera.html`
5. **Allow camera**
6. **Watch:**
   - LEFT panel: Your camera (going to OBS)
   - RIGHT panel: Processed output (from TouchDesigner)

---

## 💡 ADVANCED: Full Cloud Deployment

For viewers anywhere in the world:

```
User Browser
    ↓ (camera via WebRTC)
Railway Server
    ↓ (forward to OBS webhook)
Your Computer OBS
    ↓ (NDI)
TouchDesigner Processing
    ↓ (RTMP stream)
Cloud Streaming Service (Mux/AWS)
    ↓ (HLS playback)
User Browser (right panel)
```

**Required services:**
- Railway (hosting, free tier) ✓ You have this
- Mux.com or AWS IVS (streaming, ~$50/mo)
- Your computer running TD + OBS

---

## 🔧 WHICH OPTION SHOULD YOU USE?

**For art gallery / installation (local network):**
→ **Option 4** - TouchDesigner Web Client DAT
- Simplest
- No cloud costs
- Low latency

**For online exhibition / remote viewers:**
→ **Option 2** - RTMP streaming to cloud
- Works anywhere
- Scalable
- Professional quality

**For maximum control / custom needs:**
→ **Option 3** - NDI-WebRTC bridge
- Direct streaming
- Low latency
- More technical setup

---

## 📝 NEXT STEPS

1. Choose your option based on use case
2. Test locally with Option 4 first
3. Scale up to Option 2 for production
4. Update the `auto-camera.html` to point to your stream!

Want me to help you set up one of these options? Let me know which sounds best! 🎯
