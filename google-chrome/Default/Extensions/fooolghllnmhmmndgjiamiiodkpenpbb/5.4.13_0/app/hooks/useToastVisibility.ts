import { StorageApi } from '@extension/browser/storageApi';
import { Storage, ListenerType } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';
import { useEffect, useState } from 'react';

export const useToastVisibility = () => {
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    StorageApi.set({ [Storage.IsToastVisible]: false });

    const handleToastVisibilityChange = async (changes: Record<string, any>) => {
      if (changes[Storage.IsToastVisible]) {
        setIsToastVisible(changes[Storage.IsToastVisible].newValue);
      }
    };

    return createListener(handleToastVisibilityChange, ListenerType.StorageChange);
  }, []);

  return isToastVisible;
};
