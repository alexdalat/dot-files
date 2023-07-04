import { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { IPasskeyItem } from '@common/contracts/contracts';
import { MenuItem } from '@common/components/Menu/MenuItem';
import { permittedCopyWithFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { useDebouncedCopyActionLogger } from '@common/hooks/useDebouncedCopyActionLogger/useDebouncedCopyActionLogger';
import { api } from '@extension/app/api';
import { CommonContextMenu } from './CommonContextMenu';

interface IPasskeyContextMenu {
  item: IPasskeyItem;
}

export const PasskeyContextMenu = memo(({ item }: IPasskeyContextMenu) => {
  const logCopyAction = useDebouncedCopyActionLogger(api.action, item.uuid);

  const config = [
    {
      isActive: !!item.username,
      component: () => (
        <MenuItem
          key="copy-username"
          onClick={() => {
            permittedCopyWithFeedback(item.username as string, <FormattedMessage id="emailOrUserNameCopied" />);
            logCopyAction();
          }}
        >
          <FormattedMessage id="copyEmailUsername" />
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
