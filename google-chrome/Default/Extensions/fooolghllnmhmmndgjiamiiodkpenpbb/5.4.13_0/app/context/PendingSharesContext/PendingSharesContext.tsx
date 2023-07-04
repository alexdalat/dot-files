import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import isEqual from 'fast-deep-equal';
import { ListenerType } from '@extension/common/constants';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { Notification } from '@common/constants/notification';
import { IItem } from '@common/interfaces/item';
import { resolvePendingTransfers } from './PendingSharesContextUtils';

export const PendingSharesContext = createContext<Array<IItem>>([]);

export const PendingSharesProvider = ({ children }: { children?: ReactNode }) => {
  const [shares, setShares] = useState<Array<IItem>>([]);
  const [newPendingShares, setNewPendingShares] = useState<Array<IItem>>([]);

  useEffect(() => {
    let didCancel = false;
    (async () => {
      try {
        const [shareList, pendingShareList] = await Promise.all([
          api.share.fetchShareList(),
          api.share.fetchPendingShares(),
        ]);
        if (didCancel) {
          return;
        }
        setShares(prevShares => (isEqual(prevShares, shareList) ? prevShares : shareList));
        setNewPendingShares(prevNewPendingShares => (
          isEqual(prevNewPendingShares, pendingShareList) ? prevNewPendingShares : pendingShareList
        ));
      } catch (e) {
        setShares([]);
        setNewPendingShares([]);
      }
    })();

    async function handleNotification(msg: any) {
      if (msg.type === Notification.VaultChange) {
        if (msg?.shares?.length) {
          const result = await api.share.fetchPendingShares();

          if (didCancel) {
            return;
          }
          setNewPendingShares(result);
        }

        if (didCancel) {
          return;
        }
        setShares(previousPending => resolvePendingTransfers(previousPending, msg));
      }
    }

    const unsubscribe = createListener(handleNotification, ListenerType.RuntimeMessage);

    return () => {
      unsubscribe();
      didCancel = true;
    };
  }, []);

  // prevent rerender on non share/pending share changes
  const allShares = useMemo(() => [...shares, ...newPendingShares], [shares, newPendingShares]);

  return <PendingSharesContext.Provider value={allShares}>{children}</PendingSharesContext.Provider>;
};
