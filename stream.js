/* Malted Milk Balls - Interactive LiveKit Stream Client */

// Check if LiveKit is loaded
if (typeof LivekitClient === 'undefined') {
    console.error('LiveKit client library not loaded!');
    alert('Error loading LiveKit. Please refresh the page.');
}

let room = null;
let isConnected = false;
let localVideoTrack = null;
let localAudioTrack = null;

const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const videoOverlay = document.getElementById('videoOverlay');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// Update status display
function updateStatus(message, state = 'ready') {
    statusText.textContent = message;
    statusIndicator.className = 'status-indicator ' + state;
}

// Connect to LiveKit - BIDIRECTIONAL
async function joinStream() {
    joinBtn.disabled = true;
    updateStatus('Requesting camera access...', 'connecting');
    
    try {
        // Get user's camera and microphone
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        updateStatus('Camera granted! Connecting to LiveKit...', 'connecting');
        
        // Get participant token from server
        const response = await fetch('/api/participant-token');
        if (!response.ok) {
            throw new Error('Failed to get access token');
        }
        
        const data = await response.json();
        
        // Create LiveKit room
        room = new LivekitClient.Room({
            adaptiveStream: true,
            dynacast: true
        });
        
        // Handle incoming video tracks (the processed stream from TouchDesigner)
        room.on(LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log('Received track from TouchDesigner:', track.kind);
            
            if (track.kind === LivekitClient.Track.Kind.Video) {
                const element = track.attach();
                remoteVideo.srcObject = element.srcObject;
                videoOverlay.classList.add('hidden');
                updateStatus('Connected! Seeing your transformed self...', 'connected');
            } else if (track.kind === LivekitClient.Track.Kind.Audio) {
                track.attach();
            }
        });
        
        // Handle track unsubscription
        room.on(LivekitClient.RoomEvent.TrackUnsubscribed, (track) => {
            track.detach();
            if (track.kind === LivekitClient.Track.Kind.Video) {
                updateStatus('Processing paused...', 'connecting');
            }
        });
        
        // Handle disconnection
        room.on(LivekitClient.RoomEvent.Disconnected, () => {
            if (isConnected) {
                updateStatus('Disconnected from server', 'error');
                leaveStream();
            }
        });
        
        // Connect to room
        await room.connect(data.url, data.token);
        isConnected = true;
        
        // Show local video preview
        localVideo.srcObject = stream;
        
        // Publish camera and microphone to LiveKit (for TouchDesigner to receive)
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        
        localVideoTrack = await room.localParticipant.publishTrack(
            videoTrack,
            { name: 'camera' }
        );
        
        localAudioTrack = await room.localParticipant.publishTrack(
            audioTrack,
            { name: 'microphone' }
        );
        
        console.log('Published tracks to LiveKit for TouchDesigner');
        
        joinBtn.style.display = 'none';
        leaveBtn.style.display = 'inline-block';
        updateStatus('Streaming to TouchDesigner - Waiting for processed video...', 'connected');
        
    } catch (error) {
        console.error('Connection error:', error);
        if (error.name === 'NotAllowedError') {
            updateStatus('Camera access denied. Please allow camera access.', 'error');
        } else {
            updateStatus('Connection failed: ' + error.message, 'error');
        }
        joinBtn.disabled = false;
    }
}

// Disconnect from stream
async function leaveStream() {
    // Stop local tracks
    if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }
    
    if (room) {
        await room.disconnect();
        room = null;
    }
    
    isConnected = false;
    localVideoTrack = null;
    localAudioTrack = null;
    
    joinBtn.style.display = 'inline-block';
    joinBtn.disabled = false;
    leaveBtn.style.display = 'none';
    remoteVideo.srcObject = null;
    videoOverlay.classList.remove('hidden');
    updateStatus('Ready to connect', 'ready');
}

// Event listeners
joinBtn.addEventListener('click', joinStream);
leaveBtn.addEventListener('click', leaveStream);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (room) {
        room.disconnect();
    }
});
