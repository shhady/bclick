'use client';

import React, { useState } from 'react';
import ClientCard from './ClientCard';

export default function ClientList({ initialClients, supplierId }) {
  const [clients, setClients] = useState(initialClients);

  const handleRemove = (clientId) => {
    setClients((prev) => prev.filter((client) => client.id !== clientId));
  };

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          supplierId={supplierId}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}
