import mongoose from 'mongoose';

const resourceRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the request'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

resourceRequestSchema.index({ employee: 1, status: 1 });
resourceRequestSchema.index({ resource: 1, status: 1 });

const ResourceRequest = mongoose.model('ResourceRequest', resourceRequestSchema);
export default ResourceRequest;
