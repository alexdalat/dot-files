import { useState, useCallback, UIEvent } from 'react';

export const useIsScrolled = (minHeightToScroll = 10): [(event: UIEvent<HTMLElement>) => void, boolean] => {
  const [isScrolled, setIsScrolled] = useState(false);

  const onScroll = useCallback((event: UIEvent<HTMLElement>) => {
    setIsScrolled(prev => {
      if (event.currentTarget?.scrollTop >= minHeightToScroll && !prev) {
        return true;
      }
      if (event.currentTarget?.scrollTop < minHeightToScroll && prev) {
        return false;
      }
      return prev;
    });
  }, [minHeightToScroll]);

  return [onScroll, isScrolled];
};
