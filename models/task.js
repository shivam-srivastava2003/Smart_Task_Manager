const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['Personal', 'Professional', 'Student'],
      default: 'Personal'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['Pending', 'Completed'],
      default: 'Pending'
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
