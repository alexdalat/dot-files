import { SvgIcon } from '@common/components/SvgIcon';
import { OpenDirection } from '@common/components/Tooltip/constants/openDirection';
import { Tooltip } from '@common/components/Tooltip/Tooltip';
import { VaultType } from '@common/constants/vault';
import { Size } from '@common/constants/size';
import { TFolderItem } from '@common/contracts/contracts';
import { useQuery } from '@common/hooks/useQuery/useQuery';
import { api } from '@extension/app/api';
import { Avatar } from '@extension/app/components/Avatar/Avatar';
import { HeaderText } from '@extension/app/components/Header/components/HeaderText/HeaderText';
import { VaultContext } from '@extension/app/context/VaultContext';
import { useAvatar } from '@extension/app/hooks/useAvatar';
import { useSearchParam } from '@common/hooks/useSearchParam';
import { closePopup } from '@extension/app/utils/closePopup';
import { history } from '@extension/app/utils/history';
import { ROUTES } from '@extension/common/constants/routes';

import menuIcon from '@icons/24/menu.svg';
import openAppIcon from '@icons/open-app-icon.svg';
import settingsIcon from '@icons/24/settings-ext.svg';
import toolsIcon from '@icons/24/tools.svg';
import { Link } from '@nordpass/ui';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMatch } from 'react-router-dom';

interface IHeaderMenuProps {
  onMenuOpen: () => void;
}

export const HeaderMenu = ({ onMenuOpen }: IHeaderMenuProps) => {
  const { data: email = '' } = useQuery(api.extension.getUserEmail);
  const vaultType = useSearchParam('type') as VaultType;
  const isTrash = !!useMatch(ROUTES.TRASH);
  const folderId = useSearchParam('folder');
  const { vaultFolders } = useContext(VaultContext);
  const folderTitle = vaultFolders.find((folder: TFolderItem) => folder.uuid === folderId)?.title;
  const avatar = useAvatar();

  const onClickOpenApp = () => {
    api.extension.openDesktopApp();
    closePopup({ legacySafariPopupClose: api.extension.closePopup });
  };

  const onClickSettings = () => {
    api.extension.openDesktopApp({ route: 'SETTINGS' });
    closePopup({ legacySafariPopupClose: api.extension.closePopup });
  };

  const onClickTools = () => {
    history.push(ROUTES.TOOLS);
  };

  const handleProfileIconClick = () => {
    history.push(ROUTES.PROFILE);
  };

  return (
    <div className="header__menu w-full flex items-center">
      <Link
        className="inline-flex menu-button"
        rank="secondary"
        onClick={onMenuOpen}
      >
        <SvgIcon
          className="color-primary-accent-1 hover:color-primary-accent-13"
          src={menuIcon}
          width={24}
          height={24}
        />
      </Link>
      <h3 className="color-primary text-lead font-bolder truncate">
        <HeaderText vaultType={isTrash ? VaultType.Trash : vaultType} folderTitle={folderTitle} />
      </h3>
      <div className="flex ml-auto">
        {process.env.HAS_OPEN_APP_EXTENSION_LINK && (
          <>
            <Tooltip showOnHover id="view-in-tab">
              <FormattedMessage id="viewInExtensionTab" />
            </Tooltip>
            <Link
              data-tip-view-in-tab
              rank="secondary"
              className="inline-flex mr-2"
              data-testid="view-in-tab"
              onClick={onClickOpenApp}
            >
              <SvgIcon
                className="nordpass-svg color-primary-accent-1 hover:color-primary-accent-13"
                src={openAppIcon}
                width={24}
                height={24}
              />
            </Link>
          </>
        )}
        <Tooltip showOnHover id="settings">
          <FormattedMessage id="settings" />
        </Tooltip>
        <Link
          data-tip-settings
          rank="secondary"
          className="inline-flex mr-2"
          onClick={onClickSettings}
        >
          <SvgIcon
            className="nordpass-svg color-primary-accent-1 hover:color-primary-accent-13"
            src={settingsIcon}
            width={24}
            height={24}
          />
        </Link>
        <Tooltip showOnHover id="tools">
          <FormattedMessage id="tools" />
        </Tooltip>
        <Link
          data-tip-tools
          className="inline-flex"
          onClick={onClickTools}
        >
          <SvgIcon
            className="nordpass-svg color-primary-accent-1 hover:color-primary-accent-13"
            src={toolsIcon}
            width={24}
            height={24}
          />
        </Link>
        <Tooltip showOnHover id="profile" direction={OpenDirection.BottomRight}>
          {email}
        </Tooltip>
        <button
          data-tip-profile
          data-testid="header-menu-profile-icon"
          type="button"
          className="relative inline-flex ml-2 justify-center"
          onClick={handleProfileIconClick}
        >
          <Avatar
            avatar={avatar}
            email={email}
            size={Size.ExtraSmall}
            className="inline-block"
          />
        </button>

      </div>
    </div>
  );
};
