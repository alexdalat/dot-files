import { deleteFolder } from '@extension/app/api/VaultApi';
import { useContext, useState, useMemo, useCallback } from 'react';
import Modal from 'react-modal';
import { FormattedMessage } from 'react-intl';
import closeIcon from '@icons/close.svg';
import { api } from '@extension/app/api';
import { VaultContext } from '@extension/app/context/VaultContext';
import { IItem } from '@common/interfaces/item';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { Button, Checkbox, ErrorBlock } from '@nordpass/ui';
import { useAction } from '@common/hooks/useAction/useAction';

interface IDeleteFolderModalProps {
  button: (props: any) => JSX.Element;
  folderId: string;
}

export const DeleteFolderModal = ({ button: DeleteButton, folderId }: IDeleteFolderModalProps) => {
  const [isOpen, setOpen] = useState(false);
  const [shouldDeleteItems, setShouldDeleteItems] = useState(false);

  const { vaultItems } = useContext(VaultContext);
  const folderItems: Array<IItem> = useMemo(
    () => vaultItems.filter(item => item.folder_id === folderId),
    [vaultItems, folderId],
  );

  const handleDeleteFolder = useCallback(async () => {
    if (shouldDeleteItems) {
      const items = folderItems.filter(({ shared }) => shared);
      if (items.length) {
        await api.share.removeShares(items);
      }
    }

    await deleteFolder(folderId, shouldDeleteItems);
  }, [shouldDeleteItems, folderId, folderItems]);

  const {
    isLoading,
    errorMessage,
    action,
  } = useAction(handleDeleteFolder, { onSuccess: () => setOpen(false) });

  const handleDeleteButtonClick = () => folderItems.length > 0 ? setOpen(true) : action();

  return (
    <>
      <DeleteButton onClick={handleDeleteButtonClick} />
      {isOpen && (
        <Modal
          isOpen
          shouldCloseOnEsc
          shouldCloseOnOverlayClick
          ariaHideApp={false}
          contentLabel="Confirmation modal"
          className="modal outline-none bg-primary rounded font-medium p-6 max-w-350px"
          overlayClassName="modal-overlay"
          onRequestClose={() => setOpen(false)}
        >
          <div className="relative">
            <div className="flex justify-between items-center mb-5">
              <h1 className="block color-primary font-bolder -letter-spacing-002px text-20px">
                <FormattedMessage id="deleteFolderQuestion" />
              </h1>

              <ActionButton svgIcon={closeIcon} onClick={() => setOpen(false)} />
            </div>

            {folderItems.length > 0 && (
              <>
                <span className="block color-primary text-small leading-tight">
                  <FormattedMessage id="deleteFolderText" />
                </span>
                <Checkbox
                  className="my-4"
                  label={
                    <span className="block -ml-1 color-primary text-small leading-tight">
                      <FormattedMessage id="moveItemsFromFolderToTrash" />
                    </span>
                  }
                  checked={shouldDeleteItems}
                  onChange={() => setShouldDeleteItems(!shouldDeleteItems)}
                />
              </>
            )}
            <ErrorBlock className="mt-2" error={errorMessage} />
            <div className="mt-6 justify-right">
              <Button
                className="ml-auto"
                rank="danger"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={action}
              >
                <FormattedMessage id="delete" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
