import { StorageApi } from '@extension/browser/storageApi';
import { ListenerType, Storage } from '@extension/common/constants';
import { createListener } from '@extension/app/api/createListener';
import { useEffect } from 'react';
import { addThemeClassNameToHtmlElement, getThemeClassName } from '@common/utils/themeUtils';

export const useAppThemeChangeListener = () => {
  (async () => {
    const { appTheme } = await StorageApi.get({ [Storage.AppTheme]: null });

    addThemeClassNameToHtmlElement(getThemeClassName(appTheme));
  })();

  const handleAppThemeChange = (changes: Record<string, any>) => {
    if (changes[Storage.AppTheme]) {
      const theme = changes[Storage.AppTheme].newValue;
      addThemeClassNameToHtmlElement(getThemeClassName(theme));
    }
  };

  useEffect(() => createListener(handleAppThemeChange, ListenerType.StorageChange), []);
};
