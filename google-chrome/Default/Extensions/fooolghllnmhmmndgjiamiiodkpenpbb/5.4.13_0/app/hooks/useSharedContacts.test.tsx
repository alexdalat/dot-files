import { renderHook, waitFor } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { IItem } from '@common/interfaces/item';
import { ItemType } from '@common/constants/vault';
import { OWNERS_IDENTITY_ID } from '@common/constants';
import * as api from '@extension/app/api';
import { TFolderItem } from '@common/contracts/contracts';
import { ReactNode } from 'react';
import * as getIsFeatureEnabled from '@extension/app/utils/getIsFeatureEnabled';
import { useSharedContacts } from './useSharedContacts';

jest.mock('@extension/app/utils/getIsFeatureEnabled');

const passwordItem = {
  uuid: '1234',
  shared: true,
  type: ItemType.Password,
} as IItem;

const setup = (item = passwordItem) => renderHook(
  () => useSharedContacts(item),
  { wrapper: ({ children }: { children?: ReactNode }) => wrapWithProviders(children) },
);

describe('useSharedContacts', () => {
  beforeEach(() => {
    jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(true);
  });

  afterEach(jest.clearAllMocks);

  it('should return shared users', async () => {
    const firstSharedUser = { email: 'joe.doe@nordsec.com', owner: false };
    const secondSharedUser = { email: 'jane.doe@nordsec.com', owner: false };
    const group = { email: '', owner: false };

    jest.spyOn(api, 'sendMessage').mockResolvedValue({
      shares: [
        firstSharedUser,
        secondSharedUser,
        group,
      ],
    });

    const { result } = setup();

    await waitFor(() => {
      const { sharedUsers } = result.current;
      expect(sharedUsers).toContain(firstSharedUser);
      expect(sharedUsers).toContain(secondSharedUser);
      expect(sharedUsers).not.toContain(group);
    });
  });

  it('should ignore owners item if item is not shared folder', async () => {
    const share = { email: '', identity_key_id: OWNERS_IDENTITY_ID };
    const folder = { uuid: '1234', shared: true, type: ItemType.Folder, shared_folder: false } as TFolderItem;

    jest.spyOn(api, 'sendMessage').mockResolvedValue({ shares: [share] });

    const { result } = setup(folder);

    await waitFor(() => {
      const { sharedUsers } = result.current;
      expect(sharedUsers.length).toBe(0);
    });
  });

  it('should update owners item if item is shared folder', async () => {
    const share = { identity_key_id: OWNERS_IDENTITY_ID };
    const sharedFolder = { uuid: '9876', shared: true, type: ItemType.Folder, shared_folder: true } as TFolderItem;

    jest.spyOn(api, 'sendMessage').mockResolvedValue({ shares: [share] });

    const { result } = setup(sharedFolder);

    await waitFor(() => {
      const { sharedUsers } = result.current;
      expect(sharedUsers[0]).toStrictEqual({ ...share, is_owners: true });
    });
  });
});
