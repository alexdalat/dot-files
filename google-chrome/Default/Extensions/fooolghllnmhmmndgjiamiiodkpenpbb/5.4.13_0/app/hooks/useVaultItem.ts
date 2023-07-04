import { useRefState } from '@common/hooks/useRefState';
import isEqual from 'fast-deep-equal';
import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@common/constants/routes';
import { ItemUseReason } from '@common/constants/vault';
import { getItem } from '@extension/app/api/VaultApi';
import { createListener } from '@extension/app/api/createListener';
import { TNonFolderItem, ICreditCardItem, IPasswordItem, INoteItem } from '@common/contracts/contracts';
import { ListenerType } from '@extension/common/constants';
import { INotification, isVaultChangeNotification } from '@common/interfaces/messages';
import { IItem } from '@common/interfaces/item';
import { SECOND } from '@common/constants/time';

const IGNORED_FIELDS = [
  'last_used_at',
  'id',
  'secret',
  'card_number',
  'cvc',
  'pin',
  'selected',
  'folder_name',
  'user_id',
] as Array<keyof IItem>;

const clearSensitiveData = (item: TNonFolderItem) => ({
  ...item,
  card_number: undefined as ICreditCardItem['card_number'],
  cvc: undefined as ICreditCardItem['cvc'],
  pin: undefined as ICreditCardItem['pin'],
  secret: undefined as IPasswordItem['secret'] | INoteItem['secret'],
});

export const isItemUpdated = (prevItem: IItem, updated: IItem): boolean => {
  const oldItem = { ...prevItem };
  const newItem = { ...updated };

  IGNORED_FIELDS.forEach(key => {
    delete oldItem[key];
    delete newItem[key];
  });

  return !isEqual(oldItem, newItem);
};

export const useVaultItem = (uuid: string | undefined) => {
  const [item, setItem] = useRefState<IItem>();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const getVaultItem = useCallback(async (uuid: IItem['uuid'], reason?: ItemUseReason) => {
    if (!uuid) {
      return;
    }

    const result = await getItem(uuid, reason);
    if (result) {
      setItem(clearSensitiveData(result));
    }
  }, [setItem]);

  useEffect(() => {
    if (uuid) {
      getVaultItem(uuid);
    }
  }, [getVaultItem, uuid]);

  useEffect(() => {
    const handleVaultChanges = (msg: INotification) => {
      if (isVaultChangeNotification(msg)) {
        const vaultChanges: Array<TNonFolderItem> = msg.items || [];
        const updated = vaultChanges.find(i => i.uuid === uuid);

        if (updated && item?.uuid === updated.uuid) {
          if (uuid && isItemUpdated(item, updated)) {
            getVaultItem(uuid, ItemUseReason.GetChanges);
            return;
          }
        }

        const vaultDeletes = msg.deleted_items || [];
        const ind = vaultDeletes.findIndex(i => i.uuid === uuid);

        if (ind !== -1) {
          // A workaround, since viewing the deleted item immediately creates VAULT/CHANGED event,
          // which contains the deleted item inside its payload, we need to ignore and only react to its deletion date,
          // as that's what matters here.
          const itemDeletedDate = msg.items.find(item => item.uuid === uuid)?.deleted_at;
          if (typeof itemDeletedDate === 'string' && (Date.now() - new Date(itemDeletedDate).getTime()) >= 5 * SECOND) {
            return;
          }

          if (pathname.includes(`${ROUTES.VAULT}/`)) {
            navigate(ROUTES.VAULT);
          }

          if (pathname.includes(`${ROUTES.TRASH}/`)) {
            navigate(ROUTES.TRASH);
          }
        }
      }
    };

    return createListener(handleVaultChanges, ListenerType.RuntimeMessage);
  }, [getVaultItem, item, navigate, pathname, uuid]);

  return item;
};
