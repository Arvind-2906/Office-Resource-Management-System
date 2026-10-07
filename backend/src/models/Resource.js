import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    resourceId: {
      type: String,
      required: [true, 'Resource ID is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Resource category is required'],
      enum: ['Laptop', 'Monitor', 'Projector', 'Meeting Room', 'Printer', 'Other'],
      default: 'Other'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Resource location is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'ALLOCATED', 'BOOKED', 'UNDER_MAINTENANCE', 'INACTIVE'],
      default: 'AVAILABLE'
    },
    isBookable: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

resourceSchema.index({ status: 1 });
resourceSchema.index({ category: 1 });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
