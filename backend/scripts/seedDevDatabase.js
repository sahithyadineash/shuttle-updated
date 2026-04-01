/**
 * Full local dev seed for an empty MongoDB (e.g. first time in Compass).
 * Creates: VIT Campus Loop route, demo driver + student, sh1–sh4 on VIT only.
 *
 * Run from backend/:  npm run seed:dev
 *
 * Use the SAME connection string as your app (MONGO_URI in backend/.env).
 * In Compass: connect → pick that cluster/host → database name (e.g. shuttle_tracking) → refresh after running.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Route = require('../models/Route');
const User = require('../models/user');
const Shuttle = require('../models/Shuttle');
const pruneStrayCampusData = require('./pruneStrayCampusData');

const STOPS = [
  { name: 'SJT (Silver Jubilee Tower)', lat: 12.969856, lng: 79.158529, order: 1 },
  { name: 'Technology Tower (TT)', lat: 12.970873, lng: 79.159744, order: 2 },
  { name: 'PRP (Pearl Research Park)', lat: 12.97021, lng: 79.15921, order: 3 },
  { name: 'Mahatma Gandhi Block (MGB)', lat: 12.9712, lng: 79.1588, order: 4 },
  { name: 'GDN (G.D. Naidu Block)', lat: 12.97245, lng: 79.1602, order: 5 },
  { name: 'Main Library (Periyar Library)', lat: 12.97295, lng: 79.1596, order: 6 },
  { name: 'Main Gate (VIT Entrance)', lat: 12.9691, lng: 79.1559, order: 7 },
  { name: 'TT Food Court Area', lat: 12.97065, lng: 79.15995, order: 8 },
  { name: 'Ladies Hostel H Block', lat: 12.97185, lng: 79.1622, order: 9 },
];

const DEMO_PASSWORD = 'demo1234';

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking';
  console.log('Connecting to MongoDB…');
  console.log('  (hostname only — not printing full URI)\n');
  await mongoose.connect(uri);

  await pruneStrayCampusData();

  let route = await Route.findOne({ route_name: 'VIT Campus Loop' });
  if (!route) {
    route = await Route.create({
      route_name: 'VIT Campus Loop',
      stops: STOPS,
      schedule: { start_time: '07:00', end_time: '21:00', frequency_minutes: 15 },
    });
    console.log('✓ Created route "VIT Campus Loop"', route._id.toString());
  } else {
    console.log('• Route already exists', route._id.toString());
  }

  let driver = await User.findOne({ email: 'driver@demo.vit' });
  if (!driver) {
    driver = await User.create({
      name: 'Demo Driver',
      email: 'driver@demo.vit',
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      role: 'driver',
      phone: '9990000001',
    });
    console.log('✓ Created driver user', driver._id.toString());
  } else {
    console.log('• Driver already exists', driver._id.toString());
  }

  let student = await User.findOne({ email: 'student@demo.vit' });
  if (!student) {
    student = await User.create({
      name: 'Demo Student',
      email: 'student@demo.vit',
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      role: 'student',
      phone: '9990000002',
    });
    console.log('✓ Created student user', student._id.toString());
  } else {
    console.log('• Student already exists', student._id.toString());
  }

  /** VIT only: SJT, TT, Main Gate, Main Library. */
  function placementsForVitRoute(routeDoc) {
    const stops = [...routeDoc.stops].sort((a, b) => a.order - b.order);
    if (stops.length < 7) return [];
    const pick = (order) =>
      stops.find((x) => x.order === order) ?? stops[order - 1];
    return [pick(1), pick(2), pick(7), pick(6)].filter(Boolean);
  }

  const createdShuttles = [];
  let seq = 1;

  await Shuttle.deleteMany({ shuttle_number: { $in: ['VIT-01', 'VIT-02'] } });

  const placements = placementsForVitRoute(route);
  if (placements.length === 0) {
    console.log(
      '⚠ VIT Campus Loop needs ≥7 stops for sh1–sh4; shuttle list unchanged (except VIT-01/02 cleanup).'
    );
  }
  for (const stop of placements) {
    const shuttle_number = `sh${seq++}`;
    const current_location = { lat: stop.lat, lng: stop.lng };
    let s = await Shuttle.findOne({ shuttle_number });
    if (!s) {
      s = await Shuttle.create({
        shuttle_number,
        route_id: route._id,
        driver_id: driver._id,
        current_location,
        status: 'active',
        seat_status: 'available',
        seats_total: 40,
        seats_available: 40,
      });
      console.log('✓ Created shuttle', shuttle_number, s._id.toString(), '→ VIT Campus Loop');
    } else {
      s.route_id = route._id;
      s.driver_id = driver._id;
      s.status = 'active';
      s.seat_status = 'available';
      s.current_location = current_location;
      await s.save();
      console.log('• Updated shuttle', shuttle_number, s._id.toString(), '→ VIT Campus Loop');
    }
    createdShuttles.push(s);
  }

  if (createdShuttles.length > 0) {
    await Shuttle.deleteMany({
      shuttle_number: { $regex: /^sh\d+$/i },
      _id: { $nin: createdShuttles.map((x) => x._id) },
    });
  }

  await mongoose.disconnect();

  console.log('\n--- MongoDB Compass ---');
  console.log('Open your connection → choose the database name from MONGO_URI');
  console.log('(e.g. shuttle_tracking). Refresh: you should see:');
  console.log('  routes, users, shuttles\n');

  console.log('--- Demo logins (frontend) ---');
  console.log('  Driver:  driver@demo.vit  /  ' + DEMO_PASSWORD);
  console.log('  Student: student@demo.vit /  ' + DEMO_PASSWORD + '\n');

  console.log('--- GPS simulator (smooth movement for all sh* shuttles) ---');
  console.log('  From backend/:  npm run simulate:gps');
  console.log('  (needs server running; loads sh1, sh2, … from MongoDB)');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
