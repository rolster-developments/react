import { scrollToPosition } from './scroll';

function createElement(): HTMLElement & { scrollTo: ReturnType<typeof vi.fn> } {
  const element = document.createElement('div');

  (element as any).scrollTo = vi.fn();

  return element as any;
}

function mockReducedMotion(matches: boolean): void {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as any;
}

describe('scrollToPosition', () => {
  it('should scroll smoothly to top by default', () => {
    mockReducedMotion(false);

    const element = createElement();

    scrollToPosition(element);

    expect(element.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 0
    });
  });

  it('should scroll to the given position', () => {
    mockReducedMotion(false);

    const element = createElement();

    scrollToPosition(element, 120);

    expect(element.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 120
    });
  });

  it('should use auto behavior when user prefers reduced motion', () => {
    mockReducedMotion(true);

    const element = createElement();

    scrollToPosition(element);

    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    );
    expect(element.scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 0
    });
  });

  it('should do nothing when element is null or undefined', () => {
    mockReducedMotion(false);

    expect(() => scrollToPosition(null)).not.toThrow();
    expect(() => scrollToPosition(undefined)).not.toThrow();
    expect(window.matchMedia).not.toHaveBeenCalled();
  });
});
