import { useState, ReactNode, ComponentType, useCallback, MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { ConfirmActionModal } from './ConfirmActionModal';

interface IConfirmActionModal {
  button: ComponentType<{ onClick: () => void }>;
  header: ReactNode;
  content: ReactNode;
  action: () => Promise<void>;
  actionText: ReactNode;
  buttonAction?: () => void;
}

export const ConfirmAction = ({
  button: OpenButton,
  header,
  content,
  action,
  actionText,
  buttonAction,
}: IConfirmActionModal) => {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback((event?: ReactMouseEvent<Element, MouseEvent> | ReactKeyboardEvent<Element>) => {
    event?.stopPropagation();
    setIsOpen(false);
  }, []);

  const handleClick = () => {
    buttonAction?.();
    setIsOpen(true);
  };

  return (
    <>
      <OpenButton onClick={handleClick} />
      {isOpen && (
        <ConfirmActionModal
          header={header}
          content={content}
          action={action}
          actionText={actionText}
          onClose={close}
        />
      )}
    </>
  );
};
