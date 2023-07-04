import { useState, useEffect } from 'react';
import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<null | boolean>(null);
  const [isBackOnline, setIsBackOnline] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await StorageApi.get({ [Storage.OnlineStatus]: true });

      setIsOnline(!!result[Storage.OnlineStatus]);
    })();

    const handleChange = (changes: Record<string, any>) => {
      if (changes[Storage.OnlineStatus]) {
        const { newValue } = changes[Storage.OnlineStatus];
        setIsOnline(newValue);
        if (newValue) {
          setIsBackOnline(true);
        }
      }
    };

    return createListener(handleChange, ListenerType.StorageChange);
  }, []);

  useEffect(() => {
    if (isOnline && isBackOnline) {
      setTimeout(() => setIsBackOnline(false), 3000);
    }
  }, [isOnline, isBackOnline]);

  return {
    isOnline,
    isBackOnline,
  };
};
