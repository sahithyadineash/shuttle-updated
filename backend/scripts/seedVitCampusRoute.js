/**
 * One-time seed: VIT campus loop route with official stop coordinates.
 * Run from backend/:  node scripts/seedVitCampusRoute.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('../models/Route');

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

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking';
  await mongoose.connect(uri);
  const existing = await Route.findOne({ route_name: 'VIT Campus Loop' });
  if (existing) {
    console.log('Route "VIT Campus Loop" already exists. Delete it in Mongo to re-seed.');
    await mongoose.disconnect();
    process.exit(0);
  }
  const route = await Route.create({
    route_name: 'VIT Campus Loop',
    stops: STOPS,
    schedule: { start_time: '07:00', end_time: '21:00', frequency_minutes: 15 },
  });
  console.log('Created route:', route._id.toString(), route.route_name);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
