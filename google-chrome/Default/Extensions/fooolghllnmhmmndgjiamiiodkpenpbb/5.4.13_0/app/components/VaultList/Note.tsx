import { memo } from 'react';
import { TitlePicker } from '@common/components/TitlePicker/TitlePicker';
import { FeatureFlag } from '@common/constants/featureFlag';
import { INoteItem } from '@common/contracts/contracts';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import { TrashItemActions } from '@extension/app/components/VaultList/TrashItemActions';
import { IItemTypeProps } from '@extension/app/components/VaultList/VaultList';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { ItemMenu } from './ItemMenu/ItemMenu';

export const Note = memo(({ item, isTrash }: IItemTypeProps<INoteItem>) => {
  const isFileStorageEnabled = useExtensionFeature(FeatureFlag.FileStorageExtensionPopUp);

  return (
    <>
      <div className="w-third flex flex-1 items-center overflow-hidden">
        <TitlePicker
          item={item}
          shouldShowSharedIcon={item.shared}
          shouldShowAttachmentIcon={isFileStorageEnabled && getIfItemHasFiles(item)}
        />
      </div>
      <div className="vault-item-actions">
        {isTrash ? <TrashItemActions item={item} /> : <ItemMenu item={item} />}
      </div>
    </>
  );
});
