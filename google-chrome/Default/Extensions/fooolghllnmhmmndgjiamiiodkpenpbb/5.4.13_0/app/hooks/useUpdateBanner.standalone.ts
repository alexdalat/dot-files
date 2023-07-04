import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { api } from '@extension/app/api';
import { FeatureFlag } from '@common/constants/featureFlag';
import { proxyStore } from '@extension/browser/standalone/proxyStore';
import { UserAction } from '@common/constants/userAction';
import { getIsViableForUpdateBanner, getWasUpdateBannerSeen } from '@common/store/reducers/appReducer/appSelectors';
import { dispatchSetIsViableForUpdateBanner, dispatchSetWasUpdateBannerSeen } from '@common/store/reducers/appReducer/appDispatchers';
import { useExtensionFeature } from '../utils/getIsFeatureEnabled';

export const useUpdateBanner = () => {
  const isUpdateBannerEnabled = useExtensionFeature(FeatureFlag.StandaloneUpdate);
  const isViableToSeeBanner = useSelector(getIsViableForUpdateBanner);
  const wasBannerSeen = useSelector(getWasUpdateBannerSeen);

  const disableBanner = useCallback(() => {
    dispatchSetIsViableForUpdateBanner(proxyStore, false);
  }, []);

  const handleSeen = useCallback(() => {
    if (!wasBannerSeen) {
      api.action.save(UserAction.ExtensionStalloneBannerSeen);
      dispatchSetWasUpdateBannerSeen(proxyStore, true);
    }
  }, [wasBannerSeen]);

  return { isBannerVisible: isUpdateBannerEnabled && isViableToSeeBanner, disableBanner, handleSeen };
};
