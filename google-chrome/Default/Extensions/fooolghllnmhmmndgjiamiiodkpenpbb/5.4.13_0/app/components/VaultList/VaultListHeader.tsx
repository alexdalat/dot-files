import { CSSProperties } from 'react';
import { FormattedMessage } from 'react-intl';
import { IItem } from '@common/interfaces/item';
import { useElementRect } from '@common/hooks/useElementRect';
import { IVaultSorting } from '@common/store/reducers/vaultReducer/vaultConstants';
import { SortingMenu } from '@extension/app/components/VaultList/SortingMenu/SortingMenu';
import { SuggestedItems } from '@extension/app/components/VaultList/SuggestedItems/SuggestedItems';

interface IVaultListHeader {
  items: Array<IItem>;
  query?: string;
  isTrash: boolean;
  sorting: IVaultSorting;
  style?: CSSProperties;
  onRectChange?: (rect: DOMRectReadOnly) => void;
}

export const VaultListHeader = ({ items, query, isTrash, sorting, style, onRectChange }: IVaultListHeader) => {
  const { elementRef } = useElementRect({ onRectChange, keyToCompare: 'height' });

  return (
    <li style={style}>
      <div ref={elementRef}>
        {!query && !isTrash && <SuggestedItems items={items} />}
        <div className="flex px-4">
          <span className="text-micro mr-1 truncate color-primary-accent-1">
            {query ? (
              <span className="truncate">
                <FormattedMessage id="searchResultsFor" />
                <span className="color-primary ml-1">{`"${query}"`}</span>
              </span>
            ) : (
              <FormattedMessage id="sortBy" />
            )}
          </span>
          {!query && <SortingMenu sorting={sorting} />}
        </div>
      </div>
    </li>
  );
};
