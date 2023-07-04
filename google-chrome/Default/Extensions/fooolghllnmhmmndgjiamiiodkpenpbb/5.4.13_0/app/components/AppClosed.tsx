import { isSafari } from '@common/utils/isSafari';
import { Button, Link } from '@nordpass/ui';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@extension/common/constants/routes';
import { ROUTES as DESKTOP_ROUTES } from '@common/constants/routes';
import { LogoIconByTheme } from './LogoIconByTheme';
import { api } from '../api';
import { closePopup } from '../utils/closePopup';

export const AppClosed = () => {
  const navigate = useNavigate();

  const onDownloadAppClick = () => {
    navigate(ROUTES.DOWNLOAD_APP, { replace: true });
  };

  const onOpenNordpassClick = () => {
    api.extension.openApp({ url: DESKTOP_ROUTES.VAULT });
    closePopup({ legacySafariPopupClose: api.extension.closePopup });
  };

  return (
    <div className="flex flex-col justify-center items-center color-primary leading-normal text-small font-medium h-screen bg-primary">
      <div className="is-popup flex flex-col h-screen text-center page-slide-in overflow-y-auto relative rounded-1 shadow-3">
        <div className="mt-20">
          <LogoIconByTheme />
        </div>

        <div className="flex-1 flex flex-col px-8 pb-6 pt-19 w-full max-w-500px mx-auto">
          <span className="mb-6">
            <FormattedMessage id="openNordPassToStart" />
          </span>

          <Button
            className="w-full text-base font-bold"
            rank="primary"
            onClick={() => onOpenNordpassClick()}
          >
            <FormattedMessage id="openNordPass" />
          </Button>

          {!isSafari && (
            <span className="mt-auto">
              <FormattedMessage id="dontHaveAppQuestion" />
              <Link className="ml-1" onClick={onDownloadAppClick}>
                <FormattedMessage id="download" />
              </Link>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
