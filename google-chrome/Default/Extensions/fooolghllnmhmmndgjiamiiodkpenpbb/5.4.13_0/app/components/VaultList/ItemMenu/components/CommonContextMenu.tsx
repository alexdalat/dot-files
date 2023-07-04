import { FeatureTag } from '@common/components/FeatureOnboarding/FeatureTag/FeatureTag';
import { SvgIcon } from '@common/components/SvgIcon';
import { PremiumUpgradeModalSourceType } from '@common/constants/premiumUpgradeModalSource';
import { Size } from '@common/constants/size';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import * as errorIcon from '@icons/problem.svg';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { deleteItem, trashItem } from '@extension/app/api/VaultApi';
import { api } from '@extension/app/api';
import { AuthContext } from '@extension/app/context/AuthContext';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { FeatureFlag } from '@common/constants/featureFlag';
import { ItemType } from '@common/constants/vault';
import { noOp } from '@common/constants/function';
import { IItem } from '@common/interfaces/item';
import { ItemActionModalType } from '@common/store/reducers/itemActionModalsReducer/itemActionModalsConstants';
import { VaultItemModalsContext } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContext';
import { VaultItemModalType } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContextContracts';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { UserAction } from '@common/constants/userAction';
import { showFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { getSameItemsTranslation } from '@common/utils/getItemsTranslation';
import { getFolderName } from '@common/utils/getFolderName';
import { VaultContext } from '@extension/app/context/VaultContext';
import premiumCrownIcon from '@icons/premium-crown.svg';
import { useSharedContacts } from '@extension/app/hooks/useSharedContacts';
import { doesSharesListContainPersonalShare } from '@common/utils/doesSharesListContainPersonalShare/doesSharesListContainPersonalShare';
import { CommonActionsContainer, ICommonActionsConfig } from '@common/components/CommonActionsContainer/CommonActionsContainer';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { ConfirmAction } from '@extension/app/components/ConfirmAction/ConfirmAction';
import { getCurrentSharedFolder } from '@common/utils/getCurrentSharedFolder';
import { getHasFullRights } from '@common/utils/getHasFullRights';
import { getIsOwner } from '@common/utils/getIsOwner';

interface ICommonContextMenu {
  item: IItem;
  isShareHidden?: boolean;
  isEditHidden?: boolean;
  isAttachHidden?: boolean;
  additionalActionsConfig?: Array<ICommonActionsConfig>;
}

const DEFAULT_ADDITIONAL_ACTIONS: Array<ICommonActionsConfig> = [];

export const CommonContextMenu = ({
  item,
  isEditHidden = false,
  isShareHidden = false,
  isAttachHidden = false,
  additionalActionsConfig = DEFAULT_ADDITIONAL_ACTIONS,
}: ICommonContextMenu) => {
  const { formatMessage } = useIntl();
  const { vaultFolders, vaultSharedFolders } = useContext(VaultContext);
  const { email } = useContext(AuthContext);
  const { setVaultItemModalData } = useContext(VaultItemModalsContext);
  const { sharedUsers, isLoading } = useSharedContacts(item);
  const { isOnline } = useOnlineStatus();
  const { isBusiness, isPremium, isFreeUser } = useUserStatus();
  const isPremiumOrBusiness = isPremium || isBusiness;
  const hasPersonalShare = doesSharesListContainPersonalShare(sharedUsers, email);

  const isPasswordItemHistoryEnabled = useExtensionFeature(FeatureFlag.PasswordItemHistory);
  const isFileStorageEnabled = useExtensionFeature(FeatureFlag.FileStorageExtensionPopUp) && !isBusiness;
  const isFileStorageOnboardingEnabled = useExtensionFeature(FeatureFlag.FileStorageOnboarding);
  const [isFileStorageFeatureTagVisible, setIsFileStorageFeatureTagVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await StorageApi.get({ [Storage.ShouldShowFileStorageFeatureTag]: true });
      const shouldShowFileStorageFeatureTag = result[Storage.ShouldShowFileStorageFeatureTag];

      setIsFileStorageFeatureTagVisible(shouldShowFileStorageFeatureTag && isFileStorageOnboardingEnabled && isPremium);
    })();
  }, [isFileStorageOnboardingEnabled, isPremium]);

  const onlineOnly = (action: () => void) => {
    if (isOnline) {
      return action();
    }

    return showFeedback(
      <div className="flex items-center">
        <SvgIcon
          src={errorIcon}
          dataTestId="error-icon"
          className="mr-2"
          width={24}
          height={24}
        />
        <FormattedMessage id="offlineMessage" />
      </div>,
    );
  };

  const removeFromFolder = useCallback(() => api.item.removeFromFolder([item]).then(() => {
    showFeedback(
      <FormattedMessage
        id="itemRemovedFromFolder"
        values={{
          item: getSameItemsTranslation(1, item, formatMessage),
          folderName: getFolderName(vaultFolders, item.folder_id),
        }}
      />,
    );
  }), [formatMessage, item, vaultFolders]);

  const handleAttachClick = useCallback(() => {
    if (isFileStorageFeatureTagVisible) {
      api.action.save(UserAction.NewFeatureOnboardingTagPremiumTap);
      StorageApi.set({ [Storage.ShouldShowFileStorageFeatureTag]: false });
    }

    api.extension.openDesktopApp(
      isPremium ?
        { route: 'VIEW_ITEM', args: [item.uuid] } :
        { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.FileStorage },
    );
  }, [isFileStorageFeatureTagVisible, isPremium, item.uuid]);

  if (isLoading) {
    return null;
  }

  const sharedFolder = getCurrentSharedFolder(vaultSharedFolders, item.folder_id);
  const hasFullRights = getHasFullRights(sharedFolder || item);
  const isMovingToFolderEnabled = sharedFolder ? hasFullRights : hasPersonalShare || !item.shared;
  const hasFiles = getIfItemHasFiles(item);

  const config = [
    additionalActionsConfig,
    [
      {
        isActive: isMovingToFolderEnabled,
        component: () => (
          <MenuItem
            key="move-to-folder"
            onClick={() => {
              api.extension.openDesktopApp({
                modal: {
                  itemId: item.uuid,
                  modalType: ItemActionModalType.MoveToFolder,
                },
              });
            }}
          >
            <FormattedMessage id="moveToFolder" />
          </MenuItem>
        ),
      },
      {
        isActive: !!item.folder_id && !!isMovingToFolderEnabled && !sharedFolder,
        component: () => (
          <MenuItem key="remove-from-folder" onClick={removeFromFolder}>
            <FormattedMessage id="removeFromFolder" />
          </MenuItem>
        ),
      },
    ],
    [
      {
        isActive: hasPersonalShare && item.shared && !item.owner,
        component: () => (
          <MenuItem
            key="remove-my-access"
            colorClassName="text-red hover:bg-primary-accent-3"
            onClick={
              () => {
                onlineOnly(() => {
                  setVaultItemModalData({
                    type: VaultItemModalType.RemoveAccessToSharedItem,
                    itemId: item.uuid,
                  });
                });
              }
            }
          >
            <FormattedMessage id="removeMyAccess" />
          </MenuItem>
        ),
      },
      {
        isActive: !isEditHidden && hasFullRights,
        component: () => (
          <MenuItem key="edit" onClick={() => api.extension.openDesktopApp({ route: 'EDIT_ITEM', args: [item.uuid] })}>
            <FormattedMessage id="edit" />
          </MenuItem>
        ),
      },
      {
        isActive: isFileStorageEnabled && !isAttachHidden && !item.shared,
        component: () => (
          <MenuItem
            key="attach"
            data-testid="attach"
            className="flex justify-between"
            onClick={handleAttachClick}
          >
            <FormattedMessage id="attachFile" />
            {isFileStorageFeatureTagVisible && <FeatureTag size={Size.Small} />}
            {isFreeUser && (
              <>
                <Tooltip showOnHover id="premium">
                  <FormattedMessage id="premium" />
                </Tooltip>
                <SvgIcon
                  data-tip-premium
                  src={premiumCrownIcon}
                  className="ml-2"
                  height={16}
                  width={16}
                />
              </>
            )}
          </MenuItem>
        ),
      },

      {
        isActive: !isShareHidden && hasFullRights && !sharedFolder && !hasFiles,
        component: () => (
          <MenuItem
            key="premium"
            className="flex justify-between"
            onClick={() => {
              api.extension.openDesktopApp(
                isPremiumOrBusiness ? { route: 'SHARE_ITEM', args: [item.uuid] } : { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.Share },
              );
            }}
          >
            <FormattedMessage id="share" />
            {!isPremiumOrBusiness && (
              <>
                <Tooltip showOnHover id="premium">
                  <FormattedMessage id="premium" />
                </Tooltip>
                <SvgIcon
                  data-tip-premium
                  src={premiumCrownIcon}
                  className="ml-2"
                  height={16}
                  width={16}
                />
              </>
            )}
          </MenuItem>
        ),
      },
      {
        isActive: (
          isPasswordItemHistoryEnabled &&
          item.owner &&
          !item.deleted_at &&
          item.type === ItemType.Password &&
          !sharedFolder
        ),
        component: () => (
          <MenuItem
            key="password-history"
            data-testid="password_history"
            onClick={() => {
              onlineOnly(() => {
                api.action.save(UserAction.PasswordHistoryTap).catch(noOp);
                api.extension.openDesktopApp({ route: 'PASSWORD_HISTORY_ITEM', args: [item.uuid] });
              });
            }}
          >
            <FormattedMessage id="passwordHistory" />
          </MenuItem>
        ),
      },
      {
        isActive: !item.shared && !item.deleted_at && !sharedFolder,
        component: () => (
          <MenuItem
            key="move-to-trash"
            onClick={() => {
              onlineOnly(() => trashItem(item.uuid).then(() => api.extension.closeAutofill()));
            }}
          >
            <FormattedMessage id="moveToTrash" />
          </MenuItem>
        ),
      },
      {
        isActive: item.shared && item.owner && !sharedFolder,
        component: () => (
          <MenuItem
            key="move-to-trash"
            colorClassName="text-red hover:bg-primary-accent-3"
            onClick={() => {
              onlineOnly(() => setVaultItemModalData({ type: VaultItemModalType.MoveToTrash, itemId: item.uuid }));
            }}
          >
            <FormattedMessage id="moveToTrash" />
          </MenuItem>
        ),
      },
      {
        isActive: getIsOwner(sharedFolder),
        component: () => (
          <MenuItem
            key="delete"
            data-testid="delete"
          >
            <ConfirmAction
              button={({ onClick }) => (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <FormattedMessage id="delete" />
                </span>
              )}
              header={formatMessage({ id: 'deleteItemModalHeader' })}
              content={formatMessage({ id: 'deleteItemModalContent' })}
              action={async () => {
                await deleteItem(item.uuid);
              }}
              actionText={formatMessage({ id: 'delete' })}
            />
          </MenuItem>
        ),
      },
    ],
  ];

  return (
    <CommonActionsContainer
      config={config}
      noActionsMessage={formatMessage({ id: 'noAvailableActions' })}
    />
  );
};
