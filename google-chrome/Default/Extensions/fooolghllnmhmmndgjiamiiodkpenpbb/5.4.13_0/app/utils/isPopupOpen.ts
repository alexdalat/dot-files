import { isSafari } from '@common/utils/isSafari';
import { Browser } from 'webextension-polyfill';
import { isStandaloneExtension } from '@common/utils/platformEnv';

const shouldUseExtensionApiPolyfill = !isSafari || isStandaloneExtension;

let browser: Browser;
if (shouldUseExtensionApiPolyfill) {
  // eslint-disable-next-line global-require
  browser = require('webextension-polyfill');
}

export const isPopupOpen = () => {
  if (shouldUseExtensionApiPolyfill) {
    return !!browser.extension.getViews({ type: 'popup' }).length;
  }
  return false;
};

export const getPopups = () => {
  if (shouldUseExtensionApiPolyfill) {
    return browser.extension.getViews({ type: 'popup' });
  }
  return [];
};
