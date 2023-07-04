import { FeatureFlag } from '@common/constants/featureFlag';
import { useOrganizationContext } from '@extension/app/context/OrganizationContext';
import { isB2BTrialBannerVisible } from '@common/utils/isB2BTrialBannerVisible/isB2BTrialBannerVisible';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';

export const useB2BTrialBanner = () => {
  const isFeatureFlagEnabled = useExtensionFeature(FeatureFlag.B2bUpsellWebTrialInApp);
  const { isBusiness } = useUserStatus();
  const { organizationData } = useOrganizationContext();
  const organizationType = organizationData?.organization?.type;
  const organizationUserRole = organizationData?.organization_user?.role;

  return isB2BTrialBannerVisible({
    isFeatureFlagEnabled,
    isBusiness,
    organizationType,
    organizationUserRole,
  });
};
