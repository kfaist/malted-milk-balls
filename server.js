const express = require("express");
const path = require("path");
const http = require("http");
const WebSocket = require('ws');
const OBSWebSocket = require('obs-websocket-js').default;

const PORT = process.env.PORT || 3000;
const OBS_HOST = process.env.OBS_HOST || 'localhost:4455';
const OBS_PASSWORD = process.env.OBS_PASSWORD || '';

const app = express();
const obs = new OBSWebSocket();

// Connect to OBS WebSocket
let obsConnected = false;
(async () => {
  try {
    await obs.connect(`ws://${OBS_HOST}`, OBS_PASSWORD);
    obsConnected = true;
    console.log('[OBS] Connected to OBS WebSocket');
  } catch (error) {
    console.error('[OBS] Failed to connect:', error.message);
    console.log('[OBS] Make sure obs-websocket plugin is installed and OBS is running');
  }
})();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// Endpoint to notify when user connects
app.post("/api/user-connected", async (req, res) => {
  console.log('[API] User connected, triggering OBS scene...');
  
  if (obsConnected) {
    try {
      // Switch to scene with browser source
      await obs.call('SetCurrentProgramScene', { sceneName: 'Claymation-Live' });
      console.log('[OBS] Switched to Claymation-Live scene');
      
      // Refresh browser source to show new user
      await obs.call('PressInputPropertiesButton', {
        inputName: 'User-Camera-Browser',
        propertyName: 'refreshnocache'
      });
      console.log('[OBS] Refreshed browser source');
      
      res.json({ success: true, obs: 'activated' });
    } catch (error) {
      console.error('[OBS] Error:', error.message);
      res.json({ success: true, obs: 'error', message: error.message });
    }
  } else {
    console.log('[OBS] Not connected, user video will still work in browser');
    res.json({ success: true, obs: 'not_connected' });
  }
});

const server = http.createServer(app);

// WebSocket for real-time signaling
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('[WS] Client connected');
  
  ws.on('message', (message) => {
    // Relay messages between clients if needed
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
  
  ws.on('close', () => {
    console.log('[WS] Client disconnected');
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] Listening on :${PORT}`);
  console.log(`[server] Claymation Mirror: http://localhost:${PORT}`);
  console.log(`[server] OBS WebSocket: ${obsConnected ? 'Connected ✓' : 'Not connected ✗'}`);
});
