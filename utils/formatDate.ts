function getFormatter(
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
) {
  return new Intl.DateTimeFormat(locale, options);
}

export function formatDate(dateValue: string | Date, locale = "en-US") {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  return getFormatter(
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    },
    locale
  ).format(date);
}

export function formatTime(timeValue: string, locale = "en-US") {
  const [hours = "0", minutes = "0"] = timeValue.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return getFormatter(
    {
      hour: "numeric",
      minute: "2-digit"
    },
    locale
  ).format(date);
}

export function formatDateTime(dateValue: string | Date, timeValue?: string, locale = "en-US") {
  const formattedDate = formatDate(dateValue, locale);

  if (!timeValue) {
    return formattedDate;
  }

  return `${formattedDate} at ${formatTime(timeValue, locale)}`;
}

export function formatRelativeDate(dateValue: string | Date) {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  const diffMs = date.getTime() - Date.now();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (Math.abs(diffHours) < 24) {
    const unit = Math.abs(diffHours) === 1 ? "hour" : "hours";
    return diffHours >= 0 ? `in ${diffHours} ${unit}` : `${Math.abs(diffHours)} ${unit} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  const unit = Math.abs(diffDays) === 1 ? "day" : "days";
  return diffDays >= 0 ? `in ${diffDays} ${unit}` : `${Math.abs(diffDays)} ${unit} ago`;
}
