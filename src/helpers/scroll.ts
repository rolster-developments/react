export function scrollToPosition(
  element?: HTMLElement | null,
  position = 0
): void {
  if (!element) {
    return;
  }

  const { matches } = window.matchMedia('(prefers-reduced-motion: reduce)');

  element.scrollTo({
    behavior: matches ? 'auto' : 'smooth',
    top: position
  });
}
