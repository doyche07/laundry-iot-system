import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { SYSTEM_NAME } from '../App';
import MachineCard from '../components/MachineCard';

export default function Dashboard() {
  const [machines, setMachines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function loadData() {
    try {
      const [machinesRes, logsRes] = await Promise.all([
        api.get('/machines'),
        api.get('/logs?limit=10')
      ]);
      setMachines(machinesRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      setError('Session expired or server error. Please login again.');
      localStorage.removeItem('laundry_token');
      navigate('/login');
    }
  }

  async function sendCommand(machineId, type) {
    try {
      await api.post(`/machines/${machineId}/command`, { type });
      await loadData();
    } catch {
      alert('Command failed');
    }
  }

  function logout() {
    localStorage.removeItem('laundry_token');
    navigate('/login');
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>{SYSTEM_NAME}</h1>
          <div className="muted">Live machine monitoring and RFID tracking</div>
        </div>
        <button className="btn btn-gray" onClick={logout}>Logout</button>
      </div>

      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

      <div className="grid grid-3">
        {machines.map((machine) => (
          <MachineCard key={machine.machineId} machine={machine} onCommand={sendCommand} />
        ))}
      </div>

      <div style={{ marginTop: 24 }} className="grid grid-2">
        <div className="card">
          <h2>Latest logs</h2>
          <ul className="list">
            {logs.map((log) => (
              <li key={log._id}>
                <strong>{log.machineId}</strong> — {log.message}
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Dashboard notes</h2>
          <p className="muted">
            This page reads data from the backend API. The backend reads and stores machine updates in MongoDB Atlas.
          </p>
        </div>
      </div>
    </div>
  );
}