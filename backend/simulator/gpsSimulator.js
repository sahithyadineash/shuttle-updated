const io = require('socket.io-client');

// Connect to your server
const socket = io('http://localhost:5001');

// Shuttle ID (use the one you created earlier)
const SHUTTLE_ID = '698b81dfe2a980ac0eec1f32';

// Simulate route coordinates (Main Gate → Library → Hostel)
const routeCoordinates = [
  { lat: 13.0827, lng: 80.2707 }, // Main Gate
  { lat: 13.0835, lng: 80.2720 },
  { lat: 13.0840, lng: 80.2730 },
  { lat: 13.0845, lng: 80.2740 },
  { lat: 13.0850, lng: 80.2750 }, // Library
  { lat: 13.0860, lng: 80.2760 },
  { lat: 13.0870, lng: 80.2770 },
  { lat: 13.0880, lng: 80.2780 },
  { lat: 13.0890, lng: 80.2790 },
  { lat: 13.0900, lng: 80.2800 }, // Hostel
];

let currentIndex = 0;

socket.on('connect', () => {
  console.log('🚐 Simulator connected to server');
  console.log(`📍 Simulating GPS for shuttle: ${SHUTTLE_ID}`);
  
  // Send location updates every 3 seconds
  setInterval(() => {
    const location = routeCoordinates[currentIndex];
    
    socket.emit('update-location', {
      shuttle_id: SHUTTLE_ID,
      lat: location.lat,
      lng: location.lng
    });
    
    console.log(`📡 Sent location: ${location.lat}, ${location.lng}`);
    
    // Move to next coordinate (loop back to start)
    currentIndex = (currentIndex + 1) % routeCoordinates.length;
  }, 3000); // Update every 3 seconds
});

socket.on('location-updated', (data) => {
  console.log('✅ Server confirmed location update:', data);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});