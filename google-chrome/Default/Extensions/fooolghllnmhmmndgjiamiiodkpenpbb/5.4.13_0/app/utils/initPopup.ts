import '@common/utils/polyfills';
import '@common/utils/ydyr';
import { getSentryRewriteFrames } from '@extension/app/utils/getSentryRewriteFrames';
import { StorageApi } from '@extension/browser/storageApi';
import { Storage } from '@extension/common/constants';
import { watchSystemThemeChanges } from '@common/services/watchSystemThemeChanges';
import { initSentry } from '@extension/common/utils/sentry/initSentry';
import { logUncaughtErrorsToIndexedDb } from '~/communicationService/common/services/logging/logUncaughtErrorsToIndexedDb';
import { LogSource } from '~/communicationService/common/services/logging/contracts';
import { ErrorLoggingSource } from '../../../../configs/shared/constants';

export const initPopup = () => {
  if (process.env.ERROR_LOGGING_SOURCE === ErrorLoggingSource.AllAppParts) {
    logUncaughtErrorsToIndexedDb(LogSource.ExtensionPopup);
  }

  if (process.env.NODE_ENV === 'production') {
    (async () => {
      const result = await StorageApi.get({ [Storage.DesktopVersion]: 'unknown' });
      initSentry({
        integrations: [getSentryRewriteFrames()],
        scopeTags: [
          ['desktop_version', result[Storage.DesktopVersion]],
        ],
      });
    })();
  }

  watchSystemThemeChanges();
};
