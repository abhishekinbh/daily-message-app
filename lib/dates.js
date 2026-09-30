function getTodayInKolkata() {
  const now = new Date();
  const kolkataTime = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  );
  const year = kolkataTime.getFullYear();
  const month = String(kolkataTime.getMonth() + 1).padStart(2, '0');
  const day = String(kolkataTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateShort(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getPreviousDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function getNextDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}

function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-');
  const d = new Date(year, month - 1, day);
  return d.getFullYear() == year && d.getMonth() == month - 1 && d.getDate() == day;
}

module.exports = {
  getTodayInKolkata,
  formatDate,
  formatDateShort,
  getPreviousDate,
  getNextDate,
  isValidDate,
};
