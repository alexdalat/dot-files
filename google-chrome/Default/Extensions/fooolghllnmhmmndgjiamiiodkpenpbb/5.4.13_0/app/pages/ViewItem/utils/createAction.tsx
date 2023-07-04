import { FormattedMessage } from 'react-intl';
import { ReactNode } from 'react';
import { IAction } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { ActionType } from '@extension/app/pages/ViewItem/constants/constants/ActionType';
import { ItemAccessAction, UserAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { debounce } from '@common/utils/debounce';
import { Platform } from '@common/constants';
import { noOp } from '@common/constants/function';
import { permittedCopyWithFeedback } from '@extension/app/components/VaultList/VaultListUtils';
import { openInNewTab } from '@extension/common/utils/openInNewTab';

interface ICommon {
  actionId: string;
  trackingAction?: {
    action: UserAction;
    firstSession?: boolean;
  };
}

interface ICreateCopyActionParams extends ICommon {
  value?: string;
  itemUuid: string;
  actionMessage?: ReactNode;
  isLimitedAccess?: boolean;
  actionText: ReactNode;
}

const logCopyAction = debounce((itemUuid: string) => api.action.saveItemAction(
  ItemAccessAction.ItemCopied,
  [itemUuid],
  Platform.Extension,
), 200);

const logItemViewSecretAction = (itemUuid: string) => api.action.saveItemAction(
  ItemAccessAction.ItemSecretViewed,
  [itemUuid],
  Platform.Extension,
);

export const createCopyAction = ({
  actionId,
  value,
  actionMessage,
  isLimitedAccess,
  trackingAction,
  itemUuid,
  actionText,
}: ICreateCopyActionParams): IAction => ({
  action: ActionType.Copy,
  actionMessage: isLimitedAccess ? <FormattedMessage id="limitedRightsToView" /> : actionMessage || <FormattedMessage id="copy" />,
  actionId,
  onClick: async () => {
    await permittedCopyWithFeedback(value || '', actionText);
    if (trackingAction) {
      api.action.save(trackingAction.action, { firstSession: trackingAction.firstSession }).catch(noOp);
    }

    logCopyAction(itemUuid);
  },
  disabled: isLimitedAccess,
});

interface ICreateLaunchActionParams extends ICommon {
  url: string;
}

export const createLaunchAction = ({
  actionId,
  url,
  trackingAction,
}: ICreateLaunchActionParams): IAction => ({
  action: ActionType.Launch,
  actionMessage: <FormattedMessage id="launchWebsite" />,
  actionId,
  onClick: () => {
    if (trackingAction) {
      api.action.save(trackingAction.action, { firstSession: trackingAction.firstSession }).catch(noOp);
    }
    return openInNewTab(url.startsWith('http') ? url : `https://${url}`);
  },
});

interface ICreateShowHideActionParams extends ICommon {
  value: string | boolean;
  onClick: () => void;
  isLimitedAccess?: boolean;
  itemUuid: string;
}

export const createShowHideAction = ({
  actionId,
  value,
  onClick,
  itemUuid,
  isLimitedAccess,
}: ICreateShowHideActionParams): IAction => {
  const fullAccessActionText = value ? <FormattedMessage id="hide" /> : <FormattedMessage id="show" />;
  const handleClick = () => {
    if (!value) {
      logItemViewSecretAction(itemUuid);
    }

    onClick();
  };

  return {
    action: value ? ActionType.Hide : ActionType.Show,
    actionMessage: isLimitedAccess ? <FormattedMessage id="limitedRightsToView" /> : fullAccessActionText,
    actionId,
    onClick: handleClick,
    disabled: isLimitedAccess,
  };
};
