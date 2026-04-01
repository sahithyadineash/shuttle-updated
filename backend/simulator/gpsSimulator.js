const io = require('socket.io-client');

const socket = io(process.env.SIMULATOR_SERVER || 'http://localhost:5001');

/** Set SHUTTLE_ID in env or edit below to match MongoDB. */
const SHUTTLE_ID =
  process.env.SHUTTLE_ID || '698b81dfe2a980ac0eec1f32';

/** VIT campus loop (same order as seed script). */
const routeCoordinates = [
  { lat: 12.969856, lng: 79.158529 }, // SJT
  { lat: 12.970873, lng: 79.159744 }, // TT
  { lat: 12.97021, lng: 79.15921 }, // PRP
  { lat: 12.9712, lng: 79.1588 }, // MGB
  { lat: 12.97245, lng: 79.1602 }, // GDN
  { lat: 12.97295, lng: 79.1596 }, // Main Library
  { lat: 12.9691, lng: 79.1559 }, // Main Gate
  { lat: 12.97065, lng: 79.15995 }, // TT Food Court
  { lat: 12.97185, lng: 79.1622 }, // Ladies Hostel H Block
];

let currentIndex = 0;

socket.on('connect', () => {
  console.log('Simulator connected to server');
  console.log(`Simulating GPS for shuttle: ${SHUTTLE_ID}`);

  setInterval(() => {
    const location = routeCoordinates[currentIndex];
    socket.emit('update-location', {
      shuttle_id: SHUTTLE_ID,
      lat: location.lat,
      lng: location.lng,
    });
    console.log(`Sent location: ${location.lat}, ${location.lng}`);
    currentIndex = (currentIndex + 1) % routeCoordinates.length;
  }, 3000);
});

socket.on('location-updated', (data) => {
  console.log('Server broadcast:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
