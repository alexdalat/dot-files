import { CSSProperties, memo, MouseEvent, useCallback, useContext } from 'react';
import {
  getIsCreditCard,
  getIsNote,
  getIsPasskey,
  getIsPassword,
  getIsPersonalInfo,
} from '@common/utils/itemTypeGuards';
import cx from 'classnames';
import { ItemType, ShareStatus, SortingType } from '@common/constants/vault';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { IItem } from '@common/interfaces/item';
import { ROUTES } from '@extension/common/constants/routes';
import { shouldPreventItemOnClick } from '@common/utils/shouldPreventItemOnClick';
import { CHILD_ELEMENT_CLASSNAMES_TO_PREVENT_ON_CLICK } from '@common/constants/classNamesToPreventItemOnClick';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import { Password } from '../Password';
import { Note } from '../Note';
import { CreditCard } from '../CreditCard';
import { PersonalInfo } from '../PersonalInfo';
import { SharedItem } from '../SharedItem';
import { VaultItemContext } from '../VaultItemContext';
import { isItemWithHeader } from '../VaultListUtils';

interface IItemProps {
  items: Array<IItem>;
  index: number;
  query?: string;
  sortingType?: SortingType;
  itemsCount?: number;
  isTrash?: boolean;
  style?: CSSProperties;
}

interface IItemComponentProps {
  item: IItem;
  isTrash?: boolean;
}

const ItemComponent = ({ item, isTrash = false }: IItemComponentProps) => {
  if (getIsPassword(item) || getIsPasskey(item)) {
    return <Password item={item} isTrash={isTrash} />;
  }
  if (getIsNote(item)) {
    return <Note item={item} isTrash={isTrash} />;
  }
  if (getIsCreditCard(item)) {
    return <CreditCard item={item} isTrash={isTrash} />;
  }
  if (getIsPersonalInfo(item)) {
    return <PersonalInfo item={item} isTrash={isTrash} />;
  }
  return null;
};

export const Item = memo(({
  items,
  index,
  itemsCount,
  query,
  sortingType,
  isTrash,
  style,
}: IItemProps) => {
  const { isContextOpen } = useContext(VaultItemContext);
  const item = items[index];
  const isHeaderVisible = isItemWithHeader(items, index, query ? undefined : sortingType);
  const navigate = useNavigate();

  const firstItemChar = item.title?.charAt(0).toLowerCase();
  const isSharedAndPendingItem = item.shared && item.share_status === ShareStatus.Pending;

  const handleClick = useCallback((event: MouseEvent) => {
    const shouldPreventOnClick = shouldPreventItemOnClick(
      event.target as HTMLElement,
      CHILD_ELEMENT_CLASSNAMES_TO_PREVENT_ON_CLICK,
    );

    if (!shouldPreventOnClick) {
      if (isSharedAndPendingItem && item.type === ItemType.Unknown) {
        navigate({ pathname: ROUTES.PENDING_ITEM(encodeURIComponent(item.uuid)) });
      } else if (isTrash) {
        navigate({ pathname: ROUTES.VIEW_TRASH_ITEM(item.uuid) });
      } else {
        navigate({ pathname: ROUTES.VIEW_ITEM(item.uuid) });
      }
    }
  }, [isSharedAndPendingItem, item, isTrash, navigate]);

  if (!item) {
    logMessage(LogLevel.Error, 'Item:', 'item is null');
    return null;
  }

  return (
    <li style={style}>
      {isHeaderVisible && (
        <div className="flex items-center px-4 pt-3 pb-1 capitalize w-full text-micro font-bold color-primary">
          {isSharedAndPendingItem ? <FormattedMessage id="newItems" /> : firstItemChar}
        </div>
      )}

      <div className="vault-item flex items-center cursor-pointer hover:bg-primary-accent-1">
        <div
          role="presentation"
          className={cx(
            'vault-item-data relative flex flex-1 items-center px-4 py-2 min-w-0',
            isContextOpen && 'selected',
          )}
          onClick={handleClick}
        >
          {isSharedAndPendingItem ?
            <SharedItem itemsCount={itemsCount} item={item} /> :
            (
              <div className="flex flex-1 items-center min-w-0">
                <ItemComponent item={item} isTrash={isTrash} />
              </div>
            )}
        </div>
      </div>
    </li>
  );
});
