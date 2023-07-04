import { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { IPasswordItem } from '@common/contracts/contracts';
import { UserAction } from '@common/constants/userAction';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { copySecret, permittedCopyWithFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { useDebouncedCopyActionLogger } from '@common/hooks/useDebouncedCopyActionLogger/useDebouncedCopyActionLogger';
import { api } from '@extension/app/api';
import { noOp } from '@common/constants/function';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import { CommonContextMenu } from './CommonContextMenu';

interface IPasswordItemContextMenu {
  item: IPasswordItem;
}

export const PasswordContextMenu = memo(({ item }: IPasswordItemContextMenu) => {
  const isCopyPasswordEnabled = item.secret !== '0' && !isLimitedAccess(item.acl);
  const logCopyAction = useDebouncedCopyActionLogger(api.action, item.uuid);

  const copyPassword = () => {
    logCopyAction();
    api.action.save(UserAction.TapCopyPasswordFromItem).catch(noOp);
    copySecret(item.uuid, <FormattedMessage id="passwordCopied" />);
  };

  const config = [
    {
      isActive: !!item.username,
      component: () => (
        <MenuItem
          key="copy-username"
          onClick={() => {
            permittedCopyWithFeedback(item.username as string, <FormattedMessage id="emailOrUserNameCopied" />);
            api.action.save(UserAction.TapCopyUsernameFromItem).catch(noOp);
            logCopyAction();
          }}
        >
          <FormattedMessage id="copyEmailUsername" />
        </MenuItem>
      ),
    },
    {
      isActive: isCopyPasswordEnabled,
      component: () => (
        <MenuItem
          key="coppy-password"
          onClick={copyPassword}
        >
          <FormattedMessage id="copyPassword" />
        </MenuItem>
      ),
    },
    {
      isActive: !!item.note,
      component: () => (
        <MenuItem
          key="copy-note"
          onClick={() => {
            logCopyAction();
            permittedCopyWithFeedback(item.note as string, <FormattedMessage id="noteCopied" />);
          }}
        >
          <FormattedMessage id="copyNote" />
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
