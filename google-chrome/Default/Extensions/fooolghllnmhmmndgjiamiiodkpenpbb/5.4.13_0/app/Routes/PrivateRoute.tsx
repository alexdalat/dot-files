import { useContext, useEffect, useMemo } from 'react';
import { Navigate, Outlet, PathRouteProps } from 'react-router-dom';
import { ROUTES } from '@extension/common/constants/routes';
import { isSafari } from '@common/utils/isSafari';
import { AuthContext } from '@extension/app/context/AuthContext';
import { LayoutPrivate } from '@extension/app/layouts/LayoutPrivate';
import { api } from '@extension/app/api';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { ExtensionContext } from '@extension/app/context/ExtensionContext';
import { PasswordPolicyContextProvider } from '@extension/app/context/PasswordPolicyContext';
import { setLastPage } from './lastPage';

interface IPrivateRouteProps extends PathRouteProps {
  hideHeader?: boolean;
}

export const PrivateRoute = ({ hideHeader }: IPrivateRouteProps) => {
  const { authState } = useContext(AuthContext);
  const { isPopup } = useContext(ExtensionContext) ?? {};
  const isUnauthenticated = useMemo(() => authState !== AuthState.Authenticated, [authState]);
  const isPopupOrSafari = useMemo(() => isPopup || isSafari, [isPopup]);

  useEffect(() => {
    if (isUnauthenticated) {
      setLastPage(window.location.hash.substring(1));
    }
  }, [isUnauthenticated]);

  useEffect(() => {
    if (!isPopupOrSafari) {
      api.extension.openDesktopApp();
      api.extension.closeTab();
    }
  }, [isPopupOrSafari]);

  if (isUnauthenticated) {
    return <Navigate replace to={ROUTES.VALIDATE_MASTER} />;
  }

  if (!isPopupOrSafari) {
    return null;
  }

  return (
    <PasswordPolicyContextProvider>
      <LayoutPrivate hideHeader={hideHeader}>
        <Outlet />
      </LayoutPrivate>
    </PasswordPolicyContextProvider>
  );
};
