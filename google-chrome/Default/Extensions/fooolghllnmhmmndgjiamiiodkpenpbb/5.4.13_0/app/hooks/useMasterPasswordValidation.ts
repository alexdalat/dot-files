import { useEffect, useState } from 'react';
import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';

export const useMasterPasswordValidation = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setIsValidating = async (isValidating: boolean) =>
    StorageApi.set({ [Storage.IsValidatingMasterPassword]: isValidating });

  const setValidationError = async (error: string| null) =>
    StorageApi.set({ [Storage.MasterPasswordValidationError]: error });

  useEffect(() => {
    (async () => {
      const isValidatingResult = await StorageApi.get({ [Storage.IsValidatingMasterPassword]: false });
      const errorResult = await StorageApi.get({ [Storage.MasterPasswordValidationError]: null });
      setIsLoading(isValidatingResult[Storage.IsValidatingMasterPassword]);
      setErrorMessage(errorResult[Storage.MasterPasswordValidationError]);
    })();
  }, []);

  useEffect(() => {
    const checkValidationState = (changes: Record<string, any>) => {
      const isValidatingStateChanges = changes[Storage.IsValidatingMasterPassword];
      const errorStateChanges = changes[Storage.MasterPasswordValidationError];

      if (isValidatingStateChanges) {
        setIsLoading(isValidatingStateChanges.newValue);
      }

      if (errorStateChanges) {
        setErrorMessage(errorStateChanges.newValue);
      }
    };
    return createListener(checkValidationState, ListenerType.StorageChange);
  }, []);

  useEffect(() => () => { setValidationError(null); }, []);

  return { isValidating: isLoading, errorMessage, setIsValidating, setValidationError };
};
