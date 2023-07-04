import { useQuery } from '@common/hooks/useQuery/useQuery';
import { isUserEmailChangeMessage } from '@common/utils/notificationTypeGuards';
import { createContext, useState, useEffect, useContext, useMemo, useCallback, ReactNode } from 'react';
import { ListenerType, Storage } from '@extension/common/constants';
import { ISubscriptionData, parseSubscriptionData } from '@common/utils/parseSubscriptionData/parseSubscriptionData';
import { StorageApi } from '@extension/browser/storageApi';
import { isPopupOpen } from '@extension/app/utils/isPopupOpen';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { INotification } from '@common/interfaces/messages';
import { noOp } from '@common/constants/function';
import { DAY, SECOND } from '@common/constants/time';
import { Providers } from '@common/constants/providers';
import { usePrevious } from '@common/hooks/usePrevious';
import { closePopup } from '../utils/closePopup';
import { useIsSafariPopup } from '../hooks/useIsSafariPopup';

interface IAuthProvider {
  initialState?: IAuthContext;
  authState?: AuthState;
  children?: ReactNode;
}

export interface IAuthContext {
  authState: AuthState;
  subscriptionData: ISubscriptionData;
  email: string;
  provider?: Providers;
}

const INITIAL_STATE: IAuthContext = {
  authState: AuthState.Unauthenticated,
  email: '',
  subscriptionData: {
    isBusiness: false,
    isPremium: false,
    expirationDate: null,
    isTrial: false,
    isTrialAvailable: false,
  },
};

export const AuthContext = createContext<IAuthContext>(INITIAL_STATE);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({
  initialState = INITIAL_STATE,
  authState = undefined,
  children,
}: IAuthProvider) => {
  const [state, setState] = useState(initialState.authState);
  const prevState = usePrevious(state);
  const [email, setEmail] = useState(initialState.email);
  const { data: initialEmail } = useQuery(api.extension.getUserEmail);
  const getEmail = useCallback(async () => email ? api.user.getProvider(email) : undefined, [email]);
  const { data: provider } = useQuery(getEmail);
  const isSafariPopup = useIsSafariPopup();

  const [subscriptionData, setSubscriptionData] = useState(initialState[Storage.SubscriptionData]);

  useEffect(() => {
    setEmail(prev => initialEmail ?? prev);
  }, [initialEmail]);

  useEffect(() => {
    setState(prev => authState ?? prev);
  }, [authState]);

  useEffect(() => {
    // TODO instead of storage listen to actual services changed event here
    if (!subscriptionData?.expirationDate) {
      return noOp;
    }

    const diff = subscriptionData.expirationDate - Date.now();
    if (diff > 14 * DAY) {
      return noOp; // ignore services that expire in more than 14 days
    }

    const timer = setTimeout(async () => {
      const services = await api.user.getServices();
      await StorageApi.set({ [Storage.SubscriptionData]: parseSubscriptionData(services) });
    }, diff);

    return () => clearTimeout(timer);
  }, [subscriptionData]);

  useEffect(() => {
    // Listener created in AuthContext have an issue of being unsubscribed during loading states
    // in App.tsx, as AuthContext is unmounted, so Storage.AuthState values where not always correctly retrieved.
    const handleStorageChange = async (changes: Record<string, any>) => {
      if (changes[Storage.SubscriptionData]) {
        setSubscriptionData(changes[Storage.SubscriptionData].newValue);
      }
    };

    return createListener(handleStorageChange, ListenerType.StorageChange);
  }, []);

  useEffect(() => {
    const handleEmailChange = async (msg: INotification) => {
      if (isUserEmailChangeMessage(msg)) {
        setEmail(msg.email);
      }
    };
    return createListener(handleEmailChange, ListenerType.RuntimeMessage);
  }, []);

  useEffect(() => {
    let timerId: undefined | number;
    // Close on lock after a second
    if (state === AuthState.MasterValidate && prevState === AuthState.Authenticated) {
      timerId = setTimeout(async () => {
        const isPopup = isPopupOpen();

        if (isPopup || isSafariPopup) {
          closePopup({ legacySafariPopupClose: api.extension.closePopup });
        } else {
          await api.extension.closeTab().catch(noOp);
        }
      }, SECOND) as unknown as number;
    }

    return () => clearTimeout(timerId);
  }, [isSafariPopup, prevState, state]);

  const value = useMemo(() => ({
    authState: state,
    subscriptionData,
    provider,
    email,
  }), [state, subscriptionData, email, provider]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
