import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import cx from 'classnames';
import { Link } from '@nordpass/ui';
import arrowLeftIcon from '@icons/24/arrow-left.svg';
import { ForceCrashButton } from '@common/components/ForceCrashButton/ForceCrashButton';
import { SvgIcon } from '@common/components/SvgIcon';
import { FeatureFlag } from '@common/constants/featureFlag';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { useIsSharedFoldersEnabled } from '@extension/app/hooks/useIsSharedFoldersEnabled';
import { ItemLinks } from './components/ItemLinks';
import { FolderLinks } from './components/FolderLinks/FolderLinks';
import { SharedFolderLinks } from './components/FolderLinks/SharedFolderLinks';
import { AdminPanelLink } from './components/AdminPanelLink/AdminPanelLink';

import './Sidebar.scss';

interface ISidebarProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
}

export const Sidebar = ({ isMenuOpen, onMenuClose }: ISidebarProps) => {
  const isCrashButtonEnabled = useExtensionFeature(FeatureFlag.ForceCrashButton);
  const isSharedFoldersEnabled = useIsSharedFoldersEnabled();
  const { isOnline, isBackOnline } = useOnlineStatus();

  return (
    <aside
      className={cx(
        'sidebar bg-grey-darkest text-white',
        isMenuOpen && 'sidebar--open',
        (!isOnline || isBackOnline) && 'mt-36px',
      )}
    >
      <Link
        className="sidebar-category px-4 mt-4 mb-1 flex"
        onClick={onMenuClose}
      >
        <SvgIcon
          className="nordpass-svg color-grey-dark"
          width={24}
          height={24}
          src={arrowLeftIcon}
        />
        {isCrashButtonEnabled && <ForceCrashButton className="ml-auto" />}
      </Link>

      <div className="overflow-y-auto flex-1">
        <ItemLinks onMenuClose={onMenuClose} />
        {isSharedFoldersEnabled && <SharedFolderLinks onMenuClose={onMenuClose} />}
        <FolderLinks onMenuClose={onMenuClose} />
      </div>
      <AdminPanelLink />
    </aside>
  );
};
