import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MachineDetail from './pages/MachineDetail';
import Login from './pages/Login';

export const SYSTEM_NAME = 'Laundry IoT Dashboard'; // CHANGE HERE: system name

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('laundry_token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/machine/:machineId"
          element={
            <ProtectedRoute>
              <MachineDetail />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}