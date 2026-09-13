/* eslint-disable no-console */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brotein';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  calories: { type: Number, required: true, min: 0 },
  proteinG: { type: Number, required: true, min: 0 },
  carbsG: { type: Number, required: true, min: 0 },
  fatG: { type: Number, required: true, min: 0 },
  fiberG: { type: Number, required: true, min: 0 },
  servingSize: { type: Number, required: true, min: 0 },
  servingUnit: { type: String, required: true, trim: true },
});
foodItemSchema.index({ name: 'text' });

const FoodItem = mongoose.model('FoodItem', foodItemSchema);

async function seed() {
  const dataPath = path.join(__dirname, '..', 'data', 'foodItems.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const items = JSON.parse(raw);

  console.log(`Connecting to ${MONGODB_URI} ...`);
  await mongoose.connect(MONGODB_URI);

  console.log(`Clearing existing FoodItem collection ...`);
  await FoodItem.deleteMany({});

  console.log(`Inserting ${items.length} food items ...`);
  await FoodItem.insertMany(items);

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
