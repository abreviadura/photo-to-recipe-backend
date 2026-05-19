/**
 * One-time: set isPublished: true for recipes missing the field (legacy data).
 * Run: node scripts/migrate-recipe-isPublished.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const user = process.env.MONGODB_USER;
const pwd = process.env.MONGODB_PASSWORD;
const url = process.env.MONGODB_URL;
const db = process.env.MONGODB_DB;

if (!user || !pwd || !url || !db) {
  console.error('Missing MONGODB_* in .env');
  process.exit(1);
}

const uri = `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`;

await mongoose.connect(uri);
const result = await mongoose.connection.db.collection('recipes').updateMany(
  { isPublished: { $exists: false } },
  { $set: { isPublished: true } },
);
console.log('Matched:', result.matchedCount, 'Modified:', result.modifiedCount);
await mongoose.disconnect();
