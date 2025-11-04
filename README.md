# Malted Milk Balls - Claymation Live Stream

Beautiful LiveKit-powered streaming viewer with elegant design.

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
set LIVEKIT_API_KEY=APITw2Yp2Tv3yfg
set LIVEKIT_API_SECRET=eVYY0UB69XDGLiGzclYuGUhXuVpc8ry3YcazimFryDW
set LIVEKIT_URL=wss://claymation-transformation-uxcmrb4f.livekit.cloud
set LIVEKIT_ROOM_NAME=claymation-live
```

3. Start server:
```bash
npm start
```

4. Open browser: http://localhost:3000

## Deploy to Railway (NEW Deployment)

See RAILWAY-DEPLOY.md for complete instructions.

## Project Structure

- `index.html` - Main viewer page
- `styles.css` - Beautiful black/green styling
- `stream.js` - LiveKit client connection
- `server.js` - Express backend with token generation
- `package.json` - Dependencies

## Technology

- LiveKit Cloud for streaming
- Express.js backend
- Modern WebRTC
- Beautiful responsive design
