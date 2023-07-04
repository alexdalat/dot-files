import { ItemUseReason } from '@common/constants/vault';
import { Action } from '@common/constants/action';
import { IGNORED_ERRORS_LIST } from '@common/constants/ignoredErrorsList';
import { INoteItem, IPasswordItem } from '@common/contracts/contracts';
import { IItem } from '@common/interfaces/item';
import { showAlert } from '@common/utils/alerts';
import { getIsCreditCard } from '@common/utils/itemTypeGuards';
import { translationsService } from '@extension/app/utils/translations/translationsService';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { api, sendMessage } from './index';

const showError = async (error: Error, errorMessageId: string) => {
  const result = await StorageApi.get({ [Storage.OnlineStatus]: null });
  const { formatMessage } = translationsService.getIntl();

  if (result[Storage.OnlineStatus]) {
    showAlert(formatMessage({ id: errorMessageId }));
  } else {
    showAlert(error.message);
  }
};

export const getItem = <T extends IItem>(uuid: string, reason: ItemUseReason = ItemUseReason.View) => {
  const { formatMessage } = translationsService.getIntl();
  return api.item.fetchItem<T>(uuid, reason).catch(() => showAlert(formatMessage({ id: 'errorWhileAccessingItem' })));
};

export const getSecret = async (uuid: string): Promise<any> => {
  const item = await getItem(uuid, ItemUseReason.ViewSecret);

  if (!item) {
    return null;
  }

  if (getIsCreditCard(item)) {
    return { card_number: item.card_number, cvc: item.cvc, pin: item.pin };
  }

  return (item as IPasswordItem | INoteItem).secret;
};

export const getItemSecretChanges = async (uuid: string): Promise<any> => {
  const item = await getItem(uuid, ItemUseReason.GetChanges);

  if (!item) {
    return null;
  }

  if (getIsCreditCard(item)) {
    return { card_number: item.card_number, cvc: item.cvc, pin: item.pin };
  }

  return (item as IPasswordItem | INoteItem).secret;
};

export const duplicatePersonalInfo = (item: IItem) =>
  sendMessage(Action.DuplicatePersonalInfo, { item }).catch(error => {
    if (!IGNORED_ERRORS_LIST.includes(error.message)) {
      showError(error, 'duplicatingPersonalInfoError');
    }
  });

export const trashItem = (uuid: string) =>
  api.item.trash([{ uuid }]).catch(error => showError(error, 'deletingItemsError'));

export const restoreItem = (uuid: string) =>
  api.item.restore([{ uuid }]).catch(error => showError(error, 'errorOnRestoring'));

export const trashSharedItem = async (uuid: string) => {
  try {
    await api.share.removeShares([{ uuid }]);
    await api.item.trash([{ uuid }]);
  } catch (error) {
    showError(error, 'deletingItemsError');
  }
};

export const declineShare = (uuid: string) =>
  api.share.removeShares([{ uuid }]).catch(error => showError(error, 'errorOnDeclining'));

export const deleteItem = (uuid: string) =>
  api.item.delete([{ uuid }]).catch(error => showError(error, 'deletingItemsError'));

export const deleteFolder = (uuid: string, shouldDeleteItems: boolean) =>
  api.item.delete([{ uuid }], shouldDeleteItems).catch(error => showError(error, 'deletingItemsError'));
