import { ItemType } from '@common/constants/vault';
import { FeatureFlag } from '@common/constants/featureFlag';
import { ISharedUser, TFolderItem } from '@common/contracts/contracts';
import { AccessLevel, IItem } from '@common/interfaces/item';
import { showFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { VaultContext, IVaultContext } from '@extension/app/context/VaultContext';
import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import { useSharedContacts } from '@extension/app/hooks/useSharedContacts';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { mockFeatureFlag } from '@tests/utils/mockFeatureFlag';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { api } from '@extension/app/api';
import { CommonContextMenu } from './CommonContextMenu';

jest.mock('@extension/app/hooks/useSharedContacts');
jest.mock('@extension/app/hooks/useOnlineStatus');
jest.mock('@extension/app/hooks/useUserStatus');
jest.mock('@extension/app/components/VaultList/VaultListUtils');

jest.spyOn(api.extension, 'getUserEmail').mockResolvedValue('user@test.com');

const setSharedContactsMock = (sharedUsers: Array<ISharedUser> = []) => {
  (useSharedContacts as jest.Mock).mockReturnValue({
    sharedGroups: [] as Array<IItem>,
    sharedUsers,
    isLoading: false,
    errorMessage: undefined,
  });
};

const folderUuidFullRights = '1';
const folderUuidLimitedRights = '2';
const folderWithFullRights = { uuid: folderUuidFullRights, shared_folder: true, acl: AccessLevel.Owner };
const folderWithLimitedRights = { uuid: folderUuidLimitedRights, shared_folder: true, acl: AccessLevel.ReadOnly };

const defaultVaultValue: Partial<IVaultContext> = {
  vaultFolders: [],
  vaultSharedFolders: [folderWithFullRights, folderWithLimitedRights] as Array<TFolderItem>,
};

const setupTestSuite = (item: Partial<IItem> = {}, isEditHidden = false) => (
  renderWithInitEffects(wrapWithProviders(
    <VaultContext.Provider value={defaultVaultValue as IVaultContext}>
      <CommonContextMenu
        isEditHidden={isEditHidden}
        item={{ shared: true, uuid: '123', ...item } as IItem}
      />
    </VaultContext.Provider>,
  ))
);

describe('extension CommonContextMenu', () => {
  beforeEach(() => {
    (useOnlineStatus as jest.Mock).mockReturnValue({ isBackOnline: false, isOnline: true });
    (useUserStatus as jest.Mock).mockReturnValue({
      isFreeUser: false,
      isTrialAvailable: false,
      isTrial: false,
      isPremium: false,
      isBusiness: false,
    });
  });

  const assertOfflineFeedback = async (findByText: (text: string) => Promise<HTMLElement>, menuItemText: string) => {
    fireEvent.click(await findByText(menuItemText));

    expect(showFeedback).toHaveBeenCalled();
  };

  describe('Move to Folder', () => {
    const menuItemText = 'Move to Folder';

    it('is hidden for item with no personal share', async () => {
      setSharedContactsMock();
      await setupTestSuite();

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is visible when item has no shares', async () => {
      setSharedContactsMock();
      await setupTestSuite({ shared: false });

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('is visible if current user has personal access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite();

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('should be visible for item that is in shared folder with full rights', async () => {
      setSharedContactsMock();
      await setupTestSuite({ folder_id: folderUuidFullRights, acl: AccessLevel.Owner });

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('should be hidden for item that is in shared folder with limited rights', async () => {
      setSharedContactsMock();
      await setupTestSuite({ folder_id: folderUuidLimitedRights, acl: AccessLevel.Owner });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });
  });

  describe('Remove my access', () => {
    const menuItemText = 'Remove My Access';

    it('is hidden for item with no personal share', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite();

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is hidden for item owners', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ owner: true });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is visible if current user has personal access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite();

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('should show offline message if pressed when in offline mode', async () => {
      (useOnlineStatus as jest.Mock).mockReturnValue({ isOnline: false, isBackOnline: false });
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);

      const { findByText } = await setupTestSuite();
      await assertOfflineFeedback(findByText, menuItemText);
    });
  });

  describe('edit', () => {
    const menuItemText = 'Edit';

    it('should allow editing if user has full access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ acl: AccessLevel.Owner });

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('should not allow editing if user has limited access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ acl: AccessLevel.ReadOnly });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should not allow editing even if user has full access to item when `isEditHidden` is passed', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ acl: AccessLevel.Owner }, true);

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });
  });

  describe('share', () => {
    const menuItemText = 'Share';

    it('should allow sharing if user has full access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ acl: AccessLevel.Owner });

      expect(await screen.findByText(menuItemText)).toBeVisible();
    });

    it('should not allow sharing if user has limited access to item', async () => {
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);
      await setupTestSuite({ acl: AccessLevel.ReadOnly });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should be hidden for item that is in shared folder', async () => {
      setSharedContactsMock();
      await setupTestSuite({ folder_id: folderUuidFullRights, acl: AccessLevel.Owner });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should be hidden for item that has attachments', async () => {
      setSharedContactsMock();
      await setupTestSuite({ file_uuids: ['file_id'] });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });
  });

  describe('Remove from folder', () => {
    const menuItemText = 'Remove from Folder';

    it('is hidden for item that is in shared folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ folder_id: folderUuidFullRights, shared: false });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is hidden for item that is not in folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ folder_id: undefined, shared: false });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should allow removing from folder when item is in personal folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ folder_id: '123', shared: false });

      expect(screen.queryByText(menuItemText)).toBeVisible();
    });
  });

  describe('Move to Trash', () => {
    const menuItemText = 'Move to Trash';

    it('is hidden for item that is deleted', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ shared: false, deleted_at: 'date time' });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is hidden for item that is in shared folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ shared: false, folder_id: folderUuidFullRights });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('is hidden for item that is shared', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ shared: true });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should allow moving to trash when item is not shared & not deleted & not in shared folder ', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ shared: false, deleted_at: undefined });

      expect(screen.queryByText(menuItemText)).toBeVisible();
    });

    it('should show offline message if pressed when in offline mode', async () => {
      (useOnlineStatus as jest.Mock).mockReturnValue({ isOnline: false, isBackOnline: false });
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);

      const { findByText } = await setupTestSuite({ shared: false, deleted_at: undefined });
      await assertOfflineFeedback(findByText, menuItemText);
    });
  });

  describe('Delete', () => {
    const menuItemText = 'Delete';

    it('is hidden for item that is not in shared folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({});

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should allow deleting when item is in shared folder', async () => {
      setSharedContactsMock([] as Array<ISharedUser>);
      await setupTestSuite({ folder_id: folderUuidFullRights });

      expect(screen.queryByText(menuItemText)).toBeVisible();
    });
  });

  describe('Password Item History', () => {
    (StorageApi.get as jest.Mock).mockResolvedValue({
      [Storage.Features]: [mockFeatureFlag(FeatureFlag.PasswordItemHistory)],
    });
    const menuItemText = 'Password History';

    it('should be visible for item owner if item type is password', async () => {
      await setupTestSuite({ owner: true, type: ItemType.Password });

      await waitFor(() => expect(screen.queryByText(menuItemText)).toBeVisible());
    });

    it('should be hidden for item in shared folder', async () => {
      await setupTestSuite({ folder_id: folderUuidFullRights, owner: true, type: ItemType.Password });

      expect(screen.queryByText(menuItemText)).toBeNull();
    });

    it('should be hidden if user is not item owner', async () => {
      await setupTestSuite({ type: ItemType.Password });

      expect(screen.queryByText(menuItemText)).not.toBeInTheDocument();
    });

    it('should show offline message if pressed when in offline mode', async () => {
      (useOnlineStatus as jest.Mock).mockReturnValue({ isOnline: false, isBackOnline: false });
      setSharedContactsMock([{ email: 'user@test.com' }] as Array<ISharedUser>);

      const { findByText } = await setupTestSuite({ owner: true, type: ItemType.Password });
      await assertOfflineFeedback(findByText, menuItemText);
    });
  });

  describe('Attach File', () => {
    beforeEach(() => {
      setSharedContactsMock([] as Array<ISharedUser>);
    });

    const menuItemText = 'Attach File';

    it('should be visible when feature toggle is on', async () => {
      (StorageApi.get as jest.Mock).mockResolvedValue({
        [Storage.Features]: [mockFeatureFlag(FeatureFlag.FileStorageExtensionPopUp)],
      });
      await setupTestSuite({ shared: false });

      await waitFor(() => expect(screen.queryByText(menuItemText)).toBeVisible());
    });

    it('should be hidden when feature toggle is off', async () => {
      (StorageApi.get as jest.Mock).mockResolvedValue({
        [Storage.Features]: [],
      });
      await setupTestSuite({ type: ItemType.Password });

      expect(screen.queryByText(menuItemText)).toBeNull();
    });
  });

  describe('Feature Tag', () => {
    beforeEach(() => {
      setSharedContactsMock([] as Array<ISharedUser>);
    });

    const featureTagText = 'New';

    it('should be visible when feature toggle is on, user is premium and storage value is true', async () => {
      (useUserStatus as jest.Mock).mockReturnValue({
        isFreeUser: false,
        isTrialAvailable: false,
        isTrial: false,
        isPremium: true,
        isBusiness: false,
      });

      (StorageApi.get as jest.Mock).mockResolvedValue({
        [Storage.Features]: [
          mockFeatureFlag(FeatureFlag.FileStorageExtensionPopUp),
          mockFeatureFlag(FeatureFlag.FileStorageOnboarding),
        ],
        [Storage.ShouldShowFileStorageFeatureTag]: true,
      });

      const { findByText } = await setupTestSuite({ shared: false });

      const featureTag = await findByText(featureTagText);
      await waitFor(() => {
        expect(featureTag).toBeVisible();
      });
    });

    it('should be hidden when feature toggle is off', async () => {
      (StorageApi.get as jest.Mock).mockResolvedValue({
        [Storage.Features]: [],
      });
      await setupTestSuite({ type: ItemType.Password });

      expect(screen.queryByText(featureTagText)).toBeNull();
    });
  });
});
