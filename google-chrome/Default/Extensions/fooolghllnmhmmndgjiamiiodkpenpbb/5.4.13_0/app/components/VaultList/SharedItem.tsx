import { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { IItem } from '@common/interfaces/item';
import { ItemType } from '@common/constants/vault';
import { ItemMenu } from './ItemMenu/ItemMenu';
import { ItemIcons } from './ItemIcons';

interface ISharedItem {
  item: IItem;
  itemsCount?: number;
}

export const SharedItem = memo(({ item, itemsCount = 0 }: ISharedItem) => (
  <>
    <div className="w-third flex flex-1 items-center relative">
      <ItemIcons item={item} />
      <span
        className="bg-red-light rounded-full absolute"
        style={{ width: 11, height: 11, top: -4, left: 26 }}
      />
      <div className="flex-1 min-w-0 px-4 overflow-hidden">
        <p className="text-small leading-normal truncate color-primary">
          {
            item.type === ItemType.Unknown ?
              <FormattedMessage id="pendingItems" values={{ items: itemsCount }} /> :
              item.title
          }
        </p>
        {item.type === ItemType.Unknown && (
          <p className="text-micro leading-normal truncate color-primary-accent-1">
            {item.uuid}
          </p>
        )}
      </div>
    </div>
    <div className="vault-item-actions">
      <ItemMenu item={item} />
    </div>
  </>
));
