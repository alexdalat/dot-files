import { getAttachFileButtonTooltipText } from '@common/components/ViewItemActionButton/utils/getAttachFileButtonTooltipText';
import { getShareButtonTooltipText } from '@common/components/ViewItemActionButton/utils/getShareButtonTooltipText';
import { ViewItemActionButton } from '@common/components/ViewItemActionButton/ViewItemActionButton';
import { ItemType } from '@common/constants/vault';
import { FeatureFlag } from '@common/constants/featureFlag';
import { noOp } from '@common/constants/function';
import { PremiumUpgradeModalSourceType } from '@common/constants/premiumUpgradeModalSource';
import { UserAction } from '@common/constants/userAction';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import { deleteItem, restoreItem } from '@extension/app/api/VaultApi';
import { ConfirmAction } from '@extension/app/components/ConfirmAction/ConfirmAction';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import trashIcon from '@icons/24/trash-black.svg';
import recoverIcon from '@icons/24/trash-recover.svg';
import * as attachIcon from '@icons/attach.svg';
import cx from 'classnames';
import { memo, useContext } from 'react';
import * as shareIcon from '@icons/share.svg';
import { useIntl } from 'react-intl';
import { api } from '@extension/app/api';
import { VaultContext } from '@extension/app/context/VaultContext';
import { MoreItemViewActions } from '@extension/app/pages/ViewItem/components/MoreItemViewActions/MoreItemViewActions';
import { IItem } from '@common/interfaces/item';
import { getCurrentSharedFolder } from '@common/utils/getCurrentSharedFolder';
import { useNavigate } from 'react-router';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import styles from './ViewItemActions.module.scss';

export interface IViewItemActions {
  item: IItem;
  showMenu?: boolean;
  isTrash?: boolean;
}

const getUserActions = (itemType: ItemType) => {
  switch (itemType) {
    case ItemType.Password:
      return {
        tap: UserAction.AttachmentTapPasswordExtension,
      };
    case ItemType.CreditCard:
      return {
        tap: UserAction.AttachmentTapCreditCardExtension,
      };
    case ItemType.PersonalInfo:
      return {
        tap: UserAction.AttachmentTapPersonalInfoExtension,
      };
    case ItemType.Note:
      return {
        tap: UserAction.AttachmentTapNoteExtension,
      };
    case ItemType.Passkey:
      return {
        tap: UserAction.AttachmentTapPasskeyExtension,
      };
    default:
      return null;
  }
};

export const ViewItemActions = memo(({ item, showMenu = true, isTrash = false }: IViewItemActions) => {
  const navigate = useNavigate();
  const { vaultSharedFolders } = useContext(VaultContext);
  const { formatMessage } = useIntl();
  const { isBusiness, isPremium } = useUserStatus();
  const hasFiles = getIfItemHasFiles(item);
  const isFileStorageFeatureEnabled = useExtensionFeature(FeatureFlag.FileStorageExtensionPopUp);
  const isInSharedFolder = !!getCurrentSharedFolder(vaultSharedFolders, item.folder_id);
  const isPremiumOrBusiness = isPremium || isBusiness;
  const isAttachButtonVisible = isFileStorageFeatureEnabled && !isBusiness;
  const isLimitedItemAccess = isLimitedAccess(item.acl);
  const isItemLimitedOrShared = isLimitedItemAccess || item.shared;
  const userActions = getUserActions(item.type);

  const handleAttachClick = () => {
    const attachAction = userActions?.tap;

    if (attachAction) {
      api.action.save(attachAction).catch(noOp);
    }

    api.extension.openDesktopApp(
      isPremium ?
        { route: 'VIEW_ITEM', args: [item.uuid] } :
        { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.FileStorage },
    );
  };

  const handleShareClick = () => {
    api.extension.openDesktopApp(
      isPremiumOrBusiness ?
        { route: 'SHARE_ITEM', args: [item.uuid] } :
        { premiumUpgradeModalSource: PremiumUpgradeModalSourceType.Share },
    );
  };

  return (
    <div className="px-4">
      {showMenu && (
        <div className={cx(styles['view-items-actions'], 'grid grid-flow-col gap-4 pb-4')}>

          { isTrash ? (
            <>
              <ViewItemActionButton
                data-testid="view_item_restore_button"
                label={formatMessage({ id: 'restore' })}
                svgIcon={recoverIcon}
                onClick={async () => {
                  await restoreItem(item.uuid);
                  navigate(-1);
                }}
              />
              <ConfirmAction
                button={props => (
                  <ViewItemActionButton
                    svgIcon={trashIcon}
                    data-testid="view_item_delete_permanently"
                    label={formatMessage({ id: 'delete' })}
                    iconClassName="icon-fill-red"
                    labelClassName="text-red"
                    {...props}
                  />
                )}
                header={formatMessage({ id: 'deleteItemModalHeader' })}
                content={formatMessage({ id: 'deleteItemModalContent' })}
                action={async () => {
                  await deleteItem(item.uuid);
                }}
                actionText={formatMessage({ id: 'delete' })}
              />
            </>
          ) : (
            <>
              {isAttachButtonVisible && (
                <ViewItemActionButton
                  data-testid="attach"
                  svgIcon={attachIcon}
                  iconClassName="nordpass-svg"
                  tooltipText={getAttachFileButtonTooltipText(!!item.shared)}
                  tooltipId="attach-disabled"
                  disabled={isItemLimitedOrShared}
                  label={formatMessage({ id: 'attachFile' })}
                  data-test-id="attach"
                  onClick={handleAttachClick}
                />
              )}

              {!isInSharedFolder && (
                <ViewItemActionButton
                  id="view_item_share_button"
                  tooltipText={getShareButtonTooltipText(item)}
                  tooltipId="share"
                  iconClassName="nordpass-svg"
                  data-testid="share"
                  svgIcon={shareIcon}
                  label={formatMessage({ id: 'share' })}
                  disabled={isLimitedAccess(item.acl) || hasFiles}
                  onClick={handleShareClick}
                />
              )}
              <MoreItemViewActions item={item} />
            </>
          )}
        </div>

      )}
    </div>
  );
});
