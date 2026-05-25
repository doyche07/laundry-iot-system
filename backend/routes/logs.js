const express = require('express');
const router = express.Router();

const Log = require('../models/Log');
const verifyAuth = require('../middleware/auth');

// Dashboard: get logs
router.get('/', verifyAuth, async (req, res) => {
  const { machineId, limit = 50 } = req.query;
  const filter = machineId ? { machineId } : {};
  const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
  res.json(logs);
});

module.exports = router;