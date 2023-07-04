import { useCallback, memo, useRef, useEffect } from 'react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import cx from 'classnames';
import { IItem } from '@common/interfaces/item';
import { IVaultSorting } from '@common/store/reducers/vaultReducer/vaultConstants';
import { useElementRect } from '@common/hooks/useElementRect';
import { VaultType } from '@common/constants/vault';
import { VaultListHeader } from '@extension/app/components/VaultList/VaultListHeader';
import { VaultListBanners } from '@extension/app/components/VaultList/VaultListBanners';
import { useUpdateBanner } from '@extension/app/hooks/useUpdateBanner';
import { EmptyVault } from './EmptyVault';
import { getItemHeight } from './VaultListUtils';
import { VaultItemContextProvider } from './VaultItemContext';
import { Item } from './Item/Item';

import './index.scss';

interface IVaultListProps {
  items: Array<IItem>;
  query: string;
  vaultType: VaultType;
  sorting: IVaultSorting;
  isTrash?: boolean;
}

export interface IItemTypeProps<TItemType> {
  item: TItemType;
  isTrash: boolean;
}

const DEFAULT_VAULT_LIST_HEIGHT = 477;
export const LIST_ITEM_INDEX_OFFSET = 2; // Before actual items are rendered, we show banners and list header
const DEFAULT_SPECIAL_VAULT_ITEM_HEIGHT = 25; // Fallback to use if banners or header components have no height on initial render

export const VaultList = memo(({ items, query, vaultType, sorting, isTrash = false }: IVaultListProps) => {
  const { type: sortingType, direction: sortingDirection } = sorting;
  const { isBannerVisible: isUpdateBannerVisible } = useUpdateBanner();
  const sizeMap = useRef<Record<number, number>>({});

  const getItemKey = useCallback(
    (index: number) => {
      if (index === 0) {
        return 'vaultListBanners';
      }
      if (index === 1) {
        return 'vaultListHeader';
      }
      return items[index - LIST_ITEM_INDEX_OFFSET].uuid;
    },
    [items],
  );

  const listRef = useRef<VariableSizeList>(null);
  const { elementRef, rect } = useElementRect();

  const setSize = useCallback((index: number, size: number) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current?.resetAfterIndex(index);
  }, []);

  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [sortingType, sortingDirection]);

  const listItem = useCallback(
    ({ index, style, data: onItemHeightChange }: ListChildComponentProps<(index: number, height: number) => void>) => {
      if (index === 0) {
        return (
          <VaultListBanners
            items={items}
            style={style}
            onRectChange={({ height }) => onItemHeightChange(index, height)}
          />
        );
      }
      if (index === 1) {
        return (
          <VaultListHeader
            items={items}
            isTrash={isTrash}
            sorting={sorting}
            query={query}
            style={style}
            onRectChange={({ height }) => onItemHeightChange(index, height)}
          />
        );
      }
      return (
        <VaultItemContextProvider>
          <Item
            items={items}
            index={index - LIST_ITEM_INDEX_OFFSET}
            itemsCount={items.length}
            query={query}
            sortingType={sorting.type}
            isTrash={isTrash}
            style={style}
          />
        </VaultItemContextProvider>
      );
    },
    [isTrash, items, query, sorting],
  );

  const itemSizeGetter = useCallback(
    (index: number) => {
      if (index === 0 || index === 1) {
        return sizeMap.current[index] ?? DEFAULT_SPECIAL_VAULT_ITEM_HEIGHT;
      }
      return getItemHeight(items, index - LIST_ITEM_INDEX_OFFSET, query ? undefined : sortingType);
    },
    [items, query, sortingType],
  );

  return (
    <div
      ref={elementRef}
      className={cx(
        'vault bg-primary h-full',
        !items.length && !isUpdateBannerVisible && 'justify-center',
      )}
    >
      {items.length ? (
        <VariableSizeList<(index: number, height: number) => void>
          ref={listRef}
          className="overflow-y-auto flex-grow pb-16"
          innerElementType="ul"
          itemKey={getItemKey}
          itemCount={items.length + LIST_ITEM_INDEX_OFFSET}
          itemSize={itemSizeGetter}
          itemData={setSize}
          height={rect?.height ?? DEFAULT_VAULT_LIST_HEIGHT}
          width="100%"
        >
          {listItem}
        </VariableSizeList>
      ) : (
        <ul className="list-style-none">
          <VaultListBanners items={items} />
          <EmptyVault type={vaultType} search={query} />
        </ul>
      )}
    </div>
  );
});
