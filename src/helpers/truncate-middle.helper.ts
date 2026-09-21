const ELLIPSIS = "…";
const MIN_HEAD_CHARS = 6;
const MIN_TAIL_CHARS = 6;

export function truncateMiddle(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  const budget = Math.max(
    maxChars - ELLIPSIS.length,
    MIN_HEAD_CHARS + MIN_TAIL_CHARS,
  );
  const headChars = Math.max(MIN_HEAD_CHARS, Math.ceil(budget * 0.55));
  const tailChars = Math.max(MIN_TAIL_CHARS, budget - headChars);

  if (headChars + tailChars >= value.length) {
    return value;
  }

  return `${value.slice(0, headChars)}${ELLIPSIS}${value.slice(-tailChars)}`;
}

export const ADDRESS_TRUNCATE_MIN_HEAD = MIN_HEAD_CHARS;
export const ADDRESS_TRUNCATE_MIN_TAIL = MIN_TAIL_CHARS;
