import mongoose from 'mongoose';

const allocationSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceRequest'
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    allocatedAt: {
      type: Date,
      default: Date.now
    },
    expectedReturnDate: {
      type: Date
    },
    returnedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RETURN_REQUESTED', 'RETURNED'],
      default: 'ACTIVE'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

allocationSchema.index({ resource: 1, status: 1 });
allocationSchema.index({ employee: 1, status: 1 });

const Allocation = mongoose.model('Allocation', allocationSchema);
export default Allocation;
