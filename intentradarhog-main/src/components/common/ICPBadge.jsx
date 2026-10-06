import React from 'react';

export default function ICPBadge({ icp }) {
  if (!icp) return null;
  const labels = {
    agency: 'Agency Expert',
    expert: 'Individual Expert'
  };
  return (
    <span className={`badge badge-icp-${icp.toLowerCase()}`}>
      {labels[icp] || icp.charAt(0).toUpperCase() + icp.slice(1)}
    </span>
  );
}
