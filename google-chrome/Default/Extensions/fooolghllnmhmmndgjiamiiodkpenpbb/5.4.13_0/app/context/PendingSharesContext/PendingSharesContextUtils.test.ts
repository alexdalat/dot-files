import { Notification } from '@common/constants/notification';
import { ItemType, ShareStatus } from '@common/constants/vault';
import { IItem } from '@common/interfaces/item';
import { resolvePendingTransfers } from './PendingSharesContextUtils';

describe('PendingSharesContextUtils', () => {
  const createPendingItem = (uuid: string, shareStatus = ShareStatus.Pending) => ({
    uuid,
    last_used_at: '1234',
    owner: false,
    share_status: shareStatus,
    shared: true,
    type: ItemType.Password,
    title: 'item',
  });

  const pending1 = createPendingItem('1');
  const pending2 = createPendingItem('2');

  it('should add new pending share', () => {
    const msg = {
      deleted_items: [] as Array<IItem>,
      items: [pending1],
      shares: ['1'],
      type: Notification.VaultChange,
    };

    const result = resolvePendingTransfers([pending2], msg);

    expect(result).toStrictEqual([pending2, pending1]);
  });

  it('should add share with existing share', () => {
    const msg = {
      deleted_items: [] as Array<IItem>,
      items: [pending1, pending2],
      shares: ['1', '2'],
      type: Notification.VaultChange,
    };

    const result = resolvePendingTransfers([pending2], msg);

    expect(result).toStrictEqual([pending2, pending1]);
  });

  it('should remove item if status not pending', () => {
    const msg = {
      deleted_items: [] as Array<IItem>,
      items: [createPendingItem('1', ShareStatus.Accepted)],
      shares: ['1'],
      type: Notification.VaultChange,
    };

    const result = resolvePendingTransfers([pending1], msg);

    expect(result).toStrictEqual([]);
  });

  it('should return previous if has no changes', () => {
    const msg = {
      deleted_items: [] as Array<IItem>,
      items: [] as Array<IItem>,
      shares: [] as Array<string>,
      type: Notification.VaultChange,
    };

    const result = resolvePendingTransfers([pending1], msg);

    expect(result).toStrictEqual([pending1]);
  });

  it('should remove pending share', () => {
    const msg = {
      deleted_items: [pending1],
      items: [] as Array<IItem>,
      shares: ['1'],
      type: Notification.VaultChange,
    };

    const result = resolvePendingTransfers([pending1], msg);

    expect(result).toStrictEqual([]);
  });
});
