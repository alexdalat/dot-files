import { IAccount } from '@common/interfaces/account';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { StorageApi } from '@extension/browser/storageApi';
import { AppTheme } from '@common/constants/appTheme';
import { Storage } from '@extension/common/constants';
import { Providers } from '@common/constants/providers';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { AccountSwitch } from './AccountSwitch';

type TAccountSwitchSetup = {
  accounts: Array<IAccount>;
}

const setup = ({
  accounts = [],
}: TAccountSwitchSetup) => render(
  wrapWithProviders(<AccountSwitch accounts={accounts} refetch={() => Promise.resolve([])} />),
);

describe('AccountSwitch', () => {
  beforeAll(() => {
    StorageApi.get = jest.fn().mockResolvedValue({ [Storage.AppTheme]: AppTheme.Light });
  });

  const userAccount: IAccount = { email: 'test@mock.com', avatar: null, provider: Providers.NordAccount, uuid: 'uuid1234', state: AuthState.Authenticated };
  const unauthenticatedUserAccount: IAccount = { ...userAccount, state: AuthState.Unauthenticated };

  it('should render "add account" button', async () => {
    const { findByText } = setup({ accounts: [] });
    expect(await findByText('Add another account')).toBeVisible();
  });

  it('should render account button', async () => {
    const { findByText } = setup({ accounts: [userAccount] });
    expect(await findByText('test@mock.com')).toBeVisible();
  });

  it('should display "remove" button  on account menu button click', async () => {
    const { findByTestId, findByText } = setup({ accounts: [userAccount] });
    await userEvent.hover(await findByTestId('account-menu-button'));
    const accountMenuButton = await findByTestId('account-options-button');
    await userEvent.click(accountMenuButton);
    expect(await findByText('Remove')).toBeVisible();
  });

  it('should not display "Log Out" menu item when user is already logged out', async () => {
    setup({ accounts: [unauthenticatedUserAccount] });

    await userEvent.hover(await screen.findByTestId('account-menu-button'));

    const accountMenuButton = await screen.findByTestId('account-options-button');
    await userEvent.click(accountMenuButton);

    expect(await screen.findByText('Remove')).toBeVisible();

    expect(screen.queryByText('Log Out')).toBeNull();
  });
});
