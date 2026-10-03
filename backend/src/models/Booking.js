const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a booking title/purpose'],
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (HH:mm)'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format must be HH:mm (24-hour)']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (HH:mm)'],
      match: [/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, 'Time format must be HH:mm (24-hour)']
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING'
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ resource: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
