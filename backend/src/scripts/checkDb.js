require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  if (!uri) {
    console.error('No MONGO_URI_TEST or MONGO_URI set');
    process.exit(2);
  }
  console.log('Connecting to', uri);
  try {
    await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
    console.log('Connected to MongoDB successfully');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err.message || err);
    process.exit(1);
  }
}

run();
