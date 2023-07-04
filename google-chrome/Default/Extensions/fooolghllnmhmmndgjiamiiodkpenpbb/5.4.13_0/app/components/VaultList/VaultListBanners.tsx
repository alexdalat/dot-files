import { CURRENT_SALE_RIBBON_FEATURE_FLAG } from '@common/constants/sale';
import { CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { StandaloneBanner } from '@extension/app/components/Banners/StandaloneBanner/StandaloneBanner';
import { Rating } from '@extension/app/components/Banners/Rating/Rating';
import { SaleBanner } from '@extension/app/components/Banners/SaleBanner/SaleBanner';
import { PremiumBanner } from '@extension/app/components/Banners/PremiumBanner/PremiumBanner';
import { B2BTrialBanner } from '@extension/app/components/Banners/B2BTrialBanner/B2BTrialBanner';
import { useUpdateBanner } from '@extension/app/hooks/useUpdateBanner';
import { useUserStatus } from '@extension/app/hooks/useUserStatus';
import { useB2BTrialBanner } from '@extension/app/hooks/useB2BTrialBanner';
import { getIsAllItemsLinkActive } from '@common/utils/itemLinksActivity';
import { useExtensionFeature, useExtensionFeatureDates } from '@extension/app/utils/getIsFeatureEnabled';
import { FeatureFlag } from '@common/constants/featureFlag';
import { useElementRect } from '@common/hooks/useElementRect';
import { IItem } from '@common/interfaces/item';

interface IVaultListBanners {
  items: Array<IItem>;
  style?: CSSProperties;
  onRectChange?: (rect: DOMRectReadOnly) => void;
}

export const VaultListBanners = ({ items, style, onRectChange }: IVaultListBanners) => {
  const { elementRef } = useElementRect({ onRectChange, keyToCompare: 'height' });
  const {
    isBannerVisible: isUpdateBannerVisible,
    disableBanner: disableUpdateBanner,
    handleSeen: handleUpdateBannerSeen,
  } = useUpdateBanner();
  const isB2BTrialBannerVisible = useB2BTrialBanner();
  const featureFlag = FeatureFlag.SpringSale2023Extension;

  const { isFreeUser, isTrial } = useUserStatus();
  const isSaleEnabled = useExtensionFeature(featureFlag);
  const featureDates = useExtensionFeatureDates(CURRENT_SALE_RIBBON_FEATURE_FLAG);
  const location = useLocation();
  const isInAllItems = getIsAllItemsLinkActive(location.pathname, location.search);
  const isSaleBannerVisible = isSaleEnabled && (featureDates ? Date.now() <= featureDates.endDate : false);
  const shouldShowBanner = items.length > 0 && (isFreeUser || isTrial) && isInAllItems;

  return (
    <li style={style}>
      <div ref={elementRef} className="flex flex-col">
        {isUpdateBannerVisible ?
          <StandaloneBanner disable={disableUpdateBanner} handleSeen={handleUpdateBannerSeen} /> :
          <Rating vaultSize={items.length} />
        }

        {shouldShowBanner && (
          <div className="relative px-4 pb-4">
            {isSaleBannerVisible ? <SaleBanner /> : <PremiumBanner />}
          </div>
        )}

        {isB2BTrialBannerVisible && (
          <div className="px-4 pb-4">
            <B2BTrialBanner />
          </div>
        )}
      </div>
    </li>
  );
};
