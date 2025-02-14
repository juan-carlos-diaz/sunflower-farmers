export function secondsToString(seconds: number) {
  const secondsCeil = Math.ceil(seconds);

  if (secondsCeil < 60) {
    return `${secondsCeil}secs`;
  }

  if (secondsCeil === 60) {
    return `1min`;
  }

  // Less than 1 hour
  if (seconds < 60 * 60) {
    return `${Math.ceil(seconds / 60)}mins`;
  }

  if (seconds === 60 * 60) {
    return "1hr";
  }

  if (seconds < 60 * 60 * 24) {
    return `${Math.ceil(seconds / 60 / 60)}hrs`;
  }

  if (seconds === 60 * 60 * 24) {
    return "1day";
  }

  return `${Math.ceil(seconds / 60 / 60 / 24)}days`;
}

export function secondsToLongString(time: number) {
  const seconds = Math.floor(time % 60);
  const minutes = Math.floor((time / 60) % 60);
  const hours = Math.floor((time / 60 / 60) % 24);
  const days = Math.floor(time / 60 / 60 / 24);

  return [
    days && `${days}days`,
    hours && `${hours}hrs`,
    minutes && `${minutes}mins`,
    seconds && `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getTimeLeft(createdAt: number, totalTime: number) {
  const millisecondsElapsed = Date.now() - createdAt;
  if (millisecondsElapsed > totalTime * 1000) {
    return 0;
  }

  return totalTime - millisecondsElapsed / 1000;
}
