'use client';

import React from 'react';

interface Props {
  statusCounts?: {
    all: number;
    new: number;
    pending: number;
    onHold: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
    completed: number;
    processing: number;
  };
}

const StatusBox = ({ status, value }: { status: string; value: number }) => {
  return (
    <div
      style={{
        border: '1px solid #D6E4FF',
        borderRadius: '8px',
        padding: '12px',
        flexGrow: 1,
      }}
    >
      <p style={{ fontSize: '16px' }}>
        {status === 'OnHold' ? 'On Hold' : status}
      </p>
      <p className="m-0" style={{ fontSize: '18px', fontWeight: 700 }}>
        {value.toLocaleString('en-US')}
      </p>
    </div>
  );
};

const StatusSummary = ({ statusCounts }: Props) => {
  return (
    <div style={{ display: 'flex', columnGap: '12px' }}>
      {Object.keys(statusCounts ?? {})
        .filter((k) =>
          ['new', 'completed', 'processing', 'pending', 'onHold'].includes(k),
        )
        .map((k, index) => {
          const item = {
            status: k.charAt(0).toUpperCase() + k.slice(1),
            value: statusCounts![k as keyof typeof statusCounts] as number,
          };
          return <StatusBox key={index} {...item} />;
        })}
    </div>
  );
};

export default StatusSummary;
