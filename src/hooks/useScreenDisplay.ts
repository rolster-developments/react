import { SealedPartial } from '@rolster/commons';
import { ReactNode, useEffect, useState } from 'react';

export const SCREEN_DISPLAY_BREAKPOINT = 640;

export class ScreenDisplayState extends SealedPartial<
  ReactNode,
  void,
  {
    mobile: () => ReactNode;
    web: () => ReactNode;
  }
> {
  public static mobile(): ScreenDisplayState {
    return new ScreenDisplayState('mobile');
  }

  public static web(): ScreenDisplayState {
    return new ScreenDisplayState('web');
  }
}

function isMobile(breakpoint: number): boolean {
  return window.innerWidth <= breakpoint;
}

function screenDisplayState(breakpoint: number): ScreenDisplayState {
  return isMobile(breakpoint)
    ? ScreenDisplayState.mobile()
    : ScreenDisplayState.web();
}

export function useScreenDisplay(
  breakpoint = SCREEN_DISPLAY_BREAKPOINT
): ScreenDisplayState {
  const [state, setState] = useState(() => screenDisplayState(breakpoint));

  useEffect(() => {
    const onResize = () => {
      setState((state) =>
        state.is('mobile') === isMobile(breakpoint)
          ? state
          : screenDisplayState(breakpoint)
      );
    };

    onResize();

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [breakpoint]);

  return state;
}
