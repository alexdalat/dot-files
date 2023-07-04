import { useEffect, useState } from 'react';
import { getOs } from '@common/services/getOs';
import { Browser } from '@common/constants';
import { getBrowser } from '@common/utils/getBrowser';

const os = getOs();
const browser = getBrowser();
const SHOW_COUNTER = os === 'Mac' && browser !== Browser.Firefox && browser !== Browser.Safari;

interface IMacRefreshCounterProps {
  isPopup: boolean;
}

export const MacRefreshCounter = ({ isPopup }: IMacRefreshCounterProps) => {
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPopup && SHOW_COUNTER) {
      interval = setInterval(() => {
        setRefreshCounter(c => c + 1);
      }, 100);
    }
    return () => interval ? clearInterval(interval) : undefined;
  }, [isPopup]);

  if (isPopup && SHOW_COUNTER) {
    return <div className="select-none absolute text-transparent -z-1">{refreshCounter}</div>;
  }

  return null;
};
