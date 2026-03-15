export interface CountdownTime {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export function getCountdown(targetDate: string | Date): CountdownTime {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const totalMs = Math.max(target.getTime() - Date.now(), 0);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return {
    totalMs,
    days,
    hours,
    minutes,
    seconds,
    isComplete: totalMs === 0
  };
}

export function formatCountdown(time: CountdownTime) {
  if (time.isComplete) {
    return "Happening now";
  }

  return `${time.days}d ${time.hours}h ${time.minutes}m`;
}
