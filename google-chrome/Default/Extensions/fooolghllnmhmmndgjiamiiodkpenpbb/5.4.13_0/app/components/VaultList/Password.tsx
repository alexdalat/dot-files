import { memo } from 'react';
import { useIntl } from 'react-intl';
import { ActionButton } from '@common/components/ActionButton/ActionButton';
import { TitlePicker } from '@common/components/TitlePicker/TitlePicker';
import { FeatureFlag } from '@common/constants/featureFlag';
import { noOp } from '@common/constants/function';
import { UserAction } from '@common/constants/userAction';
import { IPasswordItem, IPasskeyItem } from '@common/contracts/contracts';
import { getIfItemHasFiles } from '@common/utils/getIfItemHasFiles';
import { api } from '@extension/app/api';
import { TrashItemActions } from '@extension/app/components/VaultList/TrashItemActions';
import { IItemTypeProps } from '@extension/app/components/VaultList/VaultList';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import * as launchIcon from '@icons/24/launch.svg';
import { ItemMenu } from './ItemMenu/ItemMenu';

export const Password = memo(({ item, isTrash }: IItemTypeProps<IPasswordItem | IPasskeyItem>) => {
  const { formatMessage } = useIntl();
  const isFileStorageEnabled = useExtensionFeature(FeatureFlag.FileStorageExtensionPopUp);

  return (
    <>
      <div className="w-third flex flex-1 items-center overflow-hidden">
        <TitlePicker
          item={item}
          shouldShowSharedIcon={item.shared}
          shouldShowAttachmentIcon={isFileStorageEnabled && getIfItemHasFiles(item)}
          logMessage={logMessage}
        />
      </div>
      <div className="vault-item-actions flex">
        {isTrash ? (
          <TrashItemActions item={item} />
        ) : (
          <>
            {item.url && (
              <ActionButton
                className="mr-2 inline-block"
                tooltipText={formatMessage({ id: 'launchWebsite' })}
                tooltipId={`launch-${item.uuid}`}
                svgIcon={launchIcon}
                onClick={() => {
                  api.action.save(UserAction.LaunchWebsiteExtension).catch(noOp);
                  openInNewTab(
                    item.url.startsWith('http') ? item.url : `https://${item.url}`,
                    true,
                  );
                }}
              />
            )}
            <ItemMenu item={item} />
          </>
        )}
      </div>
    </>
  );
});
