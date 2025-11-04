# HANDOFF PROMPT - Claymation Mirror LiveKit + TouchDesigner Integration

## 🎯 PROJECT GOAL
Create a real-time video processing loop:
User Camera → LiveKit → TouchDesigner (processing) → LiveKit → User sees transformed video

---

## ✅ WHAT'S WORKING

1. **Web Application (Railway)**
   - URL: https://malted-milk-balls-production.up.railway.app/
   - User can connect via phone/browser
   - Camera publishing TO LiveKit works perfectly
   - User sees their own camera feed

2. **TouchDesigner**
   - NDI output is working
   - Processing pipeline ready
   - Running on local machine

3. **GitHub Repository**
   - Repo: https://github.com/kfaist/malted-milk-balls
   - Auto-deploys to Railway on push to main branch
   - Located locally at: C:\Users\krista-showputer\Desktop\malted-milk-balls

---

## ❌ CURRENT PROBLEM

**The video-only page (for OBS/TouchDesigner) shows BLACK SCREEN**

The page at `/video-only.html` is supposed to receive the user's camera stream from LiveKit, but it's not displaying video even though:
- The user's phone shows their camera working fine
- The LiveKit connection succeeds
- Debug shows "Connected to room!"

**The issue:** When video-only.html connects, it needs to find and subscribe to EXISTING video tracks that were published BEFORE it joined. The current code handles NEW tracks but not existing ones.

**Last push:** Added code to check `room.remoteParticipants` after connecting, but this hasn't been deployed/tested yet.

---

## 🔑 CREDENTIALS

### LiveKit Cloud
```
URL: wss://claymation-transcription-l6e51sws.livekit.cloud
API Key: APITw2Yp2Tv3yfg
API Secret: eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW
Room Name: claymation-live
```

### Railway Environment Variables (already set)
```
LIVEKIT_API_KEY=APITw2Yp2Tv3yfg
LIVEKIT_API_SECRET=eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW
LIVEKIT_URL=wss://claymation-transcription-l6e51sws.livekit.cloud
LIVEKIT_ROOM_NAME=claymation-live
```

---

## 📁 KEY FILES

### Main Application
- `index.html` - Main user interface (works!)
- `stream.js` - Handles camera capture and LiveKit connection
- `video-only.html` - OBS/TD viewer (NEEDS FIX)
- `server.js` - Express server, serves static files, generates LiveKit tokens
- `styles.css` - Styling

### Server Endpoints
- `GET /` - Main page
- `GET /video-only.html` - Video-only viewer for OBS
- `GET /api/participant-token` - Generates LiveKit access token

---

## 🏗️ ARCHITECTURE

```
┌─────────────────┐
│  User's Phone   │
│   (Browser)     │
└────────┬────────┘
         │ Publishes video
         ▼
┌─────────────────┐
│   LiveKit Room  │
│ "claymation-    │
│      live"      │
└────────┬────────┘
         │ Should receive video but doesn't
         ▼
┌─────────────────┐
│  video-only.html│ ◄── BROKEN
│   (in OBS)      │
└────────┬────────┘
         │ NDI Out
         ▼
┌─────────────────┐
│  TouchDesigner  │
│   (Processing)  │
│   NDI In/Out    │ ◄── WORKING
└────────┬────────┘
         │ Need to send back
         ▼
    LiveKit Room
         │
         ▼
   User sees result
```

---

## 🔧 IMMEDIATE NEXT STEPS

1. **Push the latest fix to GitHub:**
   ```bash
   cd C:\Users\krista-showputer\Desktop\malted-milk-balls
   git add video-only.html
   git commit -m "Fix: Check for existing tracks on connection"
   git push
   ```

2. **Wait 2 minutes for Railway to deploy**

3. **Test the fix:**
   - Connect phone to main page first
   - Then refresh OBS browser source with video-only.html
   - Check debug overlay - should say "Found: user-xxxxx"
   - Video should appear

4. **If still broken, try alternative approach:**
   - Use LiveKit's `room.on('trackPublished')` event
   - Or manually iterate through `participant.audioTracks` and `participant.videoTracks`
   - Or subscribe explicitly with `participant.setTrackEnabled()`

---

## 🐛 DEBUGGING

### Check deployment logs:
Railway → malted-milk-balls service → View logs

### Test in browser console:
```javascript
// On video-only.html page
console.log('Room:', room);
console.log('Remote participants:', room.remoteParticipants);
room.remoteParticipants.forEach((p, identity) => {
    console.log('Participant:', identity);
    console.log('Tracks:', p.trackPublications);
});
```

### Common issues:
- Token expired (server generates fresh ones each time)
- Wrong room name (should be "claymation-live")
- Tracks not subscribed (check `publication.subscribed`)
- Video element not attaching properly

---

## 📚 REFERENCE DOCS

- LiveKit JS SDK: https://docs.livekit.io/client-sdk-js/
- Tutorial we used: https://derivative.ca/community-post/tutorial/irl-stream-touchdesigner/65038
- LiveKit Room events: https://docs.livekit.io/client-sdk-js/classes/Room.html

---

## 🎨 TOUCHDESIGNER INTEGRATION (TODO)

Once video-only.html works in OBS:

1. **OBS receives video** from video-only.html
2. **OBS outputs to NDI** (using obs-ndi plugin)
3. **TouchDesigner receives** via NDI In TOP
4. **Process video** (effects/claymation)
5. **TouchDesigner outputs** via NDI Out TOP (WORKING)
6. **Need to bridge NDI → LiveKit** to complete the loop

Options for step 6:
- OBS captures NDI from TD, uses LiveKit output
- Python script using livekit-api to publish from NDI
- Custom Node.js script with livekit-server-sdk

---

## 💡 ALTERNATIVE SOLUTIONS

If video-only.html continues to have issues:

### Option A: Direct WebRTC in OBS
Use OBS Browser Source to load the main page, but crop/hide everything except the video

### Option B: NDI Bridge Both Ways
- User → NDI Webcam Chrome extension → TD
- TD → NDI Out → OBS → LiveKit

### Option C: Python LiveKit SDK in TouchDesigner
Write Python CHOP/DAT in TD to connect directly to LiveKit using livekit-api

---

## 📞 WHERE WE LEFT OFF

User said: "it would snap a still of me now its just black but video feed showing myself on my phone is fine"

Meaning:
- Phone camera feed works
- Video-only.html used to show a still frame briefly
- Now shows black screen
- Just pushed fix to check for existing remote participants
- Needs testing after Railway deployment

**The fix is in the latest commit, needs to be deployed and tested.**

---

## 🚀 TO RESUME

Say: "I'm continuing the Claymation Mirror LiveKit project. The video-only.html page shows black screen in OBS even though the user's phone camera is working. Last step was pushing a fix to check for existing remote participants. Can you help me test if the latest deployment fixed it?"

The assistant should:
1. Check if Railway deployed the latest commit
2. Test video-only.html with phone already connected
3. If still broken, debug the LiveKit track subscription
4. Get video displaying in OBS
5. Then work on completing the loop back to LiveKit

---

END OF HANDOFF
