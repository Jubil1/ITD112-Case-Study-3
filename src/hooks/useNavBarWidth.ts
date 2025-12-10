import { useState, useEffect, type RefObject } from "react";

export const useNavBarWidth = (
  navBarRef: RefObject<HTMLElement | null>,
  isMobile: boolean
) => {
  const [navBarWidth, setNavBarWidth] = useState<number | null>(null);

  useEffect(() => {
    if (isMobile) {
      setNavBarWidth(null);
      return;
    }

    const updateWidth = () => {
      if (navBarRef.current) {
        const width = navBarRef.current.offsetWidth;
        setNavBarWidth(width);
      }
    };

    updateWidth();

    const Observer =
      typeof window !== "undefined" && (window as any).ResizeObserver
        ? (window as any).ResizeObserver
        : null;

    const resizeObserver = Observer ? new Observer(updateWidth) : null;
    if (resizeObserver && navBarRef.current) {
      resizeObserver.observe(navBarRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [navBarRef, isMobile]);

  return navBarWidth;
};
