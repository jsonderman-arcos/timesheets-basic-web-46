export const TIME_LOCALE = 'en-GB';

export const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23',
};

export const TIME_FORMAT_WITH_SECONDS: Intl.DateTimeFormatOptions = {
  ...TIME_FORMAT,
  second: '2-digit',
};

export const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  hourCycle: 'h23',
};

export const DATE_TIME_WITH_SECONDS_FORMAT: Intl.DateTimeFormatOptions = {
  ...DATE_TIME_FORMAT,
  second: '2-digit',
};

export const TIME_INPUT_PROPS = {
  lang: TIME_LOCALE,
} as const;

export const formatTimeValue = (timeString: string | null | undefined, fallback = 'Not recorded') => {
  if (!timeString) return fallback;
  const time = new Date(`2000-01-01T${timeString}`);
  if (Number.isNaN(time.getTime())) {
    return fallback;
  }
  return time.toLocaleTimeString(TIME_LOCALE, TIME_FORMAT);
};

export const formatDateTimeValue = (
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = DATE_TIME_FORMAT,
  fallback = ''
) => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : fallback;
  }
  return date.toLocaleString(TIME_LOCALE, options);
};
