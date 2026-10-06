import React from 'react';

export default function BandBadge({ band }) {
  if (!band) return null;
  return (
    <span className={`badge badge-band-${band.toLowerCase()}`}>
      Band {band}
    </span>
  );
}
