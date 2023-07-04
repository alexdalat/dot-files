import { ItemType } from '@common/constants/vault';
import { VaultLink } from '@extension/app/components/VaultLink';
import { VaultContext } from '@extension/app/context/VaultContext';
import { SVG } from '@nord/ui';
import addFolderIcon from '@icons/add-shared-folder.svg';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { api } from '@extension/app/api';
import { FeatureFlag } from '@common/constants/featureFlag';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { SharedFolderLink } from './components/SharedFolderLink';

interface ISharedFolderLinks {
  onMenuClose: () => void;
}

export const SharedFolderLinks = ({ onMenuClose }: ISharedFolderLinks) => {
  const { vaultSharedFolders, isLoading } = useContext(VaultContext);
  const isSharedFolderGroupsSharingEnabled = useExtensionFeature(FeatureFlag.SharedFolderGroupSharing);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <div className="sidebar__group-label px-5 mt-3 mb-1 text-grey-dark">
        <span>
          <FormattedMessage id="sharedFolders" />
          {!isSharedFolderGroupsSharingEnabled && (
            <span className="border rounded-full px-2 py-1 ml-2 border-grey-dark text-nano">
              <FormattedMessage id="beta" />
            </span>
          )}
        </span>
        {vaultSharedFolders.length > 0 && (
          <>
            <Tooltip showOnHover id="add-shared-folder">
              <FormattedMessage id="addNewSharedFolder" />
            </Tooltip>
            <VaultLink
              data-tip-add-shared-folder
              className="sidebar-folder block"
              onClick={() => api.extension.openDesktopApp({
                route: 'ADD_SHARED_FOLDER',
                args: [ItemType.SharedFolder],
              })}
            >
              <SVG
                width={24}
                height={24}
                className="icon-hover-white"
                src={addFolderIcon}
              />
            </VaultLink>
          </>
        )}
      </div>
      {vaultSharedFolders.length ? (
        vaultSharedFolders.map(folder => (
          <SharedFolderLink
            key={folder.uuid}
            folder={folder}
            onMenuClose={onMenuClose}
          />
        ))
      ) : (
        <VaultLink
          className="pl-6 pr-5 sidebar-category"
          data-testid="add-shared-folder"
          onClick={() => api.extension.openDesktopApp({
            route: 'ADD_SHARED_FOLDER',
            args: [ItemType.SharedFolder],
          })}
        >
          <span className="truncate flex items-center">
            <SVG
              width={24}
              height={24}
              className="mr-3"
              src={addFolderIcon}
            />
            <FormattedMessage id="addNewSharedFolder" />
          </span>
        </VaultLink>
      )}
    </>
  );
};
