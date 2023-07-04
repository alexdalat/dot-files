import { LogLevel, TLogMessage } from '@common/services/loggingFactory/contracts';
import { isStandaloneExtension } from '@common/utils/platformEnv';
import { isSafari } from '@common/utils/isSafari';
import { api } from '@extension/app/api';
import { Browser, Tabs } from 'webextension-polyfill';
import { InternalAction } from '@common/constants/action';
import Tab = Tabs.Tab;

let browser: Browser;
if (!isSafari || isStandaloneExtension) {
  // eslint-disable-next-line global-require
  browser = require('webextension-polyfill');
}

export const upgradeToPremiumExtension = async (
  url: string,
  openExternal: (url: string) => (Promise<void | Tab> | void),
  logMessage: TLogMessage,
  logMessageText: string,
) => {
  if (isStandaloneExtension && isSafari) {
    browser.runtime.sendMessage({ type: InternalAction.SendSubscriptionPlans });
  } else {
    api.user.getTrustedPassUrl(url)
      .then(openExternal)
      .catch((error: Error) => {
        logMessage(LogLevel.Error, logMessageText, error);
      });
  }
};
