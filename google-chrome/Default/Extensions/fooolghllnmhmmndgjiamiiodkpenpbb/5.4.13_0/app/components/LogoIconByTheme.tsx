import { useEffect, useState } from 'react';
import { Image } from '@nord/ui';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage, ListenerType } from '@extension/common/constants';
import { AppTheme } from '@common/constants/appTheme';
import { createListener } from '@extension/app/api/createListener';
import { useIsMountedRef } from '@common/hooks/useIsMountedRef';
import logoDark from '@icons/nordpass-logo-dark.svg';
import logoLight from '@icons/nordpass-logo-light.svg';
import logoDarkWarning from '@icons/nordpass-logo-dark-warning.svg';
import logoLightWarning from '@icons/nordpass-logo-light-warning.svg';

export enum IconType {
  Generic,
  Warning,
}

interface ILogoIcon {
  type?: IconType;
}

export const LogoIconByTheme = ({ type = IconType.Generic }: ILogoIcon) => {
  const [appTheme, setAppTheme] = useState<AppTheme>(AppTheme.Light);
  const logoClassName = 'mx-auto item-image-80px';

  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    StorageApi.get({ [Storage.AppTheme]: null }).then(result => {
      const newAppTheme = result[Storage.AppTheme];
      if (isMountedRef.current && newAppTheme) {
        setAppTheme(newAppTheme);
      }
    });

    const handleThemeChange = async (changes: Record<string, any>) => {
      if (changes[Storage.AppTheme] && isMountedRef.current) {
        setAppTheme(changes[Storage.AppTheme].newValue);
      }
    };
    return createListener(handleThemeChange, ListenerType.StorageChange);
  }, [isMountedRef]);

  const isDarkTheme = appTheme === AppTheme.Dark;

  switch (type) {
    case IconType.Warning:
      return isDarkTheme ?
        <Image noLazy className={logoClassName} src={logoDarkWarning} /> :
        <Image noLazy className={logoClassName} src={logoLightWarning} />;
    default:
      return isDarkTheme ?
        <Image noLazy className={logoClassName} src={logoDark} /> :
        <Image noLazy className={logoClassName} src={logoLight} />;
  }
};
