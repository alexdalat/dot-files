import { useEffect, useState } from 'react';
import { ListenerType, Storage } from '@extension/common/constants';
import { SortingType, SortingDirection } from '@common/constants/vault';
import { StorageApi } from '@extension/browser/storageApi';
import { createListener } from '@extension/app/api/createListener';

export const useSorting = () => {
  const [sorting, setSorting] = useState({ type: SortingType.Recent, direction: SortingDirection.Asc });

  useEffect(() => {
    (async () => {
      const result = await StorageApi.get({
        [Storage.VaultSorting]: { type: SortingType.Recent, direction: SortingDirection.Asc },
      });
      setSorting(result[Storage.VaultSorting]);
    })();

    const updateSorting = (changes: Record<string, any>) => {
      if (changes[Storage.VaultSorting]) {
        setSorting(changes[Storage.VaultSorting].newValue);
      }
    };

    return createListener(updateSorting, ListenerType.StorageChange);
  }, []);

  return sorting;
};
