import { FormattedMessage } from 'react-intl';
import { VaultType } from '@common/constants/vault';

interface IHeaderTextProps {
  vaultType: VaultType;
  folderTitle: string | undefined;
}

export const HeaderText = ({ vaultType, folderTitle }: IHeaderTextProps) => {
  if (folderTitle) {
    return <span>{folderTitle}</span>;
  }

  switch (vaultType) {
    case VaultType.Password:
      return <FormattedMessage id="passwords" />;
    case VaultType.Passkey:
      return <FormattedMessage id="passkeys" />;
    case VaultType.Note:
      return <FormattedMessage id="secureNotes" />;
    case VaultType.CreditCard:
      return <FormattedMessage id="creditCards" />;
    case VaultType.PersonalInfo:
      return <FormattedMessage id="personalInfo" />;
    case VaultType.Shared:
      return <FormattedMessage id="sharedItems" />;
    case VaultType.Trash:
      return <FormattedMessage id="trash" />;
    default:
      return <span>NordPass</span>;
  }
};
