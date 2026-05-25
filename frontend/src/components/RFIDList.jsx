import React from 'react';

export default function RFIDList({ items = [] }) {
  if (!items.length) {
    return <p className="muted">No RFID items detected.</p>;
  }

  return (
    <ul className="list">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}