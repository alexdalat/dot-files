import {
  getIsAllItemsLinkActive,
  getIsItemLinkActive,
  getIsSharedActive,
  getIsTrashActive,
} from '@common/utils/itemLinksActivity';
import { ReactNode, useContext } from 'react';
import { Location, useLocation } from 'react-router-dom';
import { SVG } from '@nord/ui';
import { FormattedMessage } from 'react-intl';
import { ROUTES } from '@extension/common/constants/routes';
import allItemsIcon from '@icons/24/all-items.svg';
import passwordsIcon from '@icons/24/passwords.svg';
import secureNotesIcon from '@icons/24/secure-notes.svg';
import creditCardIcon from '@icons/24/cc.svg';
import personalInfoIcon from '@icons/24/personal-info.svg';
import passkeyIcon from '@icons/passkey.svg';
import sharedItemsIcon from '@icons/24/shared-items.svg';
import trashIcon from '@icons/24/trash.svg';
import { PendingSharesContext } from '@extension/app/context/PendingSharesContext/PendingSharesContext';
import { VaultType } from '@common/constants/vault';
import { NavLink } from '@common/components/NavLink/NavLink';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { FeatureFlag } from '@common/constants/featureFlag';

interface ISidebarItem {
  icon: ReactNode;
  link: string;
  text: ReactNode;
  isActive: ({ location }: { location: Location }) => boolean;
  showPending?: boolean;
  isHidden?: boolean;
}

const getSidebarItems = (isPasskeySectionEnabled: boolean): Array<ISidebarItem> => [
  {
    icon: <SVG noLazy className="mr-3" src={allItemsIcon} />,
    link: ROUTES.VAULT,
    text: <FormattedMessage id="allItems" />,
    isActive: ({ location }) => getIsAllItemsLinkActive(location.pathname, location.search),
  },
  {
    icon: <SVG noLazy className="mr-3" src={passwordsIcon} />,
    link: ROUTES.VAULT_TYPE(VaultType.Password),
    text: <FormattedMessage id="passwords" />,
    isActive: ({ location }) => getIsItemLinkActive(location.pathname, location.search, VaultType.Password),
  },
  {
    icon: (
      <SVG
        noLazy
        width={24}
        height={24}
        className="mr-3"
        src={passkeyIcon}
      />),
    link: ROUTES.VAULT_TYPE(VaultType.Passkey),
    text: <FormattedMessage id="passkeys" />,
    isActive: ({ location }) => getIsItemLinkActive(location.pathname, location.search, VaultType.Passkey),
    isHidden: !isPasskeySectionEnabled,
  },
  {
    icon: <SVG noLazy className="mr-3" src={secureNotesIcon} />,
    link: ROUTES.VAULT_TYPE(VaultType.Note),
    text: <FormattedMessage id="secureNotes" />,
    isActive: ({ location }) => getIsItemLinkActive(location.pathname, location.search, VaultType.Note),
  },
  {
    icon: <SVG noLazy className="mr-3" src={creditCardIcon} />,
    link: ROUTES.VAULT_TYPE(VaultType.CreditCard),
    text: <FormattedMessage id="creditCards" />,
    isActive: ({ location }) => getIsItemLinkActive(location.pathname, location.search, VaultType.CreditCard),
  },
  {
    icon: <SVG noLazy className="mr-3" src={personalInfoIcon} />,
    link: ROUTES.VAULT_TYPE(VaultType.PersonalInfo),
    text: <FormattedMessage id="personalInfo" />,
    isActive: ({ location }) => getIsItemLinkActive(location.pathname, location.search, VaultType.PersonalInfo),
  },
  {
    icon: <SVG noLazy className="mr-3" src={sharedItemsIcon} />,
    link: ROUTES.VAULT_TYPE(VaultType.Shared),
    text: <FormattedMessage id="sharedItems" />,
    showPending: true,
    isActive: ({ location }) => getIsSharedActive(location.pathname, location.search),
  },
  {
    icon: <SVG noLazy className="mr-3" src={trashIcon} />,
    link: ROUTES.TRASH,
    text: <FormattedMessage id="trash" />,
    isActive: ({ location }) => getIsTrashActive(location.pathname),
  },
];

interface IItemLinksProps {
  onMenuClose: () => void;
}

export const ItemLinks = ({ onMenuClose }: IItemLinksProps) => {
  const allShares = useContext(PendingSharesContext);
  const location = useLocation();
  const isPasswordlessEnabled = useExtensionFeature(FeatureFlag.Passwordless);

  return (
    <>
      <div className="sidebar__group-label px-5 text-grey-dark">
        <FormattedMessage id="categories" />
      </div>
      {getSidebarItems(isPasswordlessEnabled).map(({
        icon, link, isActive, text, showPending, isHidden,
      }) => isHidden ? null : (
        <NavLink
          key={link}
          to={link}
          className="pl-6 pr-5 sidebar-category"
          isActive={isActive({ location })}
          onClick={onMenuClose}
        >
          <span className="truncate flex items-center">
            {icon}
            {text}
          </span>
          {showPending && allShares && allShares.length > 0 && (
            <span className="badge bg-red ml-2 text-white">{allShares.length}</span>
          )}
        </NavLink>
      ))}
    </>
  );
};
