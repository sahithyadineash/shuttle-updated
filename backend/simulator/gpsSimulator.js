/**
 * Smooth multi-shuttle GPS simulation: loads sh1, sh2, … from MongoDB (by shuttle_number)
 * and emits positions along each shuttle's assigned route. Staggered phases so buses move visibly.
 *
 * From backend/:  npm run simulate:gps
 * Requires MongoDB + server running. Optional: SIM_SHUTTLE_IDS=id1,id2 (comma-separated) to override.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const io = require('socket.io-client');
const Shuttle = require('../models/Shuttle');
require('../models/Route'); // register model so populate('route_id') works

const socket = io(process.env.SIMULATOR_SERVER || 'http://localhost:5001');

/** Fallback loop if a shuttle has no route (same as VIT seed order). */
const DEFAULT_WAYPOINTS = [
  { lat: 12.969856, lng: 79.158529 },
  { lat: 12.970873, lng: 79.159744 },
  { lat: 12.97021, lng: 79.15921 },
  { lat: 12.9712, lng: 79.1588 },
  { lat: 12.97245, lng: 79.1602 },
  { lat: 12.97295, lng: 79.1596 },
  { lat: 12.9691, lng: 79.1559 },
  { lat: 12.97065, lng: 79.15995 },
  { lat: 12.97185, lng: 79.1622 },
];

const LOOP_MS = Number(process.env.SIM_LOOP_MS || 28000);
const TICK_MS = Number(process.env.SIM_TICK_MS || 900);

function sortStops(stops) {
  return [...(stops || [])].sort((a, b) => a.order - b.order);
}

function waypointsFromRoute(route) {
  const sorted = sortStops(route?.stops);
  if (sorted.length < 2) return DEFAULT_WAYPOINTS;
  return sorted.map((s) => ({ lat: s.lat, lng: s.lng }));
}

/** Position along closed loop of waypoints; t01 in [0,1). */
function positionAlongLoop(waypoints, t01) {
  const n = waypoints.length;
  if (n < 2) return waypoints[0] || { lat: 0, lng: 0 };
  const segFloat = t01 * n;
  const i = Math.floor(segFloat) % n;
  const j = (i + 1) % n;
  const f = segFloat - Math.floor(segFloat);
  const a = waypoints[i];
  const b = waypoints[j];
  return {
    lat: a.lat + f * (b.lat - a.lat),
    lng: a.lng + f * (b.lng - a.lng),
  };
}

function naturalShCompare(a, b) {
  const na = parseInt(String(a).replace(/\D/g, ''), 10) || 0;
  const nb = parseInt(String(b).replace(/\D/g, ''), 10) || 0;
  return na - nb;
}

async function loadSimulatedShuttles() {
  const raw = process.env.SIM_SHUTTLE_IDS;
  if (raw && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((id) => ({ id, waypoints: DEFAULT_WAYPOINTS }));
  }

  const uri =
    process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking';
  await mongoose.connect(uri);
  const rows = await Shuttle.find({
    shuttle_number: { $regex: /^sh\d+$/i },
  })
    .populate('route_id')
    .lean();

  rows.sort((x, y) =>
    naturalShCompare(x.shuttle_number, y.shuttle_number)
  );

  await mongoose.disconnect();

  if (rows.length === 0) {
    const single = process.env.SHUTTLE_ID;
    if (single) {
      return [{ id: single, waypoints: DEFAULT_WAYPOINTS }];
    }
    throw new Error(
      'No shuttles matching /^sh\\d+$/i in MongoDB. Run npm run seed:dev or set SHUTTLE_ID / SIM_SHUTTLE_IDS.'
    );
  }

  return rows.map((row) => ({
    id: row._id.toString(),
    waypoints: waypointsFromRoute(row.route_id),
  }));
}

let shuttleStates = [];
let startTime = Date.now();

async function main() {
  shuttleStates = await loadSimulatedShuttles();
  const n = shuttleStates.length;
  shuttleStates.forEach((s, idx) => {
    s.phase = idx / Math.max(n, 1);
  });

  console.log(`Loaded ${n} shuttle(s) for simulation:`);
  shuttleStates.forEach((s) =>
    console.log(`  • ${s.id} (${s.waypoints.length} waypoints)`)
  );

  socket.on('connect', () => {
    console.log('Simulator connected to', process.env.SIMULATOR_SERVER || 'http://localhost:5001');
    startTime = Date.now();
  });

  setInterval(() => {
    if (!socket.connected || shuttleStates.length === 0) return;
    const elapsed = Date.now() - startTime;
    const t = (elapsed % LOOP_MS) / LOOP_MS;
    for (const s of shuttleStates) {
      const phase = (t + s.phase) % 1;
      const loc = positionAlongLoop(s.waypoints, phase);
      socket.emit('update-location', {
        shuttle_id: s.id,
        lat: loc.lat,
        lng: loc.lng,
      });
    }
  }, TICK_MS);

  socket.on('location-updated', (data) => {
    // Optional: console.log('broadcast', data.shuttle_id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
