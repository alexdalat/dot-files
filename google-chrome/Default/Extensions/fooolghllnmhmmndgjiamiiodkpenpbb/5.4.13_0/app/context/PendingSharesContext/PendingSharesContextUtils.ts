import { Notification } from '@common/constants/notification';
import { IItem } from '@common/interfaces/item';
import { ShareStatus } from '@common/constants/vault';

interface IMessage {
  items: Array<IItem>;
  deleted_items: Array<IItem>;
  shares: Array<string>;
  type: Notification;
}

export const resolvePendingTransfers = (previousPending: Array<IItem>, msg: IMessage) => {
  const { items: modifiedItems, deleted_items: deletedItems } = msg;
  const newItems: Array<IItem> = [];
  const changes: Array<{ ind: number; item: IItem }> = [];
  const deletes: Array<number> = [];

  modifiedItems.forEach(item => {
    const ind = previousPending.findIndex(i => i.uuid === item.uuid);
    if (ind !== -1) {
      if (item.share_status !== ShareStatus.Pending) {
        deletes.push(ind);
      } else {
        changes.push({ ind, item });
      }
    } else if (item.share_status === ShareStatus.Pending) {
      newItems.push(item);
    }
  });

  deletedItems.forEach(item => {
    const ind = previousPending.findIndex(i => i.uuid === item.uuid);
    if (ind !== -1) {
      deletes.push(ind);
    }
  });

  if (newItems.length || changes.length || deletes.length) {
    const items = previousPending.slice(0);
    changes.forEach(({ ind, item }) => {
      items[ind] = item;
    });
    return items.filter((_: any, ind: number) => !deletes.includes(ind)).concat(newItems);
  }

  return previousPending;
};
