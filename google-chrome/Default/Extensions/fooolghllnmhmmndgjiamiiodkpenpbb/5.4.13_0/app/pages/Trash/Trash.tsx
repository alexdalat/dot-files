import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import isEqual from 'fast-deep-equal';
import { ListenerType } from '@extension/common/constants';
import { useSearchParam } from '@common/hooks/useSearchParam';
import { useSorting } from '@extension/app/hooks/useSorting';
import { INotification } from '@common/interfaces/messages';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { FormattedMessage } from 'react-intl';
import { sortItems } from '@common/utils/sortItems';
import { VaultList } from '@extension/app/components/VaultList/VaultList';
import { Notification } from '@common/constants/notification';
import { updateTrashItems } from '@extension/app/pages/Trash/utils/updateTrashItems';
import { IItem } from '@common/interfaces/item';
import { VaultType } from '@common/constants/vault';
import { noOp } from '@common/constants/function';
import { FullscreenLoader } from '@common/components/FullScreenLoader/FullscreenLoader';
import { ViewItem } from '@extension/app/pages/ViewItem/ViewItem';
import { useLoaderLogging } from '@common/hooks/useLoaderLogging/useLoaderLogging';
import { LogLevel } from '@common/services/loggingFactory/contracts';

export const Trash = () => {
  const [vault, setVault] = useState<Array<IItem>>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState<Array<IItem>>([]);
  const query = useSearchParam('query', '');
  const sorting = useSorting();

  useLoaderLogging(isLoading, logMessage, 'Trash');

  useEffect(() => {
    let didCancel = false;

    const handleVaultChanges = (msg: INotification) => {
      if (didCancel) {
        return;
      }

      if (msg.type === Notification.VaultChange) {
        const vaultChanges = msg.items;
        const vaultDeletes = msg.deleted_items;

        if (vaultDeletes && vaultDeletes.length) {
          api.item.fetchTrashedItems().then(trashItems => setVault(trashItems));
        } else if (vaultChanges && vaultChanges.length) {
          setVault(prev => updateTrashItems(prev, vaultChanges));
        }
      }
    };

    let removeListener = noOp;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const trashItems = await api.item.fetchTrashedItems();

        if (didCancel) {
          return;
        }

        removeListener = createListener(handleVaultChanges, ListenerType.RuntimeMessage);
        setVault(trashItems.map(item => ({ ...item, selected: false })));
      } catch (error) {
        setError(error.message);
        logMessage(LogLevel.Error, 'fetchTrashItems:', error);
      }

      setLoading(false);
    })();

    return () => {
      removeListener();
      didCancel = true;
    };
  }, []);

  useEffect(() => {
    const sortedList = sortItems(vault, sorting);
    setItems(prevItems => isEqual(prevItems, sortedList) ? prevItems : sortedList);
  }, [vault, sorting]);

  if (error) {
    return (
      <div className="h-full flex justify-center items-center text-center p-4">
        <FormattedMessage id="undefinedError" />
      </div>
    );
  }

  if (isLoading) {
    return <FullscreenLoader />;
  }

  return (
    <Routes>
      <Route
        index
        element={
          <VaultList
            isTrash
            items={items}
            query={query}
            vaultType={VaultType.Trash}
            sorting={sorting}
          />
        }
      />
      <Route path=":id" element={<ViewItem />} />
    </Routes>
  );
};
