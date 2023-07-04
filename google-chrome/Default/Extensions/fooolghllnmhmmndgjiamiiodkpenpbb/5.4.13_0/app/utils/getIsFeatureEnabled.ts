import { FeatureFlag } from '@common/constants/featureFlag';
import { IFeatureFlag } from '@common/store/reducers/featuresReducer/featuresConstants';
import { getFeature, getFeatureDates, getIsFeatureEnabled } from '@common/utils/featureUtils';
import { Storage, ListenerType } from '@extension/common/constants';
import { StorageApi } from '@extension/browser/storageApi';
import { createListener } from '@extension/app/api/createListener';
import { useEffect, useState } from 'react';

const getIsV2FeatureArray = (features: Array<FeatureFlag> | Array<IFeatureFlag>): features is Array<FeatureFlag> =>
  (features as Array<FeatureFlag>).every(identifier => typeof identifier === 'string');

// for compatibility with Feature Toggles API v2
const getExtensionFeatures = (features: Array<IFeatureFlag> | Array<FeatureFlag>) => {
  if (getIsV2FeatureArray(features)) {
    return features.map(item => ({
      startDate: null,
      endDate: null,
      identifier: <FeatureFlag>item,
    } satisfies IFeatureFlag));
  }

  return features;
};

export const getIsExtensionFeatureEnabled = async (feature: FeatureFlag) => {
  const { features = [] } = await StorageApi.get({ [Storage.Features]: [] });
  const extensionFeatures = getExtensionFeatures(features);

  return getIsFeatureEnabled(extensionFeatures as Array<IFeatureFlag>, feature);
};

export const useExtensionFeature = (feature: FeatureFlag) => {
  const [isEnabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkStorageFeatures = async (changes: Record<string, any>) => {
      const newFeatures = changes[Storage.Features]?.newValue;

      if (Array.isArray(newFeatures)) {
        setEnabled(getIsFeatureEnabled(newFeatures, feature));
      }
    };

    return createListener(checkStorageFeatures, ListenerType.StorageChange);
  }, [feature]);

  useEffect(() => {
    getIsExtensionFeatureEnabled(feature).then(setEnabled);
  }, [feature]);

  return isEnabled;
};

export const useExtensionFeatureDates = (identifier: FeatureFlag) => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    StorageApi.get({ [Storage.Features]: [] })
      .then(({ features = [] }) => setFeatures(features));
  }, []);

  const extensionFeatures = getExtensionFeatures(features) as Array<IFeatureFlag>;
  const feature = getFeature(extensionFeatures, identifier);
  const isEnabled = getIsFeatureEnabled(extensionFeatures, identifier);

  if (feature && isEnabled) {
    return getFeatureDates(feature);
  }

  return null;
};
