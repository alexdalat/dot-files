import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { api } from '@extension/app/api';
import { createListener } from '@extension/app/api/createListener';
import { noOp } from '@common/constants/function';
import { INotification } from '@common/interfaces/messages';
import { IInvitation } from '@common/contracts/contracts';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { LogLevel } from '@common/services/loggingFactory/contracts';
import {
  isOrganizationInfoChangedMessage,
  isOrganizationInvitesChangedMessage,
} from '@common/utils/notificationTypeGuards';
import { useAuthContext } from './AuthContext';

interface IOrganizationContext {
  setShowInvitation: (value: boolean) => void;
  showInvitation: boolean;
  organizationData?: IOrganization;
  invitations?: Array<IInvitation>;
  isReady: boolean;
}

const OrganizationContext = createContext<IOrganizationContext>({
  setShowInvitation: noOp,
  showInvitation: true,
  organizationData: undefined,
  invitations: undefined,
  isReady: false,
});

export const OrganizationContextProvider = ({ children }: { children?: ReactNode }) => {
  const { authState } = useAuthContext();
  const [organizationData, setOrganizationData] = useState<IOrganization>();
  const [invitations, setInvitations] = useState<Array<IInvitation>>();
  const [showInvitation, setShowInvitation] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (authState !== AuthState.Authenticated) {
      return noOp;
    }

    (async () => {
      try {
        const organization = await api.organization.fetchOrganization();
        setOrganizationData(organization);

        const invites = await api.organization.getInvites();
        setInvitations(invites);
      } catch (error) {
        logMessage(LogLevel.Error, 'OrganizationContext:getInvitations', error);
      }

      setIsReady(true);
    })();

    function handleChange(msg: INotification) {
      if (isOrganizationInfoChangedMessage(msg)) {
        StorageApi.set({ [Storage.showOrganizationBar]: true });
        setOrganizationData(msg);
        return;
      }

      if (isOrganizationInvitesChangedMessage(msg)) {
        StorageApi.set({ [Storage.showOrganizationBar]: true });
        setInvitations(msg.organization_invites);
      }
    }
    return createListener(handleChange, ListenerType.RuntimeMessage);
  }, [authState]);

  const value = useMemo(() => ({
    setShowInvitation,
    organizationData,
    showInvitation,
    invitations,
    isReady,
  }), [organizationData, showInvitation, invitations, isReady]);

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = () => useContext(OrganizationContext);
