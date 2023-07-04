import { NavLink, NavLinkProps, To, useLocation } from 'react-router-dom';

interface IVaultLink extends Omit<NavLinkProps, 'to'> {
  to?: To;
  path?: string;
  search?: string | null;
}

export const VaultLink = ({
  to,
  path,
  search = null,
  children,
  ...rest
}: IVaultLink) => {
  const location = useLocation();
  return (
    <NavLink
      {...rest}
      to={to ?? {
        pathname: path || location.pathname,
        search: search || location.search,
      }}
    >
      {children}
    </NavLink>
  );
};
