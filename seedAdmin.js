
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecocollect'
  );

  const email = (process.env.ADMIN_EMAIL || 'admin@ecocollect.com')
    .trim()
    .toLowerCase();

  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hash = await bcrypt.hash(password, 12);

  const admin = await User.findOne({ email });

  if (admin) {
    admin.name = 'EcoCollect Admin';
    admin.password = hash;
    admin.role = 'admin';
    await admin.save();
    console.log(`Admin credentials updated: ${email}`);
  } else {
    await User.create({
      name: 'EcoCollect Admin',
      email,
      password: hash,
      role: 'admin'
    });
    console.log(`Admin created: ${email}`);
  }

  await mongoose.disconnect();
})().catch(async err => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
