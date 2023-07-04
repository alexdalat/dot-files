import { useContext, useMemo } from 'react';
import { IItem } from '@common/interfaces/item';
import { VaultContext } from '@extension/app/context/VaultContext';
import { isItemInSharedFolder } from '@common/utils/isItemInSharedFolder/isItemInSharedFolder';

export const useIsItemInSharedFolder = (item: IItem): boolean => {
  const { vaultSharedFolders } = useContext(VaultContext);

  return useMemo(
    () => isItemInSharedFolder(item, vaultSharedFolders),
    [item, vaultSharedFolders],
  );
};
