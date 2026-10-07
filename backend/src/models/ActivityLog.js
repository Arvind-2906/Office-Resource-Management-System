import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    entity: {
      type: String,
      required: true,
      trim: true
    },
    entityId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
