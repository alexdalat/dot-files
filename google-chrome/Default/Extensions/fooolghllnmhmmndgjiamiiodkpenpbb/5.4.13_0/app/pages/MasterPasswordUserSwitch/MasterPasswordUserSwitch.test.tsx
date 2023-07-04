import { render, waitFor } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { UserSwitch } from '@extension/app/pages/MasterPasswordUserSwitch/MasterPasswordUserSwitch';
import { api } from '@extension/app/api';
import { ExtensionAction } from '@common/constants/action';
import { IAccount } from '@common/interfaces/account';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { ISubscriptionData } from '@common/utils/parseSubscriptionData/parseSubscriptionData';
import { AuthContext } from '@extension/app/context/AuthContext';
import userEvent from '@testing-library/user-event';
import { BrowserApi } from '@extension/browser/browserApi';

jest.spyOn(api.action, 'saveMetric');
jest.spyOn(api.account, 'accountLogout');
const switchAccount = jest.spyOn(api.extension, 'switchAccount');
const getNextAccountUuid = jest.spyOn(api.extension, 'getNextAccountUUID');

describe('UserSwitch', () => {
  const currentUserUuidMock = 'uuid1';
  const email = 'test@test.lt';
  const logOutButtonText = 'Log out';
  const removeButtonText = 'Remove';

  const setup = (accounts = [{ uuid: currentUserUuidMock, email } as IAccount]) => {
    jest.spyOn(api.account, 'getAccountList').mockResolvedValue(accounts);
    return render(wrapWithProviders(
      <AuthContext.Provider
        value={{
          authState: AuthState.MasterValidate,
          subscriptionData: {} as ISubscriptionData,
          email,
        }}
      >
        <UserSwitch />
      </AuthContext.Provider>,
    ));
  };

  beforeEach(jest.clearAllMocks);

  it('should get accounts on render', async () => {
    setup();

    await waitFor(() => {
      expect(api.account.getAccountList).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout and switch user on logout if there is next account uuid', async () => {
      const nextUuid = 'id3';
      getNextAccountUuid.mockResolvedValue({ uuid: nextUuid });
      const { findByText } = setup();
      await userEvent.click(await findByText(logOutButtonText));

      expect(api.action.saveMetric).toHaveBeenCalledWith('metric_logout_intent');
      expect(api.extension.getNextAccountUUID).toHaveBeenCalled();
      expect(api.extension.switchAccount).toHaveBeenCalledWith(nextUuid);
      expect(api.account.accountLogout).toHaveBeenCalledWith(currentUserUuidMock, true);
    });

    it('should not remove account from the list on logout if there is more than 1 account', async () => {
      const listWithTwoAccounts = [{ uuid: currentUserUuidMock, email }, { uuid: 'id77', email: 'email7@test.lt' }] as Array<IAccount>;
      const { findByText } = setup(listWithTwoAccounts);
      await userEvent.click(await findByText(logOutButtonText));

      expect(api.account.accountLogout).toHaveBeenCalledWith(currentUserUuidMock, false);
    });

    it('should just logout and NOT switch user on logout if next uuid is undefined', async () => {
      getNextAccountUuid.mockResolvedValue({ uuid: undefined });
      const { findByText } = setup();
      await userEvent.click(await findByText(logOutButtonText));

      expect(api.extension.getNextAccountUUID).toHaveBeenCalled();
      expect(api.extension.switchAccount).not.toHaveBeenCalled();
      expect(api.account.accountLogout).toHaveBeenCalledWith(currentUserUuidMock, true);
      expect(api.account.getAccountList).toHaveBeenCalled();
    });

    it('should just send logout intent metric if there is no current user uuid', async () => {
      const { findByText } = setup([]);
      await userEvent.click(await findByText(logOutButtonText));

      expect(api.action.saveMetric).toHaveBeenCalledWith('metric_logout_intent');
      expect(BrowserApi.sendMessage).not.toHaveBeenCalledWith({ type: ExtensionAction.ExtensionGetNextAccountUUID });
      expect(api.extension.switchAccount).not.toHaveBeenCalled();
      expect(api.account.accountLogout).not.toHaveBeenCalled();
    });

    it('should logout and re-fetch account list even after unsuccessful account switch', async () => {
      const nextUuid = '5465';
      getNextAccountUuid.mockResolvedValue({ uuid: nextUuid });
      switchAccount.mockRejectedValue(new Error('failed to switch'));
      jest.spyOn(api.account, 'accountLogout').mockRejectedValue('error');
      const { findByText } = setup();
      await userEvent.click(await findByText(logOutButtonText));

      expect(api.account.accountLogout).toHaveBeenCalledWith(currentUserUuidMock, true);
      expect(api.account.getAccountList).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should just send logout intent metric on Remove click if there is no current user uuid', async () => {
      const { findByText } = setup([]);
      await userEvent.click(await findByText(removeButtonText));

      expect(api.action.saveMetric).toHaveBeenCalledWith('metric_logout_intent');
      expect(api.account.accountLogout).not.toHaveBeenCalled();
    });

    it('should logout current user and remove from the list on Remove', async () => {
      const { findByText } = setup();
      await userEvent.click(await findByText(removeButtonText));

      expect(api.account.accountLogout).toHaveBeenCalledWith(currentUserUuidMock, true);
      expect(api.account.getAccountList).toHaveBeenCalled();
    });

    it('should re-fetch account list even after unsuccessful account logout', async () => {
      jest.spyOn(api.account, 'accountLogout').mockRejectedValue('error');
      const { findByText } = setup();
      await userEvent.click(await findByText(removeButtonText));

      expect(api.account.getAccountList).toHaveBeenCalled();
    });
  });
});
