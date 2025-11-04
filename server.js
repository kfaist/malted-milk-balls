const express = require("express");
const path = require("path");
const http = require("http");
const { AccessToken } = require('livekit-server-sdk');

const PORT = process.env.PORT || 3000;
const app = express();

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const LIVEKIT_ROOM_NAME = process.env.LIVEKIT_ROOM_NAME || 'claymation-live';

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Participant token - can BOTH publish and subscribe
app.get("/api/participant-token", async (req, res) => {
  try {
    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return res.status(500).json({
        error: 'LiveKit not configured',
        message: 'Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL'
      });
    }
    
    const participantIdentity = `user-${Math.random().toString(36).substring(7)}`;
    const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: participantIdentity,
      ttl: '2h',
    });
    
    token.addGrant({
      roomJoin: true,
      room: LIVEKIT_ROOM_NAME,
      canSubscribe: true,  // Can receive processed video
      canPublish: true,    // Can send camera/mic
    });
    
    const jwt = await token.toJwt();
    
    res.json({
      token: jwt,
      url: LIVEKIT_URL,
      roomName: LIVEKIT_ROOM_NAME,
      identity: participantIdentity
    });
  } catch (error) {
    console.error('[token] Error:', error);
    res.status(500).json({ error: 'Token generation failed' });
  }
});

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Listening on :${PORT}`);
  console.log(`[server] Claymation Mirror: /`);
  if (LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_URL) {
    console.log(`[server] LiveKit configured for room: ${LIVEKIT_ROOM_NAME}`);
  } else {
    console.log(`[server] WARNING: LiveKit not configured!`);
  }
});
