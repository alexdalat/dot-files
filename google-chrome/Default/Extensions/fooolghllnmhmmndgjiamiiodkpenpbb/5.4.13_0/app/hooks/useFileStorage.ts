import isEqual from 'fast-deep-equal';
import { useState, useCallback, useEffect } from 'react';
import { noOp } from '@common/constants/function';
import { Metric, MetricType } from '@common/constants/metrics';
import { INotification, isVaultChangeNotification } from '@common/interfaces/messages';
import { IItemFile, IItem } from '@common/interfaces/item';
import { sendMetric } from '@common/utils/sendMetric';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { ListenerType } from '@extension/common/constants';

export const useFileStorage = (itemFiles: Array<string> = [], itemId?: string) => {
  const [files, setFiles] = useState<Array<IItemFile>>([]);

  const fetchItemFiles = useCallback(async () => {
    if (itemId) {
      (async () => {
        try {
          const fetchedFiles = await api.item.getItemFiles(itemId);
          setFiles(fetchedFiles);
        } catch {
          noOp();
        }
      })();
    }
  }, [itemId]);

  useEffect(() => {
    fetchItemFiles();
  }, [itemId, fetchItemFiles]);

  useEffect(() => {
    const handleFileChanges = (msg: INotification) => {
      if (isVaultChangeNotification(msg)) {
        const vaultChanges: Array<IItem> = msg.items || [];
        const updatedItem = vaultChanges.find(item => item.uuid === itemId);

        if (updatedItem) {
          const updatedItemFiles = updatedItem.file_uuids;
          if (!isEqual(itemFiles, updatedItemFiles)) {
            fetchItemFiles();
          }
        }
      }
    };
    return createListener(handleFileChanges, ListenerType.RuntimeMessage);
  }, [fetchItemFiles, itemId, itemFiles]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      sendMetric(api, Metric.FileStorageDelete, MetricType.Intent);

      await api.item.deleteFile(fileId);
      fetchItemFiles();

      sendMetric(api, Metric.FileStorageDelete, MetricType.Success);
    } catch {
      sendMetric(api, Metric.FileStorageDelete, MetricType.Error);
    }
  }, [fetchItemFiles]);

  return { files, deleteFile };
};
