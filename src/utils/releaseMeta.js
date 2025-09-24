// Utility to compute release metadata (label, days left, badge color, tooltip)
export function computeReleaseMeta(releaseDate, year) {
  const today = new Date();
  let dateLabel = year || 'TBD';
  let daysLeft = null;
  let isFuture = false;
  let iso = '';
  if (releaseDate) {
    const rd = new Date(releaseDate);
    if (!isNaN(rd)) {
      iso = rd.toISOString();
      if (rd > today) {
        isFuture = true;
        const diffMs = rd.setHours(0,0,0,0) - today.setHours(0,0,0,0);
        daysLeft = Math.ceil(diffMs / 86400000);
        dateLabel = rd.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' });
      } else {
        dateLabel = (year || rd.getFullYear());
      }
    }
  }
  if (!releaseDate) dateLabel = 'TBD';
  const badgeColor = daysLeft != null
    ? (daysLeft <= 7 ? 'bg-red-600/80 text-white' : daysLeft <= 30 ? 'bg-yellow-500/80 text-black' : 'bg-green-600/70 text-white')
    : 'bg-gray-600/60 text-white';
  return { dateLabel, daysLeft, isFuture, iso, badgeColor };
}
