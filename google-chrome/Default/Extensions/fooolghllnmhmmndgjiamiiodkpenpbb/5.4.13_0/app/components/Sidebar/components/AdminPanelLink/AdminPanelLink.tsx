import { FormattedMessage, useIntl } from 'react-intl';
import { Environment } from '@common/constants/environment';
import { RemoteURL } from '@common/constants/remoteURL';
import { NavButton } from '@common/components/NavButton/NavButton';
import { getIsAdminOrOwner } from '@common/utils/getIsAdminOrOwner';
import { useOrganizationContext } from '@extension/app/context/OrganizationContext';
import { useEnvironment } from '@extension/app/hooks/useEnvironment';

export const AdminPanelLink = () => {
  const { locale } = useIntl();
  const environment = useEnvironment();
  const ecpUrl = `${environment === Environment.Staging ? RemoteURL.StagingECP : RemoteURL.ECP}/${locale}`;
  const { organizationData } = useOrganizationContext();
  const organizationUserRole = organizationData?.organization_user?.role;
  const isAdminPanelLinkVisible = getIsAdminOrOwner(organizationUserRole);

  if (!isAdminPanelLinkVisible) {
    return null;
  }

  return (
    <NavButton url={ecpUrl}>
      <FormattedMessage id="openAdminPanel" />
    </NavButton>
  );
};
