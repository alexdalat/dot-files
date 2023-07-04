import { createContext } from 'react';
import { noOp } from '@common/constants/function';
import { IVaultItemModalContext } from './VaultItemModalsContextContracts';

export const VaultItemModalsContext = createContext<IVaultItemModalContext>({
  vaultItemModalData: null,
  setVaultItemModalData: noOp,
});
