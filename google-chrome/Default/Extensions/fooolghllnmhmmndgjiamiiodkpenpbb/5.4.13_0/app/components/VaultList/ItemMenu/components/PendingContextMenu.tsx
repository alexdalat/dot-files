import { memo, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { api } from '@extension/app/api';
import { IItem } from '@common/interfaces/item';
import { VaultItemModalsContext } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContext';
import { VaultItemModalType } from '@extension/app/context/VaultItemModalsContext/VaultItemModalsContextContracts';
import { MenuItem } from '@common/components/Menu/MenuItem';

interface IPendingContextMenu {
  item: IItem;
}

export const PendingContextMenu = memo(({ item }: IPendingContextMenu) => {
  const { setVaultItemModalData } = useContext(VaultItemModalsContext);

  const accept = () => api.share.accept([{ uuid: item.uuid, always: false }]);

  const decline = () => {
    setVaultItemModalData({ type: VaultItemModalType.DeclinePendingShare, itemId: item.uuid });
  };

  return (
    <>
      <MenuItem onClick={accept}>
        <FormattedMessage id="accept" />
      </MenuItem>

      <MenuItem
        colorClassName="text-red hover:bg-primary-accent-3"
        onClick={decline}
      >
        <FormattedMessage id="decline" />
      </MenuItem>
    </>
  );
});
