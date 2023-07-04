import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { CreditCardIcon } from '@common/components/CreditCardIcon/CreditCardIcon';
import { PasswordIcon } from '@common/components/PasswordIcon/PasswordIcon';
import { Size } from '@common/constants/size';
import { IItem } from '@common/interfaces/item';
import {
  getIsCreditCard,
  getIsNote,
  getIsPasskey,
  getIsPassword,
  getIsPersonalInfo,
} from '@common/utils/itemTypeGuards';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import { api } from '@extension/app/api';
import { VaultContext } from '@extension/app/context/VaultContext';
import { MoreItemViewActions } from '@extension/app/pages/ViewItem/components/MoreItemViewActions/MoreItemViewActions';
import { logMessage } from '@extension/common/utils/log/logMessage';
import * as chevLeftIcon from '@icons/24/chevron-left.svg';
import personalInfoIcon from '@icons/personal-info.svg';
import secureNoteIcon from '@icons/secure-note.svg';
import { Image } from '@nord/ui';
import cx from 'classnames';
import { memo, ReactNode, useContext } from 'react';
import { useIntl } from 'react-intl';

interface IViewItemHeader {
  item: IItem;
  onClose: () => void;
  sharedWith?: ReactNode;
  isTrash?: boolean;
}

interface IItemTypeIcon {
  item: IItem;
}

const ItemTypeIcon = ({ item }: IItemTypeIcon) => {
  const iconClassName = 'item-image-48px mt-1 mb-2';

  if (getIsPassword(item) || getIsPasskey(item)) {
    return (
      <PasswordIcon
        logMessage={logMessage}
        title={item.title}
        url={item.url}
        className={cx('text-24px rounded-image-12px item-image-32px', iconClassName)}
        uuid={item.uuid}
      />
    );
  }
  if (getIsNote(item)) {
    return (
      <Image
        className={cx('rounded-2', iconClassName)}
        src={secureNoteIcon}
        alt={item.title}
      />
    );
  }
  if (getIsCreditCard(item)) {
    return (
      <CreditCardIcon
        className={cx(item.card_type && 'rounded-image-12px', iconClassName)}
        type={item.card_type}
      />
    );
  }
  if (getIsPersonalInfo(item)) {
    return (
      <Image
        className={cx('rounded-image-12px', iconClassName)}
        src={personalInfoIcon}
        alt={item.title}
      />
    );
  }

  return null;
};

export const ViewItemHeader = memo(({ item, onClose, sharedWith, isTrash }: IViewItemHeader) => {
  const { formatMessage } = useIntl();
  const isLimitedItemAccess = isLimitedAccess(item.acl);
  const { isInAutofill } = useContext(VaultContext);

  return (
    <div className="flex flex-col">
      <div className="flex py-3 px px-4 justify-between">
        {!isInAutofill && (
          <ActionButton
            id="item-view-back-button"
            svgIcon={chevLeftIcon}
            data-testid="view_item_back_button"
            onClick={onClose}
          />
        )}

        {!isTrash && (
          <ActionButton
            id="view_item_edit_button"
            tooltipText={isLimitedAccess(item.acl) && formatMessage({ id: 'limitedRightsMessage' })}
            tooltipId="edit"
            className={cx('ml-auto', isInAutofill && 'mr-2')}
            data-testid="view_item_edit_button"
            buttonText={formatMessage({ id: 'edit' })}
            disabled={isLimitedItemAccess}
            onClick={() => api.extension.openDesktopApp({ route: 'EDIT_ITEM', args: [item.uuid] })}
          />
        )}

        {isInAutofill && (
          <MoreItemViewActions item={item} size={Size.Small} />
        )}
      </div>
      <div className="items-center px-2 pb-4 flex flex-col">
        <ItemTypeIcon item={item} />
        <div className="text-22px line-h-32px text-center w-full font-bolder px-4 break-word color-primary">
          {item.title}
        </div>
        {sharedWith}
      </div>
    </div>

  );
});
