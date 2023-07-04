import { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { getSecret } from '@extension/app/api/VaultApi';
import { ICreditCardItem } from '@common/contracts/contracts';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { copyWithFeedback, permittedCopyWithFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { useDebouncedCopyActionLogger } from '@common/hooks/useDebouncedCopyActionLogger/useDebouncedCopyActionLogger';
import { api } from '@extension/app/api';
import { withCopyPermissions } from '@common/utils/withPermissions';
import { logMessage } from '@extension/common/utils/log/logMessage';
import { UserAction } from '@common/constants/userAction';
import { noOp } from '@common/constants/function';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import { CommonContextMenu } from './CommonContextMenu';

interface ICreditCardContextMenu {
  item: ICreditCardItem;
}

export const CreditCardContextMenu = memo(({ item }: ICreditCardContextMenu) => {
  const isAccessLimited = isLimitedAccess(item.acl);

  const logCopyAction = useDebouncedCopyActionLogger(api.action, item.uuid);

  const copyCardNumber = () => {
    api.action.save(UserAction.TapCopyValueFromCC).catch(noOp);
    logCopyAction();
    withCopyPermissions(async () => {
      const secret = await getSecret(item.uuid);
      copyWithFeedback(secret.card_number, <FormattedMessage id="cardNumberCopied" />);
    }, logMessage, 'copyCardNumber');
  };

  const copyCVC = () => {
    api.action.save(UserAction.TapCopyValueFromCC).catch(noOp);
    logCopyAction();
    withCopyPermissions(async () => {
      const secret = await getSecret(item.uuid);
      copyWithFeedback(secret.cvc, <FormattedMessage id="cvvCopied" />);
    }, logMessage, 'copyCVC');
  };

  const copyCardHolderName = async () => {
    api.action.save(UserAction.TapCopyValueFromCC).catch(noOp);
    logCopyAction();
    permittedCopyWithFeedback(item.cardholder_name as string, <FormattedMessage id="cardHolderNameCopied" />);
  };

  const config = [
    {
      isActive: !!item.cardholder_name,
      component: () => (
        <MenuItem key="copy-cardName" onClick={copyCardHolderName}>
          <FormattedMessage id="copyCardholderName" />
        </MenuItem>
      ),
    },
    {
      isActive: !!item.card_number,
      component: () => (
        <MenuItem key="copy-cardNumber" onClick={copyCardNumber}>
          <FormattedMessage id="copyCardNumber" />
        </MenuItem>
      ),
    },
    {
      isActive: item.cvc === '1' && !isAccessLimited,
      component: () => (
        <MenuItem key="copy-cvv" onClick={copyCVC}>
          <FormattedMessage id="copyCvvCvc" />
        </MenuItem>
      ),
    },
  ];

  return (
    <CommonContextMenu
      item={item}
      additionalActionsConfig={config}
    />
  );
});
