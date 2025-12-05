require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in .env');
    process.exit(2);
  }
  await mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  let user = await User.findOne({email});
  if (user) {
    console.log('Admin already exists:', email);
    await mongoose.disconnect();
    process.exit(0);
  }
  user = new User({name: 'Administrator', email, password, role: 'admin'});
  await user.save();
  console.log('Created admin:', email, 'with password:', password);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
