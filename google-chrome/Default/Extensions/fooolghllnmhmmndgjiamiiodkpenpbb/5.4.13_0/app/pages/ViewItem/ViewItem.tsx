import { useContext, useMemo, useEffect } from 'react';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import cx from 'classnames';
import { ShareStatus } from '@common/constants/vault';
import { Platform } from '@common/constants';
import { FeatureFlag } from '@common/constants/featureFlag';
import { noOp } from '@common/constants/function';
import { ItemAccessAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { VaultContext } from '@extension/app/context/VaultContext';
import { PendingSharesContext } from '@extension/app/context/PendingSharesContext/PendingSharesContext';
import { useFileStorage } from '@extension/app/hooks/useFileStorage';
import { useVaultItem } from '@extension/app/hooks/useVaultItem';
import { SharedWith } from '@extension/app/pages/ViewItem/components/SharedWith/SharedWith';
import { ViewItemHeader } from '@extension/app/pages/ViewItem/components/ViewItemHeader/ViewItemHeader';
import { ViewItemActions } from '@extension/app/pages/ViewItem/components/ViewItemActions/ViewItemActions';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { AutofillHeader } from '@extension/autofill/components/AutofillHeader';
import { ROUTES } from '@extension/common/constants/routes';
import { ItemTypeView } from './components/ItemTypeView/ItemTypeView';
import { ViewFiles } from './components/ViewFiles/ViewFiles';
import { PendingItem } from './PendingItem';

interface IViewItem {
  selectedUid?: string;
  closeViewItems?: () => void;
}

export const ViewItem = ({ selectedUid, closeViewItems }: IViewItem) => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const id = selectedUid || params.id;
  const { vaultItems, isInAutofill } = useContext(VaultContext);
  const allShares = useContext(PendingSharesContext);
  const isFileStorageEnabled = useExtensionFeature(FeatureFlag.FileStorageExtensionPopUp);

  // useVaultItem does not listen for vault changes, only fetches item data at the moment it was called on.
  // It is needed in cases like trash, where vault data is not available. For all other cases,
  // reactive item data from vaultContext should be used.
  const frozenItemData = useVaultItem(id);
  const isTrashItem = !!useMatch(ROUTES.VIEW_TRASH_ITEM(':id'));
  const item = useMemo(() => (
    (vaultItems || []).find(i => i.uuid === id) ||
    (allShares || []).find(i => i.uuid === id) ||
    frozenItemData
  ), [allShares, frozenItemData, id, vaultItems]);

  const { files } = useFileStorage(item?.file_uuids, id);

  // share status is not included in useEffect because it will be undefined when item is first created
  const isShareStatusNotPending = item?.share_status !== ShareStatus.Pending;

  useEffect(() => {
    if (item?.uuid && isShareStatusNotPending) {
      api.action.saveItemAction(ItemAccessAction.ItemViewed, [item.uuid], Platform.Extension).catch(noOp);
    }
  }, [isShareStatusNotPending, item?.uuid]);

  const close = () => {
    if (closeViewItems) {
      closeViewItems();
    } else {
      navigate(-1);
    }
  };

  if (!item) {
    return null;
  }

  if (item.shared && item.share_status === ShareStatus.Pending) {
    return <PendingItem pendingItem={item} onClose={close} />;
  }

  return (
    <>
      {isInAutofill && (
        <AutofillHeader
          hasBackIcon
          title={item.title}
        />
      )}
      <div className={cx('flex flex-col page-slide-in bg-primary-accent-10 overflow-y-auto', isInAutofill ? 'max-h-220px' : 'h-full')}>
        <div className="flex-1 overflow-y-auto">

          <ViewItemHeader
            item={item}
            sharedWith={<SharedWith item={item} />}
            isTrash={isTrashItem}
            onClose={close}
          />

          {!isInAutofill && (
            <ViewItemActions
              item={item}
              isTrash={isTrashItem}
            />
          )}

          <ItemTypeView
            item={item}
          />

          {isFileStorageEnabled && <ViewFiles files={files} itemId={item.uuid} itemType={item.type} />}
        </div>
      </div>
    </>
  );
};
