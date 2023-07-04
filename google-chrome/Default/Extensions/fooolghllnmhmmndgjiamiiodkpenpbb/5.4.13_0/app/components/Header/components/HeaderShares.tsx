import { memo, useContext } from 'react';
import { useSearchParam } from '@common/hooks/useSearchParam';
import { ItemType } from '@common/constants/vault';
import { VaultContext } from '@extension/app/context/VaultContext';
import { SharedWith } from '@extension/app/pages/ViewItem/components/SharedWith/SharedWith';

export const HeaderShares = memo(() => {
  const vaultType = useSearchParam('type');
  const folderUuid = useSearchParam('folder');
  const { vaultFolders } = useContext(VaultContext);

  if (vaultType !== ItemType.SharedFolder) {
    return null;
  }

  const item = vaultFolders.find(folder => folder.uuid === folderUuid);

  if (!item) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-3">
      <SharedWith item={item} />
    </div>
  );
});
