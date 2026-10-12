export const todayJST = () =>
  new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function validDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00Z`);
  return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
}
