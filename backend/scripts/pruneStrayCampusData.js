/**
 * Removes non–VIT-campus test data that often shows huge ETAs (wrong region).
 * Safe to run anytime; idempotent.
 *
 * Run from backend/:  npm run prune:stray
 * Also runs automatically at the start of npm run seed:dev
 */
const Route = require('../models/Route');
const Shuttle = require('../models/Shuttle');

/** Route names (regex) to drop entirely, with their shuttles. */
const STRAY_ROUTE_NAME_PATTERNS = [
  /^Route A\s*-\s*Main Campus$/i,
  /^Route B\s*-\s*North Campus$/i,
];

/** Old stray shuttle from "Route A" (hyphenated only — not sh1/sh2 demo fleet). */
const LEGACY_SHUTTLE_NUMBER = /^sh-01$/i;

async function pruneStrayCampusData() {
  const removedShuttles = await Shuttle.deleteMany({
    shuttle_number: { $regex: LEGACY_SHUTTLE_NUMBER },
  });
  if (removedShuttles.deletedCount > 0) {
    console.log(
      '✓ Removed legacy shuttle(s) (SH-01):',
      removedShuttles.deletedCount
    );
  }

  for (const pattern of STRAY_ROUTE_NAME_PATTERNS) {
    const routes = await Route.find({ route_name: pattern });
    for (const r of routes) {
      const sh = await Shuttle.deleteMany({ route_id: r._id });
      await Route.deleteOne({ _id: r._id });
      console.log(
        `✓ Removed stray route "${r.route_name}" and ${sh.deletedCount} shuttle(s)`
      );
    }
  }
}

module.exports = pruneStrayCampusData;

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const uri =
    process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking';
  (async () => {
    try {
      console.log('Connecting to MongoDB…');
      await mongoose.connect(uri);
      await pruneStrayCampusData();
    } finally {
      await mongoose.disconnect();
    }
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
