import { useCallback } from 'react';
import recoverIcon from '@icons/24/trash-recover.svg';
import trashIcon from '@icons/24/trash-black.svg';
import { useIntl } from 'react-intl';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { deleteItem, restoreItem } from '@extension/app/api/VaultApi';
import { ConfirmAction } from '@extension/app/components/ConfirmAction/ConfirmAction';
import { IItem } from '@common/interfaces/item';
import { useNavigate } from 'react-router';

interface ITrashItemActions {
  item: IItem;
  shouldGoBack?: boolean;
}

export const TrashItemActions = ({ item, shouldGoBack = false }: ITrashItemActions) => {
  const navigate = useNavigate();
  const { formatMessage } = useIntl();

  const goBack = useCallback(() => {
    if (shouldGoBack) {
      navigate(-1);
    }
  }, [navigate, shouldGoBack]);

  return (
    <div className="flex">
      <ActionButton
        className="mr-2"
        tooltipText={formatMessage({ id: 'restore' })}
        tooltipId={`restore-${item.uuid}`}
        svgIcon={recoverIcon}
        onClick={async () => {
          await restoreItem(item.uuid);
          goBack();
        }}
      />
      <ConfirmAction
        button={props => (
          <ActionButton
            svgIcon={trashIcon}
            tooltipText={formatMessage({ id: 'delete' })}
            tooltipId={`delete-${item.uuid}`}
            iconClassName="icon-fill-red"
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
    </div>
  );
};
