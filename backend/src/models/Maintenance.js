const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issue: {
      type: String,
      required: [true, 'Please describe the maintenance issue'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
      default: 'PENDING'
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

maintenanceSchema.index({ resource: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
