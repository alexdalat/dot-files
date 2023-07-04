import { IItem } from '@common/interfaces/item';

export const updateTrashItems = (previous: Array<IItem>, changes: Array<IItem>) => {
  const updated = previous.slice(0);

  changes.forEach(item => {
    const index = updated.findIndex(i => i.uuid === item.uuid);
    if (index === -1) {
      if (item.deleted_at) {
        updated.push(item);
      }
    } else if (item.deleted_at) {
      updated[index] = item;
    } else {
      updated.splice(index, 1);
    }
  });

  return updated;
};
