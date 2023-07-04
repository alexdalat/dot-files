import { useState, useMemo, ReactNode } from 'react';
import { VaultItemModalsContext } from './VaultItemModalsContext';
import { IVaultItemModalContext, IVaultItemModal } from './VaultItemModalsContextContracts';

export const VaultItemModalsProvider = ({ children }: { children?: ReactNode }) => {
  const [vaultItemModalData, setVaultItemModalData] = useState<IVaultItemModal | null>(null);

  const value = useMemo<IVaultItemModalContext>(() => ({
    vaultItemModalData,
    setVaultItemModalData,
  }), [
    vaultItemModalData,
    setVaultItemModalData,
  ]);

  return (
    <VaultItemModalsContext.Provider value={value}>
      {children}
    </VaultItemModalsContext.Provider>
  );
};
