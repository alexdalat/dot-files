import { ReactNode } from 'react';
import { ShareStatus, SortingType } from '@common/constants/vault';
import { showToast, ToastEventType } from '@common/components/ToastNotification/ToastNotificationUtils';
import { IItem } from '@common/interfaces/item';
import { withCopyPermissions } from '@common/utils/withPermissions';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { getSecret } from '@extension/app/api/VaultApi';
import { api } from '@extension/app/api';

export const isItemWithHeader = (items: Array<IItem>, index: number, sortingType?: SortingType) => {
  const item = items[index];
  const previousItem = items[index - 1];

  const isPreviousItemPending = previousItem?.share_status === ShareStatus.Pending;
  const isItemPending = item?.share_status === ShareStatus.Pending;

  const firstPreviousItemChar = previousItem?.title?.charAt(0).toLowerCase();
  const firstItemChar = item?.title?.charAt(0).toLowerCase();
  const areBothFirstCharsSame = firstPreviousItemChar === firstItemChar;

  return (
    sortingType === SortingType.Alpha &&
    (
      !index ||
      (!isItemPending && isPreviousItemPending) ||
      (!isItemPending && !areBothFirstCharsSame)
    )
  );
};

export const getItemHeight = (items: Array<IItem>, index: number, sortingType?: SortingType) => {
  const defaultHeight = 56;
  const headerHeight = 34;
  return isItemWithHeader(items, index, sortingType) ? defaultHeight + headerHeight : defaultHeight;
};

export const showFeedback = (bodyText: ReactNode) => {
  showToast(ToastEventType.ActionFeedback, { bodyText, hasActions: false });
};

const actionWithFeedback = (action: () => void, bodyText: ReactNode) => {
  action();
  showFeedback(bodyText);
};

export const copyWithFeedback = (value: string, actionText: ReactNode) => actionWithFeedback(
  () => api.extension.copyToClipboard(value),
  actionText,
);

export const copySecret = (itemUuid: string, actionText: ReactNode) => {
  withCopyPermissions(async () => {
    const pass = await getSecret(itemUuid);
    copyWithFeedback(pass, actionText);
  }, logMessage, 'copySecret');
};

export const permittedCopyWithFeedback = async (value: string, actionText: ReactNode) => {
  await withCopyPermissions(async () => copyWithFeedback(value, actionText), logMessage, 'permittedCopyWithFeedback');
};
