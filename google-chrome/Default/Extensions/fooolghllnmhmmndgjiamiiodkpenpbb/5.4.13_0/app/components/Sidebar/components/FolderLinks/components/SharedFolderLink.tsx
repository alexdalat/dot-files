import { useCallback, useState } from 'react';
import cx from 'classnames';
import { useLocation } from 'react-router-dom';
import { SVG } from '@nord/ui';
import { ROUTES } from '@extension/common/constants/routes';
import { NavLink } from '@common/components/NavLink/NavLink';
import folderIcon from '@icons/shared-folder.svg';
import moreIcon from '@icons/24/more.svg';
import { TFolderItem } from '@common/contracts/contracts';
import { SharedFolderActions } from './SharedFolderActions';

interface ISharedFolderLink {
  folder: TFolderItem;
  onMenuClose: () => void;
}

export const SharedFolderLink = ({ folder, onMenuClose }: ISharedFolderLink) => {
  const location = useLocation();
  const [activeMenuFolder, setActiveMenuFolder] = useState<string>();
  const isActive = useCallback(
    () => location.search.includes(folder.uuid) || !!activeMenuFolder,
    [activeMenuFolder, folder.uuid, location],
  );

  return (
    <div
      className={cx(
        'sidebar-category pl-6 pr-5 relative',
        isActive() && 'active',
      )}
    >
      <SVG
        width={24}
        height={24}
        className="mr-3"
        src={folderIcon}
      />
      <span className="truncate flex-1">{folder.title}</span>
      <div className={cx('folder-actions grid grid-flow-col gap-2 pl-3 z-1', activeMenuFolder && 'folder-actions--active')}>
        <SharedFolderActions
          folderUuid={folder.uuid}
          folderAcl={folder.acl}
          button={props => (
            <SVG
              width={24}
              height={24}
              className="cursor-pointer icon-hover-white"
              src={moreIcon}
              {...props}
            />
          )}
          onMenuToggle={setActiveMenuFolder}
        />
      </div>
      <NavLink
        to={ROUTES.VIEW_SHARED_FOLDER(folder.uuid)}
        isActive={isActive()}
        className="absolute inset-0 z-0"
        onClick={onMenuClose}
      />
    </div>
  );
};
