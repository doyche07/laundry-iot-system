import React from 'react';

export default function StatusBadge({ status = 'offline' }) {
  const s = String(status).toLowerCase();

  return (
    <span className={`badge badge-${s}`}>
      {status}
    </span>
  );
}