const io = require('socket.io-client');

// Connect to your server
const socket = io('http://localhost:5001');

// Shuttle ID (use the one you created earlier)
const SHUTTLE_ID = '698b81dfe2a980ac0eec1f32';

// Simulate route coordinates (Main Gate → Library → Hostel)
const routeCoordinates = [
  { lat: 12.9692, lng: 79.1559 }, // Main Gate
  { lat: 12.9716, lng: 79.1588 }, // SJT
  { lat: 12.9723, lng: 79.1602 }, // Library
  { lat: 12.9735, lng: 79.1598 }, // TT
  { lat: 12.9755, lng: 79.1620 }, // Men's Hostel
  { lat: 12.9742, lng: 79.1635 }, // Ladies Hostel
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