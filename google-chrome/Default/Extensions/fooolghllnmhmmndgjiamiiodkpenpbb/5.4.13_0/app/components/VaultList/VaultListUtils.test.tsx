import { SortingType, ShareStatus } from '@common/constants/vault';
import { IItem } from '@common/interfaces/item';
import { getItemHeight, isItemWithHeader } from './VaultListUtils';

describe('VaultListUtils', () => {
  const items = [
    { title: 'aa', share_status: ShareStatus.Accepted },
    { title: 'ab', share_status: ShareStatus.Pending },
    { title: 'ac', share_status: ShareStatus.Pending },
    { title: 'ad', share_status: ShareStatus.Pending },
    { title: 'ba', share_status: ShareStatus.Pending },
    { title: 'bb', share_status: ShareStatus.Accepted },
    { title: 'bc', share_status: ShareStatus.Accepted },
    { title: 'bd', share_status: ShareStatus.Pending },
    { title: 'ca', share_status: ShareStatus.Accepted },
    { title: 'cb', share_status: ShareStatus.Pending },
    { title: 'cc', share_status: ShareStatus.Accepted },
    { title: 'cd', share_status: ShareStatus.Pending },
  ] as Array<IItem>;

  describe('isItemWithHeader', () => {
    it.each([
      { index: 0, type: SortingType.Alpha, result: true },
      { index: 1, type: SortingType.Alpha, result: false },
      { index: 2, type: SortingType.Alpha, result: false },
      { index: 3, type: SortingType.Alpha, result: false },
      { index: 4, type: SortingType.Alpha, result: false },
      { index: 5, type: SortingType.Alpha, result: true },
      { index: 11, type: SortingType.Alpha, result: false },
      { index: 0, type: SortingType.Recent, result: false },
      { index: 1, type: SortingType.Recent, result: false },
      { index: 2, type: SortingType.Recent, result: false },
      { index: 3, type: SortingType.Recent, result: false },
      { index: 4, type: SortingType.Recent, result: false },
      { index: 11, type: SortingType.Recent, result: false },
    ])('should correctly detect items as with or without header', async ({ index, type, result }) => {
      expect(isItemWithHeader(items, index, type)).toBe(result);
    });
  });

  describe('getItemHeight', () => {
    it.each([
      { index: 0, type: SortingType.Alpha, result: 90 },
      { index: 1, type: SortingType.Alpha, result: 56 },
      { index: 2, type: SortingType.Alpha, result: 56 },
      { index: 3, type: SortingType.Alpha, result: 56 },
      { index: 4, type: SortingType.Alpha, result: 56 },
      { index: 11, type: SortingType.Alpha, result: 56 },
      { index: 0, type: SortingType.Recent, result: 56 },
      { index: 1, type: SortingType.Recent, result: 56 },
      { index: 2, type: SortingType.Recent, result: 56 },
      { index: 3, type: SortingType.Recent, result: 56 },
      { index: 4, type: SortingType.Recent, result: 56 },
      { index: 11, type: SortingType.Recent, result: 56 },
    ])('should detect correct item heights', async ({ index, type, result }) => {
      expect(getItemHeight(items, index, type)).toBe(result);
    });
  });
});
