import { useContext, ReactNode } from 'react';
import { Button } from '@nordpass/ui';
import { FormattedMessage } from 'react-intl';
import { AuthContext } from '@extension/app/context/AuthContext';
import { UpgradeToShare } from '@extension/app/components/UpgradeToShare';
import { api } from '@extension/app/api';
import { useSearchParam } from '@common/hooks/useSearchParam';
import { AddMenu } from '@extension/app/components/AddMenu/AddMenu';
import cx from 'classnames';
import { VaultType } from '@common/constants/vault';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { RemoteURL } from '@common/constants/remoteURL';
import emptyStateLoginsIcon from '@icons/empty-state-logins.svg';
import emptyStatePasskeysIcon from '@icons/empty-state-passkeys.svg';
import emptyStateSecureNotesIcon from '@icons/empty-state-secure-notes.svg';
import emptyStateCreditCardsIcon from '@icons/empty-state-credit-cards.svg';
import emptyStatePersonalInfoIcon from '@icons/empty-state-personal-info.svg';
import emptyStateSharedItemsIcon from '@icons/empty-state-shared-items.svg';
import emptyStateTrashIcon from '@icons/empty-state-trash.svg';
import emptyStateHomeIcon from '@icons/empty-state-home.svg';

interface IEmptyVaultProps {
  search?: string;
  type: VaultType;
}

interface IError {
  icon?: string;
  message?: ReactNode;
  buttons?: ReactNode;
}

export const EmptyVault = ({ search, type }: IEmptyVaultProps) => {
  const { subscriptionData } = useContext(AuthContext);
  const isFolderView = !!useSearchParam('folder');

  const primaryTextClassNames = 'text-lead color-primary font-bold mb-1 -letter-spacing-006px';
  const secondaryTextClassNames = 'text-small color-primary-accent-1 mb-4 mx-2 -letter-spacing-014px';
  const buttonClassNames = 'block rounded-full -letter-spacing-014px w-full';

  if (search) {
    return (
      <div className="p-2 text-center color-primary-accent-1">
        <FormattedMessage id="noResultsFoundFor" />
        <div className="break-all color-primary">
          &quot;
          {search}
          &quot;
        </div>
      </div>
    );
  }

  const error: IError = {};
  if (type === VaultType.Password) {
    error.icon = emptyStateLoginsIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyVaultPasswordPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyVaultPasswordSecondaryText" />
        </div>
      </>
    );
    error.buttons = (
      <div className="flex flex-col justify-center">
        <Button
          kind="contained"
          rank="primary"
          className={cx(buttonClassNames, 'mb-3')}
          data-testid="empty-vault_add-password"
          onClick={() => api.extension.openDesktopApp({
            route: 'ADD_ITEM',
            args: [type],
          })}
        >
          <FormattedMessage id="addPassword" />
        </Button>

        <Button
          kind="contained"
          rank="primary"
          className={buttonClassNames}
          data-testid="empty-vault_import-passwords"
          onClick={() => api.extension.openDesktopApp({
            route: 'IMPORT',
          })}
        >
          <FormattedMessage id="importPasswords" />
        </Button>
      </div>
    );
  } else if (type === VaultType.Passkey) {
    error.icon = emptyStatePasskeysIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="passkeyVaultEmptyTitle" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="passkeyVaultEmptyDisclaimer" />
        </div>
      </>
    );
    error.buttons = (
      <div className="flex flex-col justify-center">
        <Button
          kind="contained"
          rank="secondary"
          className={cx(buttonClassNames, 'mb-3 capitalize')}
          data-testid="empty-vault_passkeys_learn-more"
          onClick={() => openInNewTab(RemoteURL.PasskeysLearnMoreLink)}
        >
          <FormattedMessage id="learnMore" />
        </Button>
      </div>
    );
  } else if (type === VaultType.Note) {
    error.icon = emptyStateSecureNotesIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyVaultNotesPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyVaultNotesSecondaryText" />
        </div>
      </>
    );
    error.buttons = (
      <Button
        kind="contained"
        rank="primary"
        className={buttonClassNames}
        data-testid="empty-vault_add-note"
        onClick={() => api.extension.openDesktopApp({
          route: 'ADD_ITEM',
          args: [type],
        })}
      >
        <FormattedMessage id="addSecureNotes" />
      </Button>
    );
  } else if (type === VaultType.CreditCard) {
    error.icon = emptyStateCreditCardsIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyVaultCCPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyVaultCCSecondaryText" />
        </div>
      </>
    );
    error.buttons = (
      <Button
        kind="contained"
        rank="primary"
        className={buttonClassNames}
        data-testid="empty-vault_add-credit-card"
        onClick={() => api.extension.openDesktopApp({
          route: 'ADD_ITEM',
          args: [type],
        })}
      >
        <FormattedMessage id="addCreditCard" />
      </Button>
    );
  } else if (type === VaultType.PersonalInfo) {
    error.icon = emptyStatePersonalInfoIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyVaultPersonalPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyVaultPersonalSecondaryText" />
        </div>
      </>
    );
    error.buttons = (
      <Button
        kind="contained"
        rank="primary"
        className={buttonClassNames}
        data-testid="empty-vault_add-personal-info"
        onClick={() => api.extension.openDesktopApp({
          route: 'ADD_ITEM',
          args: [type],
        })}
      >
        <FormattedMessage id="addPersonalInfo" />
      </Button>
    );
  } else if (type === VaultType.Shared) {
    if (subscriptionData?.isPremium) {
      error.icon = emptyStateSharedItemsIcon;
      error.message = (
        <>
          <span className={primaryTextClassNames}>
            <FormattedMessage id="emptyVaultSharedPrimaryText" />
          </span>
          <div className={secondaryTextClassNames}>
            <FormattedMessage id="emptyVaultSharedSecondaryText" />
          </div>
        </>
      );
    } else {
      return <UpgradeToShare />;
    }
  } else if (type === VaultType.Trash) {
    error.icon = emptyStateTrashIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyTrashPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyTrashSecondaryText" />
        </div>
      </>
    );
  } else if (type === VaultType.Folder) {
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyFolderPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyFolderSecondaryText" />
        </div>
      </>
    );
  } else {
    error.icon = emptyStateHomeIcon;
    error.message = (
      <>
        <span className={primaryTextClassNames}>
          <FormattedMessage id="emptyVaultPrimaryText" />
        </span>
        <div className={secondaryTextClassNames}>
          <FormattedMessage id="emptyVaultSecondaryText" />
        </div>
      </>
    );
    error.buttons = (
      <div className="flex flex-col justify-center">
        <AddMenu isButtonWithText />
        <Button
          kind="contained"
          rank="secondary"
          className={cx('mt-3', buttonClassNames)}
          data-testid="empty-vault_import"
          onClick={() => {
            api.extension.openDesktopApp({
              route: 'IMPORT',
            });
          }}
        >
          <FormattedMessage id="importItems" />
        </Button>
      </div>
    );
  }

  return (
    <div className="px-8 items-center text-center flex flex-col">
      {error.icon && (
        <div className={cx('flex justify-center', [VaultType.Shared, VaultType.Trash].includes(type) && 'mt-13')}>
          <img
            src={error.icon}
            className="h-88px"
            alt="error"
          />
        </div>
      )}
      <div className={cx('mt-3 mb-1', type === VaultType.Folder && isFolderView && 'mt-24')}>{error.message}</div>
      <div className="w-full">{error.buttons}</div>
    </div>
  );
};
