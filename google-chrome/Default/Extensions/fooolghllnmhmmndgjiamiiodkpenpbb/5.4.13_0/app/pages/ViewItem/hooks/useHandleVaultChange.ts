import { Notification } from '@common/constants/notification';
import { TNonFolderItem } from '@common/contracts/contracts';
import { IItem } from '@common/interfaces/item';
import { createListener } from '@extension/app/api/createListener';
import { INotification } from '@common/interfaces/messages';
import { isItemUpdated } from '@extension/app/hooks/useVaultItem';
import { ListenerType } from '@extension/common/constants';
import { useEffect } from 'react';

export const useHandleVaultChange = (item: IItem, uuid: string, onVaultChange: () => void) => {
  useEffect(() => {
    const handleVaultChange = async (msg: INotification) => {
      if (msg.type === Notification.VaultChange) {
        const vaultChanges: Array<TNonFolderItem> = msg.items || [];
        const updatedItem = vaultChanges.find(i => i.uuid === uuid);

        if (updatedItem && item.uuid === updatedItem.uuid) {
          if (isItemUpdated(item, updatedItem)) {
            onVaultChange();
          }
        }
      }
    };

    return createListener(handleVaultChange, ListenerType.RuntimeMessage);
  }, [onVaultChange, item, uuid]);
};
