import { createContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { ListenerType, Storage } from '@extension/common/constants';
import { ItemType, ShareStatus, SortingDirection, SortingType } from '@common/constants/vault';
import { StorageApi } from '@extension/browser/storageApi';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { Notification } from '@common/constants/notification';
import { IItem } from '@common/interfaces/item';
import { getFolders, getGroups, getItems, sortItemsAlphabetically } from '@common/utils/vaultUtils/vaultUtils';
import { updateItems } from '@common/utils/vaultUtils/updateItems';
import { useAction } from '@common/hooks/useAction/useAction';
import { TFolderItem } from '@common/contracts/contracts';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import { getFilteredFolders } from '@common/utils/getFilteredFolders/getFilteredFolders';

export interface IVaultContext {
  vaultItems: Array<IItem>;
  vaultFolders: Array<TFolderItem>;
  vaultPersonalFolders: Array<TFolderItem>;
  vaultSharedFolders: Array<TFolderItem>;
  vaultGroups: Array<IItem>;
  isLoading: boolean;
  error: string | null;
  isInAutofill: boolean;
}

export const VaultContext = createContext<IVaultContext>({
  vaultItems: [],
  vaultFolders: [],
  vaultPersonalFolders: [],
  vaultSharedFolders: [],
  vaultGroups: [],
  isLoading: false,
  error: null,
  isInAutofill: false,
});

const fetchVaultItems = async () => {
  const result = await StorageApi.get({
    [Storage.VaultSorting]: { type: SortingType.Recent, direction: SortingDirection.Asc },
  });

  const items = await api.item.fetchItems({
    sortBy: result[Storage.VaultSorting].type,
    itemTypes: Object.values(ItemType),
  });

  return {
    items: getItems(items),
    folders: sortItemsAlphabetically(getFolders(items)),
    groups: getGroups(items),
  };
};

interface IVaultProvider {
  children: ReactNode;
  isInAutofill?: boolean;
}

export const VaultProvider = ({ children, isInAutofill = false }: IVaultProvider) => {
  const [error, setError] = useState<string | null>(null);
  const [vaultItems, setVaultItems] = useState<Array<IItem>>([]);
  const [vaultFolders, setVaultFolders] = useState<Array<IItem>>([]);
  const [vaultGroups, setVaultGroups] = useState<Array<IItem>>([]);
  const { formatMessage } = useIntl();

  const { action: fetchVault, isLoading } = useAction(fetchVaultItems, {
    onSuccess: result => {
      setError(null);
      if (result) {
        setVaultItems(result.items);
        setVaultFolders(result.folders);
        setVaultGroups(result.groups);
      } else {
        setError(formatMessage({ id: 'undefinedError' }));
        logMessage(LogLevel.Error, 'VaultContext:', `Result is empty = ${result}`);
      }
    },
    onError: error => {
      setError(error.message);
      logMessage(LogLevel.Error, 'VaultContext:', error);
    },
  });

  useEffect(() => {
    let didCancel = false;

    const handleChange = (msg: any) => {
      if (didCancel) {
        return;
      }

      if (msg.type === Notification.VaultChange) {
        const vaultChanges: Array<IItem> = msg.items || [];
        const vaultDeletes: Array<IItem> = msg.deleted_items || [];

        const vaultItemChanges = getItems(vaultChanges);
        const vaultFolderChanges = getFolders(vaultChanges);
        const vaultGroupChanges = getGroups(vaultChanges);

        const deletedItems = getItems(vaultDeletes);
        const deletedFolders = getFolders(vaultDeletes);
        const deletedGroups = getGroups(vaultDeletes);

        if (vaultGroupChanges.length || deletedGroups.length) {
          setVaultGroups(prev => updateItems(prev, vaultGroupChanges, deletedGroups));
        }

        if (vaultFolderChanges.length || deletedFolders.length) {
          setVaultFolders(prev => {
            let hasChanged = false;
            const updated = prev.slice(0);
            if (vaultFolderChanges.length) {
              hasChanged = true;
              vaultFolderChanges.forEach(item => {
                if (item.deleted_at) return;
                const ind = updated.findIndex(i => i.uuid === item.uuid);
                if (ind === -1) {
                  updated.push(item);
                } else {
                  updated[ind] = item;
                }
              });
            }

            if (deletedFolders.length) {
              deletedFolders.forEach(item => {
                const ind = updated.findIndex(i => i.uuid === item.uuid);
                if (ind !== -1) {
                  hasChanged = true;
                  updated.splice(ind, 1);
                }
              });
            }
            if (!hasChanged) {
              return prev;
            }

            sortItemsAlphabetically(updated, true);
            return updated;
          });
        }

        if (vaultItemChanges.length || deletedItems.length) {
          setVaultItems(prev => {
            let hasChanged = false;
            const updated = prev.slice(0);
            if (vaultItemChanges.length) {
              hasChanged = true;
              vaultItemChanges.forEach(item => {
                if (item.deleted_at || item.share_status === ShareStatus.Pending) {
                  return;
                }
                const ind = updated.findIndex(i => i.uuid === item.uuid);
                if (ind === -1) {
                  updated.push({ ...item, selected: false });
                } else {
                  updated[ind] = { ...item, selected: updated[ind].selected };
                }
              });
            }

            if (deletedItems.length) {
              deletedItems.forEach(item => {
                const ind = updated.findIndex(i => i.uuid === item.uuid);
                if (ind !== -1) {
                  hasChanged = true;
                  updated.splice(ind, 1);
                }
              });
            }
            if (!hasChanged) {
              return prev;
            }
            return updated;
          });
        }
      }
      if (msg.type === Notification.AccountChanged) {
        fetchVault();
      }
    };

    if (!didCancel) {
      fetchVault();
    }

    const removeListener = createListener(handleChange, ListenerType.RuntimeMessage);

    return () => {
      removeListener();
      didCancel = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({
    vaultItems,
    vaultFolders,
    vaultGroups,
    isLoading,
    error,
    isInAutofill,
    ...getFilteredFolders(vaultFolders),
  }), [vaultItems, vaultFolders, vaultGroups, isLoading, error, isInAutofill]);

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
};
