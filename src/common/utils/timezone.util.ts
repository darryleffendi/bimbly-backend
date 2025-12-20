const WIB_OFFSET_HOURS = 7;

export function wibToUtc(date: string, time: string): Date {
  const dateTime = new Date(`${date}T${time}+07:00`);
  return dateTime;
}

export function utcToWibTime(date: Date): string | null {
  if (!date) return null;
  const wibDate = new Date(date.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);
  const hours = wibDate.getUTCHours().toString().padStart(2, '0');
  const minutes = wibDate.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function utcToWibDate(date: Date): string | null {
  if (!date) return null;
  const wibDate = new Date(date.getTime() + WIB_OFFSET_HOURS * 60 * 60 * 1000);
  return wibDate.toISOString().split('T')[0];
}

export function getNowInWib(): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
}

export function formatTimeWib(time: string): string {
  return time.substring(0, 5);
}
