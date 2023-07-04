import { useEffect } from 'react';
import { Image } from '@nord/ui';
import { useIntl } from 'react-intl';
import { useAppTheme } from '@extension/app/hooks/useAppTheme';
import { SECOND } from '@common/constants/time';
import disabledLightIcon from '@icons/40/disabled-light.svg';
import disabledDarkIcon from '@icons/40/disabled-dark.svg';
import enabledLightIcon from '@icons/40/enabled-light.svg';
import enabledDarkIcon from '@icons/40/enabled-dark.svg';
import { SwitcherType, SwitchContext } from '@extension/content/autofillSwitcher/Dialog';
import { api } from '@extension/app/api';

const getIcon = (isDarkTheme: boolean, isEnabled: boolean) => {
  if (isEnabled) {
    return isDarkTheme ? enabledDarkIcon : enabledLightIcon;
  }

  return isDarkTheme ? disabledDarkIcon : disabledLightIcon;
};

export const DialogBody = () => {
  const { formatMessage } = useIntl();
  const { isDarkTheme } = useAppTheme();
  const searchParams = new URLSearchParams(window.location.search);
  const isAutofillEnabled = searchParams.get('type') === SwitcherType.Enable;
  const impactArea = searchParams.get('context') as SwitchContext;
  const isPage = impactArea === SwitchContext.Page;

  useEffect(() => {
    setTimeout(api.extension.closeAutofillSwitcherDialog, 3 * SECOND);
  }, []);

  return (
    <div
      role="presentation"
      className="flex p-6 bg-primary color-primary-accent-6"
      onClick={api.extension.closeAutofillSwitcherDialog}
    >
      <div className="mr-3 flex">
        <span className="rounded-full item-image-32px flex items-center justify-center">
          <Image noLazy src={getIcon(isDarkTheme, isAutofillEnabled)} />
        </span>
      </div>
      <div className="w-full text-small">
        <p className="font-bold">
          {isAutofillEnabled && formatMessage({ id: 'autofillIsTurnedOn' })}
          {!isAutofillEnabled && !isPage && formatMessage({ id: 'weWontAutofillOnThisField' })}
          {!isAutofillEnabled && isPage && formatMessage({ id: 'weWontAutofillOnThisPage' })}
        </p>
        <p>
          {isAutofillEnabled && isPage && formatMessage({ id: 'weWillNowAutofillYourDetailsOnThisPage' })}
          {isAutofillEnabled && !isPage && formatMessage({ id: 'weWillNowAutofillYourDetailsOnThisField' })}
          {!isAutofillEnabled && formatMessage({ id: 'youCanTurnItBackOnAtAnyTime' })}
        </p>
      </div>
    </div>
  );
};
