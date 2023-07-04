import { useAction } from '@common/hooks/useAction/useAction';
import { ReactNode, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import Modal from 'react-modal';
import * as closeIcon from '@icons/close.svg';
import { Button } from '@nordpass/ui';
import { FormattedMessage } from 'react-intl';
import { ActionButton } from '@common/components/ActionButton/ActionButton';

interface IConfirmActionModal {
  header: ReactNode;
  content: ReactNode;
  action: () => void;
  actionText: ReactNode;
  onClose: (event?: ReactMouseEvent<Element, MouseEvent> | ReactKeyboardEvent<Element>) => void;
  isOpen?: boolean;
  isDestructiveConfirmation?: boolean;
}

export const ConfirmActionModal = ({
  header,
  content,
  action,
  actionText,
  onClose,
  isOpen = true,
  isDestructiveConfirmation = true,
}: IConfirmActionModal) => {
  const {
    action: confirmAction,
    isLoading,
  } = useAction(action, {
    onSuccess: () => {
      onClose();
    },
  });

  return (
    <Modal
      shouldCloseOnEsc
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Confirmation modal"
      className="modal outline-none bg-primary rounded color-primary-accent-8 font-medium w-343px mx-4 p-6"
      overlayClassName="modal-overlay"
      onRequestClose={onClose}
    >

      <div className="flex justify-between items-center mb-5">
        <h1 className="block color-primary font-bolder -letter-spacing-002px text-20px">
          {header}
        </h1>

        <ActionButton
          svgIcon={closeIcon}
          onClick={onClose}
        />
      </div>

      <span className="block text-small leading-normal">
        {content}
      </span>

      <div className="mt-6 text-right flex-col">
        <Button
          rank={isDestructiveConfirmation ? 'danger' : 'primary'}
          className="w-full mb-2"
          data-testid="modal-confirm-action"
          isLoading={isLoading}
          onClick={confirmAction}
        >
          {actionText}
        </Button>
        <Button
          rank="secondary"
          className="w-full"
          onClick={onClose}
        >
          <FormattedMessage id="cancel" />
        </Button>
      </div>
    </Modal>
  );
};
