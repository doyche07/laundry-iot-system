const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    machineId: { type: String, required: true, unique: true, trim: true }, // CHANGE HERE: machine IDs like WM01, WM02...
    name: { type: String, default: '' }, // CHANGE HERE: machine label
    status: { type: String, default: 'offline' }, // idle | washing | paused | finished | offline
    timeLeft: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    rfidCount: { type: Number, default: 0 },
    rfidItems: [{ type: String }],
    online: { type: Boolean, default: false },
    lastSeen: { type: Date, default: null },
    pendingCommand: { type: Object, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Machine', machineSchema);