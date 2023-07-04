import { Image } from '@nord/ui';
import {
  getIsCreditCard,
  getIsNote,
  getIsPasskey,
  getIsPassword,
  getIsPersonalInfo,
  getIsSharedFolder, getIsUnknownItem,
} from '@common/utils/itemTypeGuards';
import { IItem } from '@common/interfaces/item';
import { CreditCardIcon } from '@common/components/CreditCardIcon/CreditCardIcon';
import { PasswordIcon } from '@common/components/PasswordIcon/PasswordIcon';
import { logMessage } from '@extension/common/utils/log/logMessage';
import secureNoteIcon from '@icons/secure-note.svg';
import personalInfoIcon from '@icons/personal-info.svg';
import sharedFolderIcon from '@icons/shared-folder46x36.svg';

export const ItemIcons = ({ item }: Record<'item', IItem>) => {
  if (getIsPassword(item) || getIsPasskey(item)) {
    return (
      <PasswordIcon
        logMessage={logMessage}
        title={item.title}
        url={item.url}
        className="rounded-image-8px item-image-32px my-1"
        uuid={item.uuid}
      />
    );
  }

  if (getIsNote(item)) {
    return <Image className="item-image-32px" src={secureNoteIcon} />;
  }

  if (getIsCreditCard(item)) {
    return <CreditCardIcon className="rounded-image-8px item-image-32px" type={item.card_type} />;
  }

  if (getIsPersonalInfo(item)) {
    return <Image className="item-image-32px" src={personalInfoIcon} />;
  }

  if (getIsSharedFolder(item)) {
    return <Image className="item-image-32px" src={sharedFolderIcon} />;
  }

  if (getIsUnknownItem(item)) {
    return <PasswordIcon logMessage={logMessage} title="" className="item-image-32px" />;
  }

  return null;
};
