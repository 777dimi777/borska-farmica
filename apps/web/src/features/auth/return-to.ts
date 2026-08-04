export function safeReturnTo(
  value: string | null | undefined,
  fallback = '/nalog',
) {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (
      !decoded.startsWith('/') ||
      decoded.startsWith('//') ||
      /^[a-z][a-z\d+.-]*:/i.test(decoded) ||
      /[\u0000-\u001f\u007f]/.test(decoded)
    )
      return fallback;
    return value;
  } catch {
    return fallback;
  }
}
