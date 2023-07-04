import { memo, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { SvgIcon } from '@common/components/SvgIcon';
import { Link } from '@nordpass/ui';
import connectionIcon from '@icons/64/connection.svg';
import { AuthContext } from '@extension/app/context/AuthContext';
import { api } from '@extension/app/api';
import { Metric, MetricType } from '@common/constants/metrics';
import { sendMetric } from '@common/utils/sendMetric';

export const OfflineModeOverlay = memo(() => {
  const { email } = useContext(AuthContext);

  const handleLogout = () => {
    sendMetric(api, Metric.Logout, MetricType.Intent);
    api.extension.logoutAll();
  };

  return (
    <div className="flex flex-1 justify-center items-center flex-col text-center px-4 color-primary">
      <div className="flex justify-center flex-col items-center flex-1">
        <SvgIcon
          src={connectionIcon}
          width={64}
          height={64}
          className="mb-4"
        />
        <p className="text-h2 font-bold mb-1"><FormattedMessage id="offlineScreenYouAreOffline" /></p>
        <p><FormattedMessage id="offlineScreenYouAreOfflineDescription" /></p>
      </div>
      <div className="my-8 flex justify-center items-center flex-col text-base">
        <p className="break-word truncate-2-lines"><FormattedMessage id="loggedInWith" />{` ${email}`}</p>
        <Link rank="primary" onClick={handleLogout}>
          <FormattedMessage id="logOut" />
        </Link>
      </div>
    </div>
  );
});
