export function formatDate(value, locale = 'en-US') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError('formatDate requires a valid date.');
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function toDateInputValue(value = new Date()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError('toDateInputValue requires a valid date.');
  }
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}