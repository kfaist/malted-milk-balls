# TOUCHDESIGNER LIVEKIT SETUP GUIDE

## YOUR LIVEKIT CREDENTIALS

```
URL: wss://claymation-transcription-l6e51sws.livekit.cloud
API Key: APITw2Yp2Tv3yfg
API Secret: eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW
Room: claymation-live
```

---

## OPTION 1: Web Render TOP Method (EASIEST)

1. **In TouchDesigner, create:**
   - `webrender1` (Web Render TOP)
   - Set URL to: `https://malted-milk-balls-production.up.railway.app/`
   - This will show the full webpage including incoming user video

2. **Extract just the video:**
   - Add a `crop1` (Crop TOP) to isolate the video element
   - Or use `select1` (Select TOP) to grab specific pixels

3. **Process it:**
   - Add your effects (feedback, displace, etc.)

4. **Send back to LiveKit:**
   - This is the tricky part - need to publish back

---

## OPTION 2: Python LiveKit SDK Method (BEST)

### Install LiveKit Python SDK:
```bash
pip install livekit livekit-api
```

### In TouchDesigner:

1. **Create a Video In TOP** to receive from LiveKit
2. **Create Python Script** with this code:

```python
import asyncio
from livekit import rtc

room = None
video_track = None

async def connect_to_livekit():
    global room, video_track
    
    url = "wss://claymation-transcription-l6e51sws.livekit.cloud"
    token = "YOUR_GENERATED_TOKEN"  # Get from your server
    
    room = rtc.Room()
    
    @room.on("track_subscribed")
    def on_track_subscribed(track, publication, participant):
        if track.kind == rtc.TrackKind.KIND_VIDEO:
            print(f"Subscribed to video track from {participant.identity}")
            # Stream frames to TouchDesigner
    
    await room.connect(url, token)
```

---

## OPTION 3: NDI BRIDGE (RECOMMENDED FOR NOW)

This is actually the EASIEST way to get this working NOW:

### A. In Browser (your Railway site):
1. Install [NDI Webcam](https://ndi.tv/tools/ndi-webcam/) Chrome extension
2. Or use OBS with NDI plugin
3. Receive the LiveKit stream in browser
4. Send via NDI

### B. In TouchDesigner:
1. Add `ndiin1` (NDI In TOP)
2. Select your NDI source
3. Process the video
4. Output via `ndiout1` (NDI Out TOP)

### C. Back to Browser:
1. Use NDI to WebRTC bridge
2. Or use OBS to capture NDI and send to LiveKit

---

## QUICK START: Let's use existing tools!

Since TouchDesigner is already running, let me create a simple .toe file that:
1. Receives video (we'll figure out the input)
2. Does cool processing
3. Outputs to NDI

Then we can bridge NDI ↔ LiveKit using OBS or a simple script.

---

Want me to create the TouchDesigner network file for you?
