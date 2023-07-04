import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { declineShare, trashSharedItem } from '@extension/app/api/VaultApi';
import { ConfirmActionModal } from '@extension/app/components/ConfirmAction/ConfirmActionModal';
import { VaultItemModalsContext } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContext';
import { VaultItemModalType } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContextContracts';

export const ItemActionModalsHandler = () => {
  const { vaultItemModalData, setVaultItemModalData } = useContext(VaultItemModalsContext);

  const closeModal = () => setVaultItemModalData(null);

  switch (vaultItemModalData?.type) {
    case VaultItemModalType.DeclinePendingShare:
      return (
        <ConfirmActionModal
          header={<FormattedMessage id="declineItem" />}
          content={<FormattedMessage id="declineItemDescription" />}
          action={() => declineShare(vaultItemModalData.itemId)}
          actionText={<FormattedMessage id="decline" />}
          onClose={closeModal}
        />
      );
    case VaultItemModalType.RemoveAccessToSharedItem:
      return (
        <ConfirmActionModal
          header={<FormattedMessage id="removeAccessHeader" />}
          content={<FormattedMessage id="removeAccessExplanation" />}
          action={() => declineShare(vaultItemModalData.itemId)}
          actionText={<FormattedMessage id="removeMyAccess" />}
          onClose={closeModal}
        />
      );
    case VaultItemModalType.MoveToTrash:
      return (
        <ConfirmActionModal
          content={<FormattedMessage id="moveSharedItemModalToDescription" />}
          action={() => trashSharedItem(vaultItemModalData.itemId)}
          header={<FormattedMessage id="moveSharedItemToTrashModalDescription" />}
          actionText={<FormattedMessage id="moveToTrash" />}
          onClose={closeModal}
        />
      );
    default:
      return null;
  }
};
