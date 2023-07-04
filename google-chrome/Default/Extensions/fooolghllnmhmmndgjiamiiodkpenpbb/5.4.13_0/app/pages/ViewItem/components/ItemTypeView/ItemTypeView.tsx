import { IItem } from '@common/interfaces/item';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import {
  getIsCreditCard,
  getIsNote,
  getIsPasskey,
  getIsPassword,
  getIsPersonalInfo,
} from '@common/utils/itemTypeGuards';
import { VaultContext } from '@extension/app/context/VaultContext';
import { ViewCreditCard } from '@extension/app/pages/ViewItem/ViewCreditCard';
import { ViewNote } from '@extension/app/pages/ViewItem/ViewNote';
import { ViewPasskey } from '@extension/app/pages/ViewItem/ViewPasskey';
import { ViewPassword } from '@extension/app/pages/ViewItem/ViewPassword/ViewPassword';
import { ViewPersonalInfo } from '@extension/app/pages/ViewItem/ViewPersonalInfo';
import cx from 'classnames';
import { useContext, useMemo } from 'react';

interface IItemTypeView {
  item: IItem;
}

export const ItemTypeView = ({ item }: IItemTypeView) => {
  const { vaultFolders } = useContext(VaultContext);
  const itemWithFolder = useMemo(() => {
    if (!item.folder_id) return item;
    const folder = vaultFolders.find(folderItem => folderItem.uuid === item.folder_id);
    return { ...item, folder_name: folder?.title };
  }, [item, vaultFolders]);
  const hasFiles = getIfItemHasFiles(item);

  return (
    <div className={cx(hasFiles ? 'mb-6' : 'mb-9', 'flex justify-center mx-4')}>
      <div className="w-full">
        {getIsPassword(itemWithFolder) &&
          <ViewPassword item={itemWithFolder} />
        }
        {getIsPasskey(itemWithFolder) &&
          <ViewPasskey item={itemWithFolder} />
        }
        {getIsNote(itemWithFolder) &&
          <ViewNote item={itemWithFolder} />
        }
        {getIsCreditCard(itemWithFolder) &&
          <ViewCreditCard item={itemWithFolder} />
        }
        {getIsPersonalInfo(itemWithFolder) &&
          <ViewPersonalInfo item={itemWithFolder} />
        }
      </div>
    </div>
  );
};
