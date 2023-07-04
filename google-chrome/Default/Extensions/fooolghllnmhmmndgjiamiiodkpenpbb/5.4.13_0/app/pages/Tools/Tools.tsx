import { FeatureFlag } from '@common/constants/featureFlag';
import { noOp } from '@common/constants/function';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ROUTES } from '@extension/common/constants/routes';
import { getOs } from '@common/services/getOs';
import { ToolsItem } from '@extension/app/pages/Tools/components/ToolsItem/ToolsItem';
import { AuthContext } from '@extension/app/context/AuthContext';
import { api } from '@extension/app/api';
import { history } from '@extension/app/utils/history';
import { PageHeader } from '@extension/app/pages/components/PageHeader/PageHeader';
import { Metric, MetricType } from '@common/constants/metrics';
import { RemoteURL } from '@common/constants/remoteURL';
import { sendMetric } from '@common/utils/sendMetric';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import passwordGeneratorIcon from '@icons/password-generator.svg';
import passwordHealthIcon from '@icons/password-health.svg';
import breachScannerIcon from '@icons/breach-scanner-partial.svg';
import emergencyAccessIcon from '@icons/emergency-access.svg';
import nordVpnIcon from '@icons/32/nord-vpn.svg';
import nordLockerIcon from '@icons/32/nord-locker.svg';
import { UserAction } from '@common/constants/userAction';

export const Tools = () => {
  const { formatMessage } = useIntl();
  const { subscriptionData } = useContext(AuthContext);
  const platform = getOs()?.toLowerCase();
  const isEmergencyAccessEnabled = useExtensionFeature(FeatureFlag.EmergencyAccess);

  return (
    <>
      <PageHeader title={<FormattedMessage id="tools" />} />

      <div className="flex-1 px-4 pt-0 pb-2 bg-primary">
        <ToolsItem
          title={formatMessage({ id: 'passwordGenerator' })}
          description={formatMessage({ id: 'passwordGeneratorDescription' })}
          iconPath={passwordGeneratorIcon}
          onClick={() => {
            api.action.save(UserAction.TapExtensionPasswordGenerator);
            history.push(ROUTES.GENERATE_PASSWORD);
          }}
        />

        <ToolsItem
          title={formatMessage({ id: 'passwordHealth' })}
          description={formatMessage({ id: 'passwordHealthDescription' })}
          iconPath={passwordHealthIcon}
          onClick={() => {
            api.action.save(UserAction.PasswordHealthExtension).catch(noOp);
            api.extension.openDesktopApp({
              route: 'PASSWORD_HEALTH',
            });
          }}
        />

        <ToolsItem
          title={formatMessage({ id: 'breachScanner' })}
          description={formatMessage({ id: 'breachScannerDescription' })}
          iconPath={breachScannerIcon}
          onClick={() => {
            api.action.save(UserAction.BreachReportExtension).catch(noOp);
            api.extension.openDesktopApp({
              route: 'DATA_BREACH',
            });
          }}
        />

        {isEmergencyAccessEnabled && !subscriptionData?.isBusiness && (
          <ToolsItem
            title={formatMessage({ id: 'emergencyAccess' })}
            description={formatMessage({ id: 'emergencyAccessDescription' })}
            iconPath={emergencyAccessIcon}
            onClick={() => {
              sendMetric(api, Metric.EmergencyAccessView, MetricType.Intent);
              api.extension.openDesktopApp({
                route: 'EMERGENCY_ACCESS',
              });
              api.action.save(UserAction.EmergencyAccess).catch(noOp);
            }}
          />
        )}

        <div className="font-bold mb-2 mt-3 color-primary"><FormattedMessage id="tryOtherNordApps" /></div>

        <ToolsItem
          title="NordVPN"
          description={formatMessage({ id: 'nordVpnDescription' })}
          iconPath={nordVpnIcon}
          onClick={() => {
            if (platform) {
              openInNewTab(RemoteURL.NordVPN);
            }
          }}
        />

        <ToolsItem
          title="NordLocker"
          description={formatMessage({ id: 'nordLockerDescription' })}
          iconPath={nordLockerIcon}
          onClick={() => {
            if (platform) {
              openInNewTab(RemoteURL.NordLocker);
            }
          }}
        />
      </div>
    </>
  );
};
