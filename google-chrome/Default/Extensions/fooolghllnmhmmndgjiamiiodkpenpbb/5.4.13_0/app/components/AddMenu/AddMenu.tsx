import { useSearchParam } from '@common/hooks/useSearchParam';
import { memo, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import * as plusIcon from '@icons/24/plus.svg';
import * as questionIcon from '@icons/24/question.svg';
import { Button } from '@nordpass/ui';
import * as passwordsIcon from '@icons/24/passwords.svg';
import * as secureNotesIcon from '@icons/24/secure-notes.svg';
import * as creditCardIcon from '@icons/24/cc.svg';
import * as personalInfoIcon from '@icons/24/personal-info.svg';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { SvgIcon } from '@common/components/SvgIcon';
import { api } from '@extension/app/api';
import { Menu } from '@common/components/Menu/Menu';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { ItemType, VaultType } from '@common/constants/vault';
import { useMenuState } from '@common/components/Menu/useMenuState';
import { VaultContext } from '@extension/app/context/VaultContext';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { RemoteURL } from '@common/constants/remoteURL';

import './AddMenu.scss';

const menuItems = [
  {
    type: ItemType.Password,
    title: <FormattedMessage id="password" />,
    icon: passwordsIcon,
  },
  {
    type: ItemType.Note,
    title: <FormattedMessage id="secureNote" />,
    icon: secureNotesIcon,
  },
  {
    type: ItemType.CreditCard,
    title: <FormattedMessage id="creditCard" />,
    icon: creditCardIcon,
  },
  {
    type: ItemType.PersonalInfo,
    title: <FormattedMessage id="personalInfo" />,
    icon: personalInfoIcon,
  },
];

interface IAddMenuProps {
  isButtonWithText?: boolean;
}

export const AddMenu = memo(({ isButtonWithText }: IAddMenuProps) => {
  const { domain } = useContext(ExtensionContext);
  const { vaultItems } = useContext(VaultContext);
  const { isOpen, close, toggleOpen } = useMenuState();
  const folderId = useSearchParam('folder');
  const isFolderView = !!folderId;

  const vaultType = useSearchParam<VaultType>('type');
  const isInPasskeysVault = vaultType === VaultType.Passkey;
  const isPasskeysVaultEmpty = !vaultItems.some(i => i.type === ItemType.Passkey);

  if (isInPasskeysVault) {
    if (isPasskeysVaultEmpty) {
      return null;
    }

    return (
      <button
        type="button"
        className="add-item-button bg-primary-accent-17 hover:bg-primary-accent-27"
        onClick={() => openInNewTab(RemoteURL.PasskeysLearnMoreLink)}
      >
        <SvgIcon
          src={questionIcon}
          className="nordpass-svg color-primary-accent-12"
          width={24}
          height={24}
        />
      </button>
    );
  }

  return (
    <Menu
      isOpen={isOpen}
      button={
        isButtonWithText ? (
          <Button
            kind="contained"
            rank="secondary"
            className="w-full"
            data-testid="add-item"
            onClick={toggleOpen}
          >
            <FormattedMessage id="addItem" />
          </Button>
        ) : (
          <button
            type="button"
            className="add-item-button bg-primary-accent-17 hover:bg-primary-accent-27"
            onClick={toggleOpen}
          >
            <SvgIcon
              src={plusIcon}
              className="nordpass-svg color-primary-accent-12"
              width={24}
              height={24}
            />
          </button>
        )
      }
      onClose={close}
    >
      {menuItems.map(({ type, title, icon }) => (
        <MenuItem
          key={type}
          onClick={() => {
            api.extension.openDesktopApp({
              route: 'ADD_ITEM',
              args: isFolderView ? [type, `folder=${folderId}`] : [type],
              url: domain ?? undefined,
            });
          }}
        >
          <span className="flex flex-1 items-center">
            <SvgIcon
              src={icon}
              className="nordpass-svg mr-3 icon-primary"
              width={24}
              height={24}
            />
            {title}
          </span>
        </MenuItem>
      ))}
    </Menu>
  );
});
