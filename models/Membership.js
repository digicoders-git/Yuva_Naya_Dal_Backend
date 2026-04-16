const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  memberId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a mobile number'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, "Please add father's name"],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please add an address/district'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto-generate memberId before saving
membershipSchema.pre('save', async function () {
  if (!this.memberId || this.memberId === '') {
    try {
      // Find the last member created this year to get the next serial number
      const currentYear = new Date().getFullYear();
      const lastMember = await mongoose.model('Membership').findOne(
        { memberId: { $regex: `^YND-${currentYear}-` } },
        { memberId: 1 },
        { sort: { memberId: -1 } }
      );

      let nextSerial = 1;
      if (lastMember && lastMember.memberId) {
        const parts = lastMember.memberId.split('-');
        const lastSerial = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastSerial)) {
          nextSerial = lastSerial + 1;
        }
      }

      this.memberId = `YND-${currentYear}-${String(nextSerial).padStart(5, '0')}`;
      console.log('Successfully generated UNIQUE Member ID:', this.memberId);
    } catch (error) {
      console.error('Error in memberId generation hook:', error);
      // Ultimate fallback: timestamp-based to avoid collisions
      this.memberId = `YND-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    }
  }
});

module.exports = mongoose.model('Membership', membershipSchema);
