import { Menu } from '@common/components/Menu/Menu';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { useMenuState } from '@common/components/Menu/useMenuState';
import { AccessLevel } from '@common/interfaces/item';
import { ItemActionModalType } from '@common/store/reducers/itemActionModalsReducer/itemActionModalsConstants';
import { api } from '@extension/app/api';
import { VaultLink } from '@extension/app/components/VaultLink';
import { ComponentType, memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAction } from '@common/hooks/useAction/useAction';
import { VaultContext } from '@extension/app/context/VaultContext';
import { DeleteSharedFolderModal } from './DeleteSharedFolderModal';

interface ISharedFolderActions {
  folderUuid: string;
  folderAcl?: AccessLevel;
  button: ComponentType<{ onClick: () => void }>;
  onMenuToggle?: (folderUuid?: string) => void;
}

export const SharedFolderActions = memo(({
  folderUuid,
  folderAcl,
  button: Button,
  onMenuToggle,
}: ISharedFolderActions) => {
  const { close: onClose, toggleOpen: onToggle, isOpen } = useMenuState();
  const { vaultItems } = useContext(VaultContext);

  const isFolderWithItems = useMemo(
    () => vaultItems.some(item => item.folder_id === folderUuid),
    [vaultItems, folderUuid],
  );

  const handleDeleteFolder = useCallback(
    () => api.item.delete([{ uuid: folderUuid }], true),
    [folderUuid],
  );

  const { action: deleteFolder } = useAction(handleDeleteFolder);

  const menuItems = useMemo(() => (
    [
      {
        isEnabledFor: [AccessLevel.Owner, AccessLevel.User],
        key: 'rename',
        content: (
          <VaultLink
            id="shared-folder-rename-link"
            className="color-primary block py-1 px-3"
            onClick={() => {
              api.extension.openDesktopApp({ route: 'EDIT_SHARED_FOLDER', args: [folderUuid] });
              onToggle();
            }}
          >
            <FormattedMessage id="rename" />
          </VaultLink>
        ),
      },
      {
        isEnabledFor: [AccessLevel.Owner, AccessLevel.User],
        key: 'share',
        content: (
          <span
            role="button"
            tabIndex={0}
            className="block py-1 px-3"
            onClick={() => {
              api.extension.openDesktopApp({
                modal: { itemId: folderUuid, modalType: ItemActionModalType.Share },
              });
              onToggle();
            }}
          >
            <FormattedMessage id="share" />
          </span>
        ),
      },
      {
        isEnabledFor: [AccessLevel.Owner],
        key: 'delete',
        content: (
          <DeleteSharedFolderModal
            folderId={folderUuid}
            button={props => (
              <span
                role="button"
                className="block py-1 px-3"
                {...props}
                {...!isFolderWithItems ? { onClick: deleteFolder } : {}}
              >
                <FormattedMessage id="delete" />
              </span>
            )}
          />
        ),
      },
    ].filter(item => folderAcl && item.isEnabledFor.includes(folderAcl))
  ), [deleteFolder, folderAcl, folderUuid, isFolderWithItems, onToggle]);

  useEffect(() => {
    onMenuToggle?.(isOpen ? folderUuid : undefined);
  }, [folderUuid, isOpen, onMenuToggle]);

  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Menu
      isCloseOnItemClickDisabled
      isOpen={isOpen}
      button={<Button onClick={onToggle} />}
      onClose={onClose}
    >
      {menuItems.map(item => (
        <MenuItem key={item.key} component="span" spacingClassName="">
          {item.content}
        </MenuItem>
      ))}
    </Menu>
  );
});
