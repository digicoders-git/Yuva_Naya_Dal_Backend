const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: { type: String, default: 'युवा न्याय दल एडमिन' },
  username: { type: String, default: 'admin_ynd' },
  email: { type: String, default: 'admin@yuvanyaydal.org' },
  password: { type: String, default: '' },
  profileImage: { type: String, default: '' },
}, { timestamps: true });

// Hash password before save
adminSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  if (this.password.startsWith('$2')) return; // already hashed
  this.password = await bcrypt.hash(this.password, 10);
});

adminSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
