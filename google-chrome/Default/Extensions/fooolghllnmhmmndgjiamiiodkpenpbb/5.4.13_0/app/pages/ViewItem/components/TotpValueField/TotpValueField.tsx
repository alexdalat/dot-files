import { FormattedMessage, useIntl } from 'react-intl';
import { useCallback, useMemo } from 'react';
import { TotpValue } from '@common/components/TotpValue/TotpValue';
import { ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { ActionType } from '@extension/app/pages/ViewItem/constants/constants/ActionType';
import { showFeedback } from '@extension/app/components/VaultList/VaultListUtils';

export const TotpValueField = () => {
  const { formatMessage } = useIntl();

  const showUseDeviceWhereTotpWasSetUp = useCallback(() => {
    showFeedback(<FormattedMessage id="useDeviceWhereTotpWasSetUp" />);
  }, []);

  const totpActions = useMemo(() => ([
    {
      action: ActionType.Show,
      actionMessage: <FormattedMessage id="show" />,
      actionId: 'show-totp',
      onClick: showUseDeviceWhereTotpWasSetUp,
    },
    {
      action: ActionType.Copy,
      actionMessage: <FormattedMessage id="copy" />,
      actionId: 'copy-totp',
      onClick: showUseDeviceWhereTotpWasSetUp,
    },
  ]), [showUseDeviceWhereTotpWasSetUp]);

  return (
    <ViewField
      label={formatMessage({ id: 'twoFactorCode' })}
      value={<TotpValue />}
      actions={totpActions}
    />
  );
};
