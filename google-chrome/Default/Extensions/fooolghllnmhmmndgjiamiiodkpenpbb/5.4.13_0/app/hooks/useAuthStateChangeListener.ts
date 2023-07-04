import { useEffect, useState } from 'react';
import { ListenerType, Storage } from '@extension/common/constants';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { noOp } from '@common/constants/function';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { StorageApi } from '@extension/browser/storageApi';
import { parseSubscriptionData } from '@common/utils/parseSubscriptionData/parseSubscriptionData';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import { isLegacyExtension } from '@common/utils/platformEnv';
import { closePopup } from '../utils/closePopup';

export const useAuthStateChangeListener = (isPopup: boolean) => {
  const [state, setState] = useState<AuthState>();

  useEffect(() => {
    const handleAuthStateChange = async (changes: Record<string, any>) => {
      if (changes[Storage.AuthState]) {
        setState(changes[Storage.AuthState].newValue);

        if (![AuthState.MasterValidate, AuthState.Authenticated].includes(changes[Storage.AuthState].newValue)) {
          const isAddingNewAccount = await StorageApi.get({ [Storage.IsAddingNewAccount]: false });
          if (isLegacyExtension || isAddingNewAccount[Storage.IsAddingNewAccount]) {
            // make sure desktop app is opened before closing extension popup
            await api.extension.openDesktopApp().catch(noOp);
          }

          if (isPopup) {
            closePopup({ legacySafariPopupClose: api.extension.closePopup });
          } else {
            await api.extension.closeTab().catch(noOp);
          }
        }

        if (changes[Storage.AuthState].newValue === AuthState.Authenticated) {
          api.user.getServices().then(services => (
            StorageApi.set({ [Storage.SubscriptionData]: parseSubscriptionData(services) }).catch(error =>
              logMessage(LogLevel.Error, 'useAuthStateChangeListener:StorageApi:SetSubscriptionData', error.message),
            )),
          ).catch(noOp);
        }
      }
    };

    return createListener(handleAuthStateChange, ListenerType.StorageChange);
  }, [isPopup]);

  return state;
};
