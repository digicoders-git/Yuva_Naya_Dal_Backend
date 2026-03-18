const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ynd_secret_key_2024';

// Get or create default admin record
const getOrCreateAdmin = async () => {
  let admin = await Admin.findOne();
  if (!admin) {
    const bcrypt = require('bcryptjs');
    admin = await Admin.create({
      name: 'युवा न्याय दल एडमिन',
      username: 'admin_ynd',
      email: 'admin@yuvanyaydal.org',
      password: await bcrypt.hash('admin123', 10),
    });
  }
  return admin;
};

// @route POST /api/admin/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, error: 'Username और Password जरूरी है' });
    const admin = await getOrCreateAdmin();
    if (admin.username !== username)
      return res.status(401).json({ success: false, error: 'गलत Username या Password' });
    const isMatch = await admin.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, error: 'गलत Username या Password' });
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, data: { name: admin.name, username: admin.username, email: admin.email, profileImage: admin.profileImage } });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route GET /api/admin/profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await getOrCreateAdmin();
    res.json({
      success: true,
      data: { name: admin.name, username: admin.username, email: admin.email, profileImage: admin.profileImage },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route POST /api/admin/profile-image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'कोई फ़ाइल नहीं मिली' });
    const fs = require('fs');
    const path = require('path');
    const admin = await getOrCreateAdmin();
    if (admin.profileImage) {
      const oldPath = path.join(__dirname, '..', admin.profileImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    const imagePath = 'uploads/profile/' + req.file.filename;
    const updated = await Admin.findByIdAndUpdate(admin._id, { profileImage: imagePath }, { returnDocument: 'after' });
    res.json({ success: true, profileImage: updated.profileImage });
  } catch (err) {
    console.error('uploadProfileImage error:', err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @route PUT /api/admin/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, username, email } = req.body;
    const admin = await getOrCreateAdmin();
    const update = {};
    if (name) update.name = name;
    if (username) update.username = username;
    if (email) update.email = email;
    const updated = await Admin.findByIdAndUpdate(admin._id, update, { returnDocument: 'after' });
    res.json({
      success: true,
      data: { name: updated.name, username: updated.username, email: updated.email, profileImage: updated.profileImage },
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server Error' });
  }
};

// @route PUT /api/admin/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await getOrCreateAdmin();
    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'वर्तमान पासवर्ड गलत है' });
    }
    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'पासवर्ड सफलतापूर्वक बदल गया' });
  } catch {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
