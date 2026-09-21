import type { LabWriteAction } from "@/types";

const HIGHLIGHT_CLASS = "lab-action-highlight";
const HIGHLIGHT_MS = 1600;

export function scrollToLabAction(action: LabWriteAction): boolean {
  const element = document.querySelector(`[data-action="${CSS.escape(action)}"]`);
  if (!(element instanceof HTMLElement)) return false;

  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add(HIGHLIGHT_CLASS);
  window.setTimeout(() => {
    element.classList.remove(HIGHLIGHT_CLASS);
  }, HIGHLIGHT_MS);
  return true;
}
