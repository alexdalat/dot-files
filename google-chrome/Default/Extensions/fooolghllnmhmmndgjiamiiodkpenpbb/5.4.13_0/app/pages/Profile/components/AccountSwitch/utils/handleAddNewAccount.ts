import { api } from '@extension/app/api';

export const handleAddNewAccount = () => {
  api.account.accountUnlink();
};
