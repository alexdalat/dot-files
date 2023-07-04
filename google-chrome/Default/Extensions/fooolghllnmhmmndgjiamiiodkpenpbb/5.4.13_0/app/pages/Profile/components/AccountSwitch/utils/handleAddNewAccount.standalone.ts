import { api } from '@extension/app/api';
import { proxyStore } from '@extension/browser/standalone/proxyStore';
import { setIsAddingNewAccount } from '@common/store/reducers/account/accountSlice';

export const handleAddNewAccount = async () => {
  proxyStore.dispatch(setIsAddingNewAccount(true));
  await api.account.accountUnlink();
  proxyStore.dispatch(setIsAddingNewAccount(false));
};
