import { memo, useContext, useEffect } from 'react';
import { Button } from '@nordpass/ui';
import {
  getIsCreditCard,
  getIsNote,
  getIsPasskey,
  getIsPassword,
  getIsPersonalInfo,
} from '@common/utils/itemTypeGuards';
import moreIcon from '@icons/24/more.svg';
import { IItem } from '@common/interfaces/item';
import { ShareStatus } from '@common/constants/vault';
import { Menu } from '@common/components/Menu/Menu';
import { useMenuState } from '@common/components/Menu/useMenuState';
import { SvgIcon } from '@common/components/SvgIcon';
import { PasskeyContextMenu } from '@extension/app/components/VaultList/ItemMenu/components/PasskeyContextMenu';
import { PasswordContextMenu } from './components/PasswordContextMenu';
import { CreditCardContextMenu } from './components/CreditCardContextMenu';
import { NoteContextMenu } from './components/NoteContextMenu';
import { PersonalInfoContextMenu } from './components/PersonalInfoContextMenu';
import { PendingContextMenu } from './components/PendingContextMenu';
import { VaultItemContext } from '../VaultItemContext';

interface IItemMenuProps {
  item: IItem;
}

const ContextMenu = ({ item }: IItemMenuProps) => {
  if (item.share_status === ShareStatus.Pending) {
    return <PendingContextMenu item={item} />;
  }

  if (getIsPassword(item)) {
    return <PasswordContextMenu item={item} />;
  }
  if (getIsPasskey(item)) {
    return <PasskeyContextMenu item={item} />;
  }
  if (getIsCreditCard(item)) {
    return <CreditCardContextMenu item={item} />;
  }
  if (getIsNote(item)) {
    return <NoteContextMenu item={item} />;
  }
  if (getIsPersonalInfo(item)) {
    return <PersonalInfoContextMenu item={item} />;
  }
  return null;
};

export const ItemMenu = memo(({ item }: IItemMenuProps) => {
  const { setIsContextOpen } = useContext(VaultItemContext);
  const { isOpen, close, toggleOpen } = useMenuState();

  useEffect(() => setIsContextOpen(isOpen), [isOpen, setIsContextOpen]);

  return (
    <Menu
      isOpen={isOpen}
      button={
        <Button
          size="small"
          rank="secondary"
          onClick={toggleOpen}
        >
          <SvgIcon
            src={moreIcon}
            width={24}
            height={24}
            className="nordpass-svg color-primary-accent-6"
          />
        </Button>
      }
      onClose={close}
    >
      <ContextMenu item={item} />
    </Menu>
  );
});
