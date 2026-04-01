/**
 * Full local dev seed for an empty MongoDB (e.g. first time in Compass).
 * Creates: VIT Campus Loop route, demo driver + student, 2 active shuttles.
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

  const removedLegacy = await Shuttle.deleteMany({
    shuttle_number: { $regex: /^sh1$/i },
  });
  if (removedLegacy.deletedCount > 0) {
    console.log('✓ Removed legacy shuttle(s) sh1:', removedLegacy.deletedCount);
  }

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

  const shuttleSpecs = [
    {
      shuttle_number: 'VIT-01',
      current_location: { lat: 12.969856, lng: 79.158529 },
    },
    {
      shuttle_number: 'VIT-02',
      current_location: { lat: 12.970873, lng: 79.159744 },
    },
  ];

  const createdShuttles = [];
  for (const spec of shuttleSpecs) {
    let s = await Shuttle.findOne({ shuttle_number: spec.shuttle_number });
    if (!s) {
      s = await Shuttle.create({
        shuttle_number: spec.shuttle_number,
        route_id: route._id,
        driver_id: driver._id,
        current_location: spec.current_location,
        status: 'active',
        seat_status: 'available',
        seats_total: 40,
        seats_available: 40,
      });
      console.log('✓ Created shuttle', spec.shuttle_number, s._id.toString());
    } else {
      s.route_id = route._id;
      s.driver_id = driver._id;
      s.status = 'active';
      s.seat_status = 'available';
      s.current_location = spec.current_location;
      await s.save();
      console.log('• Updated shuttle', spec.shuttle_number, s._id.toString());
    }
    createdShuttles.push(s);
  }

  await mongoose.disconnect();

  console.log('\n--- MongoDB Compass ---');
  console.log('Open your connection → choose the database name from MONGO_URI');
  console.log('(e.g. shuttle_tracking). Refresh: you should see:');
  console.log('  routes, users, shuttles\n');

  console.log('--- Demo logins (frontend) ---');
  console.log('  Driver:  driver@demo.vit  /  ' + DEMO_PASSWORD);
  console.log('  Student: student@demo.vit /  ' + DEMO_PASSWORD + '\n');

  console.log('--- GPS simulator ---');
  console.log('  In backend/simulator/gpsSimulator.js set SHUTTLE_ID or env:');
  console.log('  SHUTTLE_ID=' + createdShuttles[0]._id.toString());
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
