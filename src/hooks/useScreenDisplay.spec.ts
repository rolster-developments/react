import { act } from 'react';
import { renderHook } from '../testing';
import { ScreenDisplayState, useScreenDisplay } from './useScreenDisplay';

function resizeWindow(width: number): void {
  act(() => {
    (window as any).innerWidth = width;
    window.dispatchEvent(new Event('resize'));
  });
}

describe('ScreenDisplayState', () => {
  it('should resolve the matching branch with when', () => {
    expect(ScreenDisplayState.mobile().when({ mobile: () => 'm' })).toBe('m');
    expect(ScreenDisplayState.web().when({ web: () => 'w' })).toBe('w');
    expect(ScreenDisplayState.web().is('mobile')).toBe(false);
  });
});

describe('useScreenDisplay', () => {
  it('should be mobile when width is within the default breakpoint', () => {
    (window as any).innerWidth = 640;

    const { result } = renderHook(() => useScreenDisplay());

    expect(result.current.is('mobile')).toBe(true);
  });

  it('should be web when width exceeds the default breakpoint', () => {
    (window as any).innerWidth = 641;

    const { result } = renderHook(() => useScreenDisplay());

    expect(result.current.is('web')).toBe(true);
  });

  it('should honor a custom breakpoint', () => {
    (window as any).innerWidth = 900;

    const { result } = renderHook(() => useScreenDisplay(1024));

    expect(result.current.is('mobile')).toBe(true);
  });

  it('should update when the window crosses the breakpoint', () => {
    (window as any).innerWidth = 1200;

    const { result } = renderHook(() => useScreenDisplay());

    expect(result.current.is('web')).toBe(true);

    resizeWindow(500);

    expect(result.current.is('mobile')).toBe(true);

    resizeWindow(1300);

    expect(result.current.is('web')).toBe(true);
  });

  it('should keep the same state instance when resizing within the same display', () => {
    (window as any).innerWidth = 1200;

    const { result } = renderHook(() => useScreenDisplay());

    const state = result.current;

    resizeWindow(1000);

    expect(result.current).toBe(state);
  });

  it('should remove the resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScreenDisplay());

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

    removeSpy.mockRestore();
  });
});
