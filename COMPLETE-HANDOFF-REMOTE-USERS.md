# 🎨 CLAYMATION MIRROR - REMOTE USER SYSTEM
## HANDOFF PROMPT FOR CONTINUATION

---

## 🎯 PROJECT GOAL

Create a web-based interactive art experience where:
1. **Remote user** visits website → camera starts automatically
2. **User's video** streams to **artist's OBS** (wherever artist is located)
3. **Artist's TouchDesigner** processes video with StreamDiffusion claymation
4. **Processed video** streams back to **user's browser** in real-time
5. **Audio transcription** extracts keywords to influence the generation

**Artist:** Krista (VR/AI artist, dyslexia - needs complete step-by-step instructions)
**Current Status:** Local prototype working, need production remote user architecture

---

## ✅ WHAT'S ALREADY WORKING

### Local Testing Setup:
- ✅ TouchDesigner claymation generation with StreamDiffusion
- ✅ NDI output from TouchDesigner to OBS working perfectly
- ✅ Python transcription script (`transcribe_to_udp_compound_v10_fixA_concrete.py`)
  - Whisper for speech-to-text
  - spaCy for concrete noun extraction
  - Sends P5 (keywords) and P6 (full transcript) via UDP to TouchDesigner
- ✅ Railway deployment configured (Node.js server)
- ✅ GitLab repository: malted-milk-balls
- ✅ Basic web interface (`auto-camera.html`) with split-screen view

### Current Files in Project:
```
malted-milk-balls/
├── server.js                    # Node.js server (needs WebRTC added)
├── auto-camera.html            # Browser interface (split-screen)
├── obs-viewer.html             # Attempted OBS display page
├── package.json                # Dependencies (needs WebRTC libraries)
├── railway.json                # Railway deployment config
├── OBS-AUTO-SETUP.md          # Current setup docs
├── FEEDBACK-LOOP-SETUP.md     # TouchDesigner feedback options
└── (Python transcription files separate, not in this repo)
```

---

## 🚨 CURRENT PROBLEM

**Issue:** OBS Browser Sources are sandboxed and cannot access user cameras directly.

**Attempted Fix:** Browser Source pointing to `auto-camera.html` - FAILS with "Camera Error"

**Root Cause:** Browser security prevents camera access in embedded/sandboxed contexts.

**What's Needed:** Complete WebRTC media relay architecture for remote users.

---

## 🏗️ REQUIRED ARCHITECTURE

### Complete Data Flow:

```
┌─────────────────┐
│  REMOTE USER    │
│   (Browser)     │
│                 │
│  📹 Camera      │
│  🎤 Microphone  │
└────────┬────────┘
         │ WebRTC Stream
         ↓
┌─────────────────────────┐
│  RAILWAY SERVER         │
│  (Node.js)              │
│                         │
│  WebRTC Signaling       │
│  Media Relay/Forward    │
│  (Janus/mediasoup)      │
└────────┬────────────────┘
         │ Forwarded Stream
         ↓
┌─────────────────────────┐
│  ARTIST'S COMPUTER      │
│                         │
│  ┌─────────────────┐   │
│  │   OBS STUDIO    │   │
│  │  (Browser Src)  │   │
│  └────────┬────────┘   │
│           │ NDI         │
│           ↓             │
│  ┌─────────────────┐   │
│  │ TOUCHDESIGNER   │   │
│  │  StreamDiffusion│   │
│  │  + Transcription│   │
│  └────────┬────────┘   │
│           │ NDI Out     │
│           ↓             │
│  ┌─────────────────┐   │
│  │  OBS STUDIO     │   │
│  │  (Capture NDI)  │   │
│  └────────┬────────┘   │
│           │ RTMP/HLS    │
└───────────┼─────────────┘
            │ Stream to Cloud
            ↓
┌─────────────────────────┐
│  STREAMING SERVICE      │
│  (Mux / AWS IVS)        │
└────────┬────────────────┘
         │ HLS Playback
         ↓
┌─────────────────┐
│  REMOTE USER    │
│   (Browser)     │
│                 │
│  👀 Watches     │
│  Processed Feed │
└─────────────────┘
```

---

## 🛠️ IMPLEMENTATION PLAN

### PHASE 1: WebRTC Media Relay (CRITICAL - DO FIRST)

**Goal:** Get remote user's camera into artist's OBS

**Option A: Janus Gateway (Recommended)**
- Open source WebRTC server
- Can relay streams to multiple destinations
- Artist's OBS connects as WebRTC client

**Option B: mediasoup**
- More modern, better performance
- Requires more Node.js expertise
- Selective Forwarding Unit (SFU) architecture

**Option C: Simple WHIP/WHEP**
- WebRTC-HTTP Ingestion Protocol
- Simpler, standardized
- Services: Cloudflare Stream, Mux

**Implementation Steps:**
1. Add WebRTC signaling to `server.js`
2. User browser sends WebRTC offer
3. Server creates peer connection
4. Forward stream to OBS-compatible endpoint
5. Artist's OBS receives via Browser Source (no camera needed, just playback)

### PHASE 2: Transcription Integration

**Goal:** Get user's audio transcribed and sent to TouchDesigner

**Current System:**
- Python script runs locally
- Receives audio via microphone input
- Sends keywords via UDP to TouchDesigner port 8020

**Needed Changes:**
1. Receive audio from WebRTC stream (not microphone)
2. Run transcription server on Railway or separate service
3. Send keywords to TouchDesigner via:
   - WebSocket (if TD is cloud-accessible)
   - OR relay through artist's computer via websocket bridge

### PHASE 3: Return Stream to User

**Goal:** User sees their transformed self in real-time

**Current Options Documented:**
- See `FEEDBACK-LOOP-SETUP.md` for 4 different approaches
- Recommended: RTMP streaming to Mux.com → HLS playback in browser

**Implementation:**
1. OBS captures NDI output from TouchDesigner
2. OBS streams to RTMP endpoint (Mux/AWS IVS)
3. Service converts to HLS
4. User's browser plays HLS stream in right panel

---

## 📋 SPECIFIC TECHNICAL TASKS

### TASK 1: Add WebRTC to server.js

**Dependencies to add:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "obs-websocket-js": "^5.0.3",
    "ws": "^8.14.2",
    "wrtc": "^0.4.7",              // NEW: WebRTC for Node.js
    "simple-peer": "^9.11.1"       // NEW: Simplified WebRTC
  }
}
```

**Server modifications needed:**
1. WebRTC signaling endpoints:
   - POST `/api/offer` - Receive WebRTC offer from user
   - POST `/api/answer` - Send WebRTC answer back
   - WebSocket `/ws-signal` - ICE candidate exchange

2. Media forwarding:
   - Receive user's video/audio tracks
   - Package as viewable stream
   - Make available at `/stream/user.mjpeg` or similar
   - OBS Browser Source loads this URL

### TASK 2: Update auto-camera.html for WebRTC

**Current:** Tries to show local camera directly (fails in OBS)

**Needed:** Send camera to server via WebRTC

```javascript
// Pseudocode for user browser:
const peerConnection = new RTCPeerConnection();
const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

stream.getTracks().forEach(track => {
    peerConnection.addTrack(track, stream);
});

const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send offer to server
const response = await fetch('/api/offer', {
    method: 'POST',
    body: JSON.stringify({ offer: offer })
});

const { answer } = await response.json();
await peerConnection.setRemoteDescription(answer);
```

### TASK 3: Create OBS Viewer Page

**New file:** `obs-viewer-stream.html`

This page OBS Browser Source will load:
- NO camera access needed (just displays stream)
- Connects to server's forwarded stream
- Shows live video from remote user
- Updates automatically when new users connect

```html
<!-- Simplified structure -->
<video id="userStream" autoplay></video>
<script>
    // Connect to server's media stream
    const video = document.getElementById('userStream');
    video.src = '/stream/latest';  // Server endpoint
</script>
```

### TASK 4: Audio Transcription Pipeline

**Challenge:** Get audio from browser → transcription → TouchDesigner

**Solution A: Cloud Transcription (Easier)**
1. User's audio stream sent to Railway
2. Railway runs Whisper transcription
3. Keywords sent via WebSocket to artist's computer
4. Artist's computer forwards to TouchDesigner UDP

**Solution B: Local Transcription (Current setup)**
1. User's audio stream sent to Railway  
2. Railway forwards audio to artist's computer
3. Artist runs Python transcription script locally
4. Keywords sent to TouchDesigner via UDP (already working)

**Recommended:** Start with Solution B (minimal changes to working transcription)

### TASK 5: Return Stream Setup

**Using Mux.com (Simplest):**

1. Sign up for Mux account
2. Get RTMP credentials
3. In OBS: Settings → Stream
   - Server: `rtmp://global-live.mux.com:5222/app`
   - Stream Key: `[from Mux dashboard]`
4. Start streaming in OBS
5. Mux provides HLS playback URL
6. Update `auto-camera.html` right panel to load HLS stream

---

## 🔧 DEVELOPMENT ENVIRONMENT

**Artist's Setup:**
- Windows computer (PowerShell)
- TouchDesigner with StreamDiffusion
- OBS Studio with NDI plugin
- Miniconda with Python environment "aiart"
- Location: `C:\Users\krista-showputer\Desktop\malted-milk-balls`

**Deployment:**
- GitLab repository (NOT GitHub)
- Railway.app for hosting
- Node.js 18+ required
- No Docker (use Nixpacks builder)

**Important for Krista:**
- Provide COMPLETE step-by-step commands
- Include ALL parameters (she has dyslexia, needs explicit steps)
- Test locally before deploying
- Break complex tasks into small chunks

---

## 🎯 IMMEDIATE NEXT STEPS (Priority Order)

### 1. **Test WebRTC Relay Locally (2-4 hours)**
   - Install and run Janus Gateway locally
   - Modify server.js for basic WebRTC signaling
   - Get user camera streaming to server
   - Create viewer page that OBS can load
   - Test: User browser → Server → OBS Browser Source

### 2. **Deploy WebRTC to Railway (1-2 hours)**
   - Add WebRTC dependencies to package.json
   - Push to GitLab
   - Test with remote user (friend on different network)
   - Verify OBS receives stream

### 3. **Integrate Audio Transcription (2-3 hours)**
   - Forward audio from WebRTC stream
   - Connect to existing Python transcription script
   - Test keywords appearing in TouchDesigner

### 4. **Set up Return Stream (1-2 hours)**
   - Configure OBS RTMP streaming
   - Set up Mux or AWS IVS account
   - Update auto-camera.html to show return stream
   - Test full bidirectional loop

### 5. **Polish & Deploy (1-2 hours)**
   - Error handling
   - Loading states
   - Reconnection logic
   - Documentation for running the system

---

## 📚 RESOURCES & REFERENCES

### WebRTC Libraries:
- **Janus Gateway:** https://janus.conf.meetecho.com/
- **mediasoup:** https://mediasoup.org/
- **simple-peer:** https://github.com/feross/simple-peer
- **WHIP/WHEP:** https://www.ietf.org/archive/id/draft-ietf-wish-whip-08.html

### Streaming Services:
- **Mux:** https://mux.com/ (simplest, ~$20/mo)
- **AWS IVS:** https://aws.amazon.com/ivs/ (scalable, more complex)
- **Cloudflare Stream:** https://www.cloudflare.com/products/cloudflare-stream/

### TouchDesigner Resources:
- **NDI Tools:** https://ndi.tv/tools/
- **Web Client DAT:** https://docs.derivative.ca/Web_Client_DAT
- **WebRTC DAT:** https://docs.derivative.ca/WebRTC_DAT (if available in your TD version)

### Current Project Links:
- **Railway Project:** https://railway.com/project/bd63cb55-e6cf-4def-9b37-fd29d7f36605
- **GitLab Repo:** malted-milk-balls (confirm exact URL with Krista)

---

## 🚨 KNOWN ISSUES & BLOCKERS

### Current Blockers:
1. **OBS Browser Source camera access** - RESOLVED (don't use camera in OBS, use forwarded stream)
2. **WebRTC signaling not implemented** - NEXT TASK
3. **No return stream infrastructure** - Needs Mux/AWS setup

### Technical Considerations:
- **Latency:** Aim for <2 second glass-to-glass delay
- **Scalability:** Start with 1 concurrent user, plan for 5-10
- **Bandwidth:** Each user is ~2-5 Mbps upload + download
- **TouchDesigner Performance:** StreamDiffusion is GPU-intensive, monitor frame drops

---

## 💡 ALTERNATIVE ARCHITECTURES (If WebRTC is too complex)

### Plan B: Phone-as-Camera + Desktop App

Instead of browser WebRTC:
1. User downloads phone app (OBS Camera, DroidCam, etc.)
2. App streams to OBS via NDI or RTMP
3. Simpler for artist to set up
4. No WebRTC complexity
5. But requires app install (barrier to entry)

### Plan C: LiveKit Integration (What was started before)

The project originally attempted LiveKit:
- See `index.html` and `stream.js` for old implementation
- Was abandoned due to complexity
- But LiveKit DOES solve the WebRTC relay problem
- Consider revisiting if custom WebRTC is too hard

---

## 📝 QUESTIONS FOR NEXT SESSION

1. **Budget:** What's the monthly budget for streaming services (Mux/AWS)?
2. **Scale:** How many concurrent users needed? (1? 10? 100?)
3. **Exhibition context:** Gallery installation? Online only? Both?
4. **Latency requirements:** Interactive (need <1s)? or viewing experience (2-3s ok)?
5. **Artist availability:** Can Krista run server components locally? Or needs cloud-only?

---

## 🎨 ARTIST CONTEXT (Important!)

**Krista's Background:**
- MFA from Columbus College of Art & Design
- Extensive TouchDesigner & projection mapping experience
- Working on "The Mirror's Echo" - AI projection installation
- Has dyslexia - needs explicit, complete instructions
- Prefers actionable steps over theoretical explanations
- Comfortable with TouchDesigner, needs support with command-line tasks

**Project Context:**
- Part of larger claymation transcription artwork
- Speech → Keywords → Visual generation pipeline
- User sees themselves transformed in real-time
- Combines Whisper AI, spaCy NLP, StreamDiffusion, TouchDesigner
- Seeking exhibition opportunities and funding

**Communication Style:**
- Direct, step-by-step commands
- Include ALL parameters (don't abbreviate)
- Test before suggesting
- Celebrate small wins! 🎉

---

## ✅ SUCCESS CRITERIA

**Phase 1 Complete When:**
- [ ] Remote user visits URL on their phone/computer
- [ ] Their camera stream appears in artist's OBS
- [ ] No "Camera Error" messages
- [ ] Stream is stable for 5+ minutes

**Phase 2 Complete When:**
- [ ] User's speech is transcribed in real-time
- [ ] Keywords appear in TouchDesigner
- [ ] StreamDiffusion generates based on keywords

**Phase 3 Complete When:**
- [ ] Processed video streams back to user's browser
- [ ] User sees themselves transformed in <3 seconds
- [ ] Full bidirectional loop working end-to-end

**Final Success:**
- [ ] System runs unattended for 30+ minutes
- [ ] Multiple users can connect sequentially
- [ ] Artist can monitor but doesn't need to "babysit"
- [ ] Ready for exhibition/public demo

---

## 🔄 HANDOFF CHECKLIST

**Files to Review:**
- [ ] `/Desktop/malted-milk-balls/` - entire project folder
- [ ] `server.js` - current Node.js server
- [ ] `auto-camera.html` - browser interface
- [ ] `package.json` - dependencies
- [ ] All .md documentation files

**Accounts/Credentials Needed:**
- [ ] Railway login (Krista has access)
- [ ] GitLab repo access
- [ ] Mux or AWS IVS account (to be created)
- [ ] LiveKit credentials (if using LiveKit approach)

**Before Starting:**
- [ ] Review this entire handoff prompt
- [ ] Test current deployment on Railway
- [ ] Understand the complete data flow diagram above
- [ ] Ask Krista about budget/scale requirements
- [ ] Decide on WebRTC approach (Janus vs mediasoup vs LiveKit)

---

## 💬 STARTING THE CONVERSATION

**Suggested opening:**

"Hi Krista! I'm picking up where we left off with your claymation mirror project. I've reviewed the handoff documentation and understand you need remote users' cameras to appear in your OBS without the 'Camera Error' issue we were hitting.

The core challenge is that OBS Browser Sources can't access cameras directly. We need to build a WebRTC relay so user cameras stream through your server, then OBS receives that forwarded stream.

Before we dive into implementation, I have a few questions:

1. What's your budget for streaming services? (Mux is ~$20/mo, AWS IVS can scale higher)
2. How many users do you expect at once? Just testing with one? Or multiple for an exhibition?
3. Is this for a physical gallery installation, online experience, or both?
4. Do you have time to help test as we build this, or should I create a complete solution you can deploy all at once?

Let me know and I'll start building the WebRTC relay system!"

---

## 📞 EMERGENCY CONTACTS / RESOURCES

- **Artist:** Krista (Eicos73 on Claude)
- **Location:** Columbus, Ohio / Sarasota, Florida
- **Time Zone:** Eastern Time (ET)
- **Preferred Communication:** Direct, step-by-step, celebrate wins
- **Desktop Commander:** Enabled (use for file operations)

---

**END OF HANDOFF PROMPT**

This document should provide everything needed to continue the project. Good luck! 🚀🎨
