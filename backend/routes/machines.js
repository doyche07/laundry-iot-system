const express = require('express');
const router = express.Router();

const Machine = require('../models/Machine');
const Log = require('../models/Log');
const verifyAuth = require('../middleware/auth');
const verifyDevice = require('../middleware/deviceAuth');

// Dashboard: get all machines
router.get('/', verifyAuth, async (req, res) => {
  const machines = await Machine.find().sort({ updatedAt: -1 });
  res.json(machines);
});

// Dashboard: get one machine
router.get('/:machineId', verifyAuth, async (req, res) => {
  const machine = await Machine.findOne({ machineId: req.params.machineId });
  if (!machine) return res.status(404).json({ message: 'Machine not found' });
  res.json(machine);
});

// Device: send live machine update
router.post('/update', verifyDevice, async (req, res) => {
  const machineId = req.body.machineId || req.body.machine_id;
  if (!machineId) {
    return res.status(400).json({ message: 'machineId is required' });
  }

  const update = {
    machineId,
    name: req.body.name || machineId,
    status: req.body.status || 'idle',
    timeLeft: Number(req.body.timeLeft ?? req.body.time_left ?? 0),
    temperature: Number(req.body.temperature ?? 0),
    rfidCount: Number(req.body.rfidCount ?? req.body.rfid_count ?? 0),
    rfidItems: Array.isArray(req.body.rfidItems)
      ? req.body.rfidItems
      : Array.isArray(req.body.items)
        ? req.body.items
        : [],
    online: true,
    lastSeen: new Date()
  };

  const machine = await Machine.findOneAndUpdate(
    { machineId },
    {
      $set: update,
      $setOnInsert: { pendingCommand: null }
    },
    { upsert: true, new: true }
  );

  await Log.create({
    machineId,
    type: 'update',
    message: `Updated status to ${update.status}`,
    payload: update
  });

  res.json(machine);
});

// Dashboard: send command to machine
router.post('/:machineId/command', verifyAuth, async (req, res) => {
  const { machineId } = req.params;
  const { type, args = {} } = req.body;

  if (!type) {
    return res.status(400).json({ message: 'Command type is required' });
  }

  const machine = await Machine.findOneAndUpdate(
    { machineId },
    {
      $set: {
        pendingCommand: {
          type,
          args,
          issuedAt: new Date()
        }
      }
    },
    { new: true, upsert: true }
  );

  await Log.create({
    machineId,
    type: 'command',
    message: `Command queued: ${type}`,
    payload: { type, args }
  });

  res.json({ message: 'Command queued', machine });
});

// Device: read pending command
router.get('/:machineId/command', verifyDevice, async (req, res) => {
  const { machineId } = req.params;
  const machine = await Machine.findOne({ machineId });

  if (!machine || !machine.pendingCommand) {
    return res.json({ command: null });
  }

  const command = machine.pendingCommand;
  machine.pendingCommand = null;
  await machine.save();

  res.json({ command });
});

module.exports = router;