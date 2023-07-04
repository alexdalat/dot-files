import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import { SvgIcon } from '@common/components/SvgIcon';
import { AccountButton } from '@extension/app/pages/Profile/components/AccountSwitch/AccountButton';
import { IAccount } from '@common/interfaces/account';
import { MAX_ACCOUNTS_ALLOWED } from '@common/constants';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { ErrorBlock } from '@nordpass/ui';
import * as addAccountDark from '@icons/32/add-account-dark.svg';
import * as addAccountLight from '@icons/32/add-account-light.svg';
import { handleAddNewAccount } from '@extension/app/pages/Profile/components/AccountSwitch/utils/handleAddNewAccount';
import styles from './AccountSwitch.module.scss';

interface IAccountSwitchProps {
  accounts: Array<IAccount>;
  refetch: () => Promise<Array<IAccount> | undefined>;
  error?: string;
}

export const AccountSwitch = ({ accounts, refetch, error }: IAccountSwitchProps) => {
  const { isDarkTheme } = useAppTheme();
  const totalAccounts = accounts.length + 1; // add (+1) for current active account

  if (error) {
    return <ErrorBlock error={error} />;
  }

  return (
    <div className="mb-4">
      <p className="select-none color-grey-dark text-micro ml-4 mb-1 text-left">
        <FormattedMessage id="switchAccount" />
      </p>
      <div className="overflow-y-auto">
        {accounts.map(account => (
          <AccountButton
            refetch={refetch}
            key={account.uuid}
            tooltipId={account.uuid}
            {...account}
          />
        ))}
        {totalAccounts < MAX_ACCOUNTS_ALLOWED && (
          <button
            type="button"
            className={cx(styles['account-switch__add-button'], 'hover:bg-primary-accent-18 color-primary')}
            onClick={handleAddNewAccount}
          >
            <SvgIcon
              src={isDarkTheme ? addAccountDark : addAccountLight}
              className={isDarkTheme ? styles['account-switch__svg--dark'] : styles['account-switch__svg--light']}
              width={32}
              height={32}
            />
            <p className="text-micro ml-4">
              <FormattedMessage id="addAnotherAccount" />
            </p>
          </button>
        )}
      </div>
    </div>
  );
};
