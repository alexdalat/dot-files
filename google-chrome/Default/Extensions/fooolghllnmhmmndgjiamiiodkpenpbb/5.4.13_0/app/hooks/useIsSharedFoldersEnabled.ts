import { OrganizationTier } from '@common/constants/organization';
import { useOrganizationContext } from '../context/OrganizationContext';

export const useIsSharedFoldersEnabled = () => {
  const { organizationData } = useOrganizationContext();

  return organizationData?.organization?.tier === OrganizationTier.Enterprise;
};
