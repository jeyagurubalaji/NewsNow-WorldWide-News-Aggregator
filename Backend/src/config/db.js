const mongoose = require('mongoose');
const env = require('./env');

async function connectDb() {
  await mongoose.connect(env.mongodbUri);
  console.log('[db] Connected to MongoDB');
}

module.exports = { connectDb };
