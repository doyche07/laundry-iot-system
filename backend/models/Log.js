const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    machineId: { type: String, required: true },
    type: { type: String, default: 'info' },
    message: { type: String, required: true },
    payload: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);