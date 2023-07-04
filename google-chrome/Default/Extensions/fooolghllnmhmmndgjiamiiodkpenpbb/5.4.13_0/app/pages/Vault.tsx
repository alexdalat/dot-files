import { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import isEqual from 'fast-deep-equal';
import { SortingType, SortingDirection, VaultType } from '@common/constants/vault';
import { replaceSlashesWithDashes } from '@common/utils/replaceSlashesWithDashes';
import { VaultList } from '@extension/app/components/VaultList/VaultList';
import { useSearchParam } from '@common/hooks/useSearchParam';
import { VaultContext } from '@extension/app/context/VaultContext';
import { PendingSharesContext } from '@extension/app/context/PendingSharesContext/PendingSharesContext';
import { ViewItem } from '@extension/app/pages/ViewItem/ViewItem';
import { ViewPendingItem } from '@extension/app/pages/ViewItem/ViewPendingItem';
import { getIsCreditCard, getIsPassword, getIsPasskey } from '@common/utils/itemTypeGuards';
import { getUpdatedItemList } from '@common/utils/getUpdatedItemList/getUpdatedItemList';
import { useSorting } from '@extension/app/hooks/useSorting';
import { IItem } from '@common/interfaces/item';
import { FullscreenLoader } from '@common/components/FullScreenLoader/FullscreenLoader';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { useLoaderLogging } from '@common/hooks/useLoaderLogging/useLoaderLogging';
import { Route, Routes } from 'react-router-dom';

const searchVault = (vault: Array<IItem>, query: string) => {
  const escapedQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
  const q = new RegExp(escapedQ, 'i');
  return vault.filter(
    item => q.test(item.title) ||
      ((getIsPassword(item) || getIsPasskey(item)) && item.username && q.test(item.username)) ||
      ((getIsPassword(item) || getIsPasskey(item)) && item.url && q.test(item.url)) ||
      ((getIsPassword(item) || getIsPasskey(item)) && item.note && q.test(item.note)) ||
      (getIsCreditCard(item) && item.cardholder_name && q.test(item.cardholder_name)),
  );
};

export const Vault = () => {
  const pendingShares = useContext(PendingSharesContext);
  const { vaultItems, vaultFolders, error, isLoading } = useContext(VaultContext);

  const sorting = useSorting();
  const vaultType = useSearchParam('type') as VaultType;
  const folderId = useSearchParam('folder');
  const query = useSearchParam('query', '');

  useLoaderLogging(!sorting, logMessage, 'Vault:EmptySorting');
  useLoaderLogging(isLoading, logMessage, 'Vault:isLoading');

  const [items, setItems] = useState<Array<IItem>>([]);
  useEffect(() => {
    let filtered: Array<IItem>;
    if (query) {
      filtered = searchVault(vaultItems, query);
    } else if (vaultType) {
      if (folderId) {
        filtered = vaultItems.filter(i => i.folder_id === folderId);
      } else if (vaultType === VaultType.Shared) {
        filtered = vaultItems.filter(i => i.shared);
      } else if (vaultType === VaultType.Folder) {
        filtered = vaultFolders;
      } else {
        filtered = vaultItems.filter(i => i.type === vaultType as string);
      }
    } else {
      filtered = vaultItems.slice(0);
    }

    if (sorting && sorting.type === SortingType.Recent) {
      filtered.sort(
        (a, b) => (new Date(replaceSlashesWithDashes(b.last_used_at)).getTime()) -
          (new Date(replaceSlashesWithDashes(a.last_used_at)).getTime()),
      );
      if (sorting.direction === SortingDirection.Desc) {
        filtered.reverse();
      }
    } else if (sorting && sorting.type === SortingType.Alpha && sorting.direction === SortingDirection.Asc) {
      filtered.sort(({ title = '' }, b) => title.localeCompare(b.title || ''));
    } else if (sorting && sorting.type === SortingType.Alpha && sorting.direction === SortingDirection.Desc) {
      filtered.sort((a, { title = '' }) => title.localeCompare(a.title || ''));
    }

    if (vaultType === VaultType.Shared && pendingShares.length > 0) {
      filtered = getUpdatedItemList(pendingShares, filtered) as Array<IItem>;
    }

    setItems(prevItems => isEqual(prevItems, filtered) ? prevItems : filtered);
  }, [vaultItems, vaultFolders, pendingShares, query, vaultType, folderId, sorting]);

  if (error) {
    return (
      <div className="h-full flex justify-center items-center text-center p-4 color-primary">
        <FormattedMessage id="undefinedError" />
      </div>
    );
  }

  if (isLoading || !sorting) {
    return <FullscreenLoader />;
  }

  return (
    <Routes>
      <Route
        index
        element={
          <VaultList
            items={items}
            vaultType={vaultType}
            query={query}
            sorting={sorting}
          />
        }
      />
      <Route path=":id" element={<ViewItem />} />
      <Route path="pending/:email" element={<ViewPendingItem />} />

    </Routes>
  );
};
