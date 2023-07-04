import { ItemType } from '@common/constants/vault';
import { updateTrashItems } from '@extension/app/pages/Trash/utils/updateTrashItems';
import { IItem } from '@common/interfaces/item';

describe('updateTrashItems', () => {
  it('should return list without recovered items', () => {
    const trashItems = [
      {
        title: 'item 1',
        uuid: '1',
        type: ItemType.Note,
        last_used_at: '2021-01-01',
        owner: false,
      },
      {
        title: 'item 2',
        uuid: '2',
        type: ItemType.Password,
        last_used_at: '2021-01-01',
        owner: false,
      },
      {
        title: 'item 3',
        uuid: '3',
        type: ItemType.PersonalInfo,
        last_used_at: '2021-01-01',
        owner: false,
      },
    ] as Array<IItem>;

    const recoveredItems = [
      {
        title: 'item 3',
        uuid: '3',
        type: ItemType.PersonalInfo,
        last_used_at: '2021-01-01',
        owner: false,
      },
    ] as Array<IItem>;

    expect(updateTrashItems(trashItems, recoveredItems)).toEqual([trashItems[0], trashItems[1]]);
  });
});
