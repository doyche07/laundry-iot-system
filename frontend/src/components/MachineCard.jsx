import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function MachineCard({ machine, onCommand }) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 6px' }}>{machine.name || machine.machineId}</h3>
          <div className="muted">{machine.machineId}</div>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      <p style={{ marginTop: 12 }}>
        <strong>Time left:</strong> {machine.timeLeft ?? 0} min
      </p>
      <p>
        <strong>RFID items:</strong> {machine.rfidCount ?? 0}
      </p>
      <p>
        <strong>Temp:</strong> {machine.temperature ?? 0}°C
      </p>
      <p>
        <strong>Online:</strong> {machine.online ? 'Yes' : 'No'}
      </p>

      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-green" onClick={() => onCommand(machine.machineId, 'start')}>
          Start
        </button>
        <button className="btn btn-yellow" onClick={() => onCommand(machine.machineId, 'pause')}>
          Pause
        </button>
        <button className="btn btn-red" onClick={() => onCommand(machine.machineId, 'stop')}>
          Stop
        </button>
        <Link className="btn btn-gray" to={`/machine/${machine.machineId}`}>
          Details
        </Link>
      </div>
    </div>
  );
}