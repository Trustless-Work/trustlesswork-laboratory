import { LAB_API_KEY_HEADER } from "@/lib/trustless-work/api-key-header";

const STORAGE_KEY = "tw-lab-api-key";

export { LAB_API_KEY_HEADER };

export function getLabApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(STORAGE_KEY)?.trim();
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export function setLabApiKey(value: string): void {
  if (typeof window === "undefined") return;
  const trimmed = value.trim();
  if (!trimmed) {
    clearLabApiKey();
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, trimmed);
}

export function clearLabApiKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function maskApiKey(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= 8) return "••••••••";
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}
