import { useEffect, useState } from 'react';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { AppTheme } from '@common/constants/appTheme';

export const useAppTheme = () => {
  const [appTheme, setAppTheme] = useState<AppTheme>(AppTheme.Light);

  useEffect(() => {
    (async () => {
      const { appTheme } = await StorageApi.get({ [Storage.AppTheme]: null });
      setAppTheme(appTheme);
    })();
  }, []);

  return {
    appTheme,
    isDarkTheme: appTheme === AppTheme.Dark,
    isLightTheme: appTheme === AppTheme.Light,
    isSystemTheme: appTheme === AppTheme.System,
  };
};
