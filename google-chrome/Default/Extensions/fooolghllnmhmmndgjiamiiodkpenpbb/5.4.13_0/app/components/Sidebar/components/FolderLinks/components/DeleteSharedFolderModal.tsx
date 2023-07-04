import { useState, useCallback } from 'react';
import Modal from 'react-modal';
import { FormattedMessage } from 'react-intl';
import closeIcon from '@icons/close.svg';
import { api } from '@extension/app/api';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { Button, ErrorBlock, IButton } from '@nordpass/ui';
import { useAction } from '@common/hooks/useAction/useAction';

interface IDeleteSharedFolderModal {
  button: (props: IButton) => JSX.Element;
  folderId: string;
}

export const DeleteSharedFolderModal = ({ button: DeleteButton, folderId }: IDeleteSharedFolderModal) => {
  const [isOpen, setOpen] = useState(false);

  const handleDeleteFolder = useCallback(
    () => api.item.delete([{ uuid: folderId }], true),
    [folderId],
  );

  const {
    isLoading,
    errorMessage,
    action: deleteFolder,
  } = useAction(handleDeleteFolder, { onSuccess: () => setOpen(false) });

  const handleDeleteButtonClick = () => setOpen(true);

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

            <p className="text-small leading-normal -letter-spacing-014-px">
              <FormattedMessage id="deleteSharedFolderModalDescription" />
            </p>
            <ErrorBlock className="mt-2" error={errorMessage} />
            <div className="flex mt-6 justify-end">
              <Button
                rank="danger"
                disabled={isLoading}
                isLoading={isLoading}
                onClick={deleteFolder}
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
