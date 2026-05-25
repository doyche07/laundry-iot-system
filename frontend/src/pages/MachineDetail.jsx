import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import StatusBadge from '../components/StatusBadge';
import RFIDList from '../components/RFIDList';

export default function MachineDetail() {
  const { machineId } = useParams();
  const [machine, setMachine] = useState(null);
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();

  async function loadData() {
    try {
      const [machineRes, logsRes] = await Promise.all([
        api.get(`/machines/${machineId}`),
        api.get(`/logs?machineId=${machineId}&limit=20`)
      ]);
      setMachine(machineRes.data);
      setLogs(logsRes.data);
    } catch {
      navigate('/login');
    }
  }

  async function sendCommand(type) {
    await api.post(`/machines/${machineId}/command`, { type });
    await loadData();
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, [machineId]);

  if (!machine) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <button className="btn btn-gray" onClick={() => navigate('/')}>← Back</button>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>{machine.name || machine.machineId}</h1>
            <div className="muted">{machine.machineId}</div>
          </div>
          <StatusBadge status={machine.status} />
        </div>

        <div className="grid grid-2" style={{ marginTop: 16 }}>
          <div>
            <p><strong>Time left:</strong> {machine.timeLeft ?? 0} min</p>
            <p><strong>Temperature:</strong> {machine.temperature ?? 0}°C</p>
            <p><strong>RFID count:</strong> {machine.rfidCount ?? 0}</p>
            <p><strong>Online:</strong> {machine.online ? 'Yes' : 'No'}</p>
            <p><strong>Last seen:</strong> {machine.lastSeen ? new Date(machine.lastSeen).toLocaleString() : 'N/A'}</p>
          </div>
          <div>
            <h3>RFID Items</h3>
            <RFIDList items={machine.rfidItems || []} />
          </div>
        </div>

        <div className="row" style={{ marginTop: 16 }}>
          <button className="btn btn-green" onClick={() => sendCommand('start')}>Start</button>
          <button className="btn btn-yellow" onClick={() => sendCommand('pause')}>Pause</button>
          <button className="btn btn-red" onClick={() => sendCommand('stop')}>Stop</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Logs</h2>
        <ul className="list">
          {logs.map((log) => (
            <li key={log._id}>
              <strong>{log.type}</strong> — {log.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}