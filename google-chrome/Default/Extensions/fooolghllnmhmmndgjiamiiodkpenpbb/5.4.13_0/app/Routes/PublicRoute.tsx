import { memo, useContext } from 'react';
import { Navigate, Outlet, useLocation, useMatch, PathRouteProps } from 'react-router-dom';
import { ROUTES } from '@extension/common/constants/routes';
import { AuthContext } from '@extension/app/context/AuthContext';
import { LayoutPublic } from '@extension/app/layouts/LayoutPublic';
import { AuthState } from '@common/store/reducers/authReducer/authConstants';
import { getLastPage, setLastPage } from './lastPage';

interface IMemoPublicRoute extends PathRouteProps {
  authState: AuthState;
  simpleLayout: boolean;
}

const MemoPublicRoute = memo(({ children, authState, simpleLayout }: IMemoPublicRoute) => {
  const { pathname } = useLocation();
  const match = useMatch(pathname);

  if (authState === AuthState.Authenticated) {
    const page = getLastPage() || ROUTES.VAULT;
    setLastPage(null);

    return <Navigate replace to={page} />;
  }

  if (
    authState === AuthState.MasterValidate &&
    match?.pathname &&
    ![ROUTES.VALIDATE_MASTER, ROUTES.MP_SWITCH_ACCOUNT].includes(match.pathname)
  ) {
    return <Navigate replace to={ROUTES.VALIDATE_MASTER} />;
  }

  return <LayoutPublic simpleLayout={simpleLayout}>{children}</LayoutPublic>;
});

interface IPublicRoute extends PathRouteProps {
  simpleLayout?: boolean;
}

export const PublicRoute = ({ simpleLayout = false }: IPublicRoute) => {
  const { authState } = useContext(AuthContext);

  return (
    <MemoPublicRoute authState={authState} simpleLayout={simpleLayout}>
      <Outlet />
    </MemoPublicRoute>
  );
};
