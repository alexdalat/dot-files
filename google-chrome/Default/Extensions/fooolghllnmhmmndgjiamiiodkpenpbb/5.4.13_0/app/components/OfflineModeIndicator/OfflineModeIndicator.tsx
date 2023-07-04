import { memo, useRef } from 'react';
import { Link, useNordPassUI } from '@nordpass/ui';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';
import './OfflineModeIndicator.scss';
import { api } from '@extension/app/api';
import { useOnlineStatus } from '@extension/app/hooks/useOnlineStatus';
import offlineIcon from '@icons/16/offline.svg';
import onlineIcon from '@icons/16/online.svg';

interface IOfflineModeIndicatorProps {
  isBusiness: boolean;
}

export const OfflineModeIndicator = memo(({ isBusiness }: IOfflineModeIndicatorProps) => {
  const { isOnline, isBackOnline } = useOnlineStatus();
  const containerRef = useRef<HTMLDivElement>(null);
  useNordPassUI('dark', {}, containerRef);

  if (
    isOnline === null ||
    (isOnline && !isBackOnline) ||
    (!isOnline && isBusiness)
  ) {
    return null;
  }

  const modeIcon = isOnline ? (
    <img
      alt="online"
      src={onlineIcon}
      className="w-12px h-12px mr-2"
      data-testid="online-icon"
    />
  ) : (
    <img
      alt="offline"
      src={offlineIcon}
      className="w-12px h-12px mr-2"
      data-testid="offline-icon"
    />
  );
  const modeText = isOnline ? <FormattedMessage id="youAreBackOnline" /> : <FormattedMessage id="youAreOffline" />;

  return (
    <div
      className={cx('mode-indicator text-white sticky py-3 alert-fade-in w-full flex items-center justify-center z-9999', isOnline ? 'mode-indicator--online' : 'bg-black')}
      ref={containerRef}
      data-testid="offline-indicator"
    >
      {modeIcon}
      <p className="text-micro leading-normal">
        {modeText}
      </p>
      {!isOnline && (
        <Link
          underline
          rank="secondary"
          className="text-micro ml-1"
          data-testid="refresh-button"
          onClick={api.app.checkOnlineStatus}
        >
          <FormattedMessage id="refresh" />
        </Link>
      )}
    </div>
  );
});
