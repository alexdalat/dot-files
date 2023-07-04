import { ExtensionAction } from '@common/constants/action';
import { EmailLinks } from '@common/constants/email';
import { api, sendMessage } from '@extension/app/api';
import { LogoIconByTheme, IconType } from '@extension/app/components/LogoIconByTheme';
import { BrowserApi } from '@extension/browser/browserApi';
import { closePopup } from '@extension/app/utils/closePopup';
import { Button, Link } from '@nordpass/ui';
import { ReactNode, Suspense, lazy } from 'react';

const DownloadLogsButton = lazy(() =>
  process.env.ERROR_LOGGING_SOURCE &&
  import('@common/components/DownloadLogsButton').then(({ DownloadLogsButton }) => ({ default: DownloadLogsButton })),
);

interface IErrorScreen {
  title?: ReactNode;
  description?: ReactNode;
  button?: ReactNode;
}

const defaultDescription = (
  <>
    Please restart the app. If problem persists, please contact
    <Link
      rank="primary"
      className="ml-1"
      onClick={() => sendMessage(ExtensionAction.OpenMailLink, { url: EmailLinks.Support })}
    >
      Support.
    </Link>
  </>
);

export const ErrorScreen = ({ title, description, button }: IErrorScreen) => (
  <div className="flex flex-col justify-center items-center h-screen bg-primary">
    <div
      className="is-popup flex flex-col h-screen text-center color-primary leading-normal text-small font-medium overflow-y-auto relative"
    >
      <div className="mb-4 mt-20">
        <LogoIconByTheme type={IconType.Warning} />
      </div>
      <div className="flex-1 p-8 w-full max-w-500px mx-auto flex flex-col">
        <h3 className="text-h3 leading-normal tracking-tight font-bold mb-4">
          {title ?? 'Something went wrong'}
        </h3>
        <p className="text-small leading-normal mb-12">
          {description ?? defaultDescription}
        </p>
        <Button
          className="w-full font-bold text-base"
          rank="primary"
          onClick={() => {
            window.location.assign('#');
            BrowserApi.reload();
          }}
        >
          {button ?? 'Restart App'}
        </Button>
        {process.env.ERROR_LOGGING_SOURCE && (
          <Suspense fallback={null}>
            <DownloadLogsButton
              className="mt-2 font-bold text-base"
              onClick={async () => {
                await api.extension.downloadLogs();
                closePopup();
              }}
            />
          </Suspense>
        )}
      </div>
    </div>
  </div>
);
