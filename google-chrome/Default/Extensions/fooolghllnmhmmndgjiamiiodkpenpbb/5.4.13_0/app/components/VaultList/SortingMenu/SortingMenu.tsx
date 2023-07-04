import { memo } from 'react';
import { Storage } from '@extension/common/constants';
import { SortingType, SortingDirection } from '@common/constants/vault';
import { IVaultSorting } from '@common/store/reducers/vaultReducer/vaultConstants';
import { StorageApi } from '@extension/browser/storageApi';
import { useIntl } from 'react-intl';
import { Link } from '@nordpass/ui';
import cx from 'classnames';
import tickIcon from '@icons/tick.svg';
import chevronDownIcon from '@icons/chevron-down.svg';
import { Menu } from '@common/components/Menu/Menu';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { useMenuState } from '@common/components/Menu/useMenuState';
import { SvgIcon } from '@common/components/SvgIcon';

import './SortingMenu.scss';

interface ISortingMenu {
  sorting: IVaultSorting;
}

const setSorting = (type: SortingType, direction: SortingDirection) => {
  StorageApi.set({ [Storage.VaultSorting]: { type, direction } });
};

const TickIcon = ({ className }: { className: string }) => (
  <SvgIcon
    width={10}
    height={10}
    src={tickIcon}
    className={className}
  />
);

export const SortingMenu = memo(({ sorting }: ISortingMenu) => {
  const { formatMessage } = useIntl();
  const { isOpen, toggleOpen, close } = useMenuState();

  return (
    <Menu
      isCloseOnItemClickDisabled
      isOpen={isOpen}
      skidding={-44}
      button={
        <Link
          iconPosition="right"
          className="flex items-center"
          onClick={toggleOpen}
        >
          <p className="text-micro leading-normal font-medium color-primary">
            {sorting.type === SortingType.Recent ? formatMessage({ id: 'lastUsed' }) : formatMessage({ id: 'title' })}
          </p>
          {(sorting.type === SortingType.Recent || sorting.type === SortingType.Alpha) && (
            <SvgIcon
              width={14}
              height={14}
              src={chevronDownIcon}
              className={cx(
                'nordpass-svg color-primary',
                sorting.direction === SortingDirection.Desc && 'rotate-180',
              )}
            />
          )}
        </Link>
      }
      onClose={close}
    >
      <div className="sorting-column-menu">
        <p className="text-nano leading-normal font-medium uppercase py-1 px-3 text-grey">
          {formatMessage({ id: 'sortingOrder' })}
        </p>

        <MenuItem onClick={() => setSorting(sorting.type, SortingDirection.Asc)}>
          <p className="font-medium flex items-center text-micro leading-normal">
            <TickIcon
              className={cx(
                'sorting-tick pointer-events-none',
                sorting.direction === SortingDirection.Asc ? 'opacity-100' : 'opacity-0',
              )}
            />
            {formatMessage({ id: 'ascending' })}
          </p>
        </MenuItem>

        <MenuItem onClick={() => setSorting(sorting.type, SortingDirection.Desc)}>
          <p className="text-micro leading-normal font-medium flex items-center">
            <TickIcon
              className={cx(
                'sorting-tick pointer-events-none',
                sorting.direction === SortingDirection.Desc ? 'opacity-100' : 'opacity-0',
              )}
            />
            {formatMessage({ id: 'descending' })}
          </p>
        </MenuItem>

        <div className="border-t border-primary-accent-1 divider" />

        <p className="text-nano leading-normal font-medium uppercase py-1 px-3 text-grey">
          {formatMessage({ id: 'sortBy' })}
        </p>

        <MenuItem onClick={() => setSorting(SortingType.Alpha, sorting.direction)}>
          <p className="text-micro leading-normal font-medium flex items-center">
            <TickIcon
              className={cx(
                'sorting-tick pointer-events-none',
                sorting.type === SortingType.Alpha ? 'opacity-100' : 'opacity-0',
              )}
            />
            {formatMessage({ id: 'title' })}
          </p>
        </MenuItem>

        <MenuItem onClick={() => setSorting(SortingType.Recent, sorting.direction)}>
          <p className="text-micro leading-normal font-medium flex items-center">
            <TickIcon
              className={cx(
                'sorting-tick pointer-events-none',
                sorting.type === SortingType.Recent ? 'opacity-100' : 'opacity-0',
              )}
            />
            {formatMessage({ id: 'lastUsed' })}
          </p>
        </MenuItem>
      </div>
    </Menu>
  );
});
