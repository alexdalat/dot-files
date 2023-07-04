/* eslint-disable @typescript-eslint/naming-convention */
import styles from '@extension/app/pages/ViewItem/components/ItemTypeView/ItemTypeView.module.scss';
import { useHandleVaultChange } from '@extension/app/pages/ViewItem/hooks/useHandleVaultChange';
import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { PasswordStrengthMeter } from '@common/components/PasswordStrengthMeter/PasswordStrengthMeter';
import { IAction, ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import {
  createCopyAction,
  createLaunchAction,
  createShowHideAction,
} from '@extension/app/pages/ViewItem/utils/createAction';
import { ActionType } from '@extension/app/pages/ViewItem/constants/constants/ActionType';
import { usePasswordPolicy } from '@extension/app/context/PasswordPolicyContext';
import { getStylizedPassword } from '@common/utils/getStylizedPassword';
import { getItemSecretChanges, getSecret } from '@extension/app/api/VaultApi';
import { TotpValueField } from '@extension/app/pages/ViewItem/components/TotpValueField/TotpValueField';
import { IPasswordItem } from '@common/contracts/contracts';
import { UserAction } from '@common/constants/userAction';
import { useRefState } from '@common/hooks/useRefState';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import { ViewFieldValue } from '@extension/app/pages/ViewItem/components/ViewFieldValue/ViewFieldValue';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { FeatureFlag } from '@common/constants/featureFlag';
import { isTruthy } from '@common/utils/isTruthy';
import { ViewItemSelectableValue } from '@extension/app/pages/ViewItem/viewItemSelectableValue';
import { isValidUrl } from '@common/utils/isValidUrl';
import { ViewCustomFields } from '@extension/app/pages/ViewItem/components/ViewCustomFIelds/ViewCustomFields';
import { VaultType } from '@common/constants/vault';

interface IViewPassword {
  item: IPasswordItem;
}

export const ViewPassword = ({ item }: IViewPassword) => {
  const { formatMessage } = useIntl();
  const [showPassword, setShowPassword] = useState(false);
  const { checkWithPolicy } = usePasswordPolicy();
  const [password, setPassword] = useRefState<string>();
  const isMultipleURLsEnabled = useExtensionFeature(FeatureFlag.MultipleURLs);

  const { uuid, username, url = '', note, folder_name, acl, additional_urls: additionalUrls = [], custom_fields = [] } = item;

  const allWebsites = useMemo(
    () => [url, ...additionalUrls].filter(isTruthy),
    [additionalUrls, url],
  );

  const hasMultipleWebsites = isMultipleURLsEnabled && allWebsites.length > 1;

  const getPassword = useCallback(async () => {
    setPassword(await getSecret(uuid));
  }, [setPassword, uuid]);

  useEffect(() => {
    getPassword();
  }, [getPassword]);

  const onVaultChange = async () => setPassword(await getItemSecretChanges(uuid));
  useHandleVaultChange(item, uuid, onVaultChange);

  const usernameActions = useMemo<Array<IAction>>(
    () => [
      createCopyAction({
        itemUuid: uuid,
        actionId: 'copy-username',
        value: username,
        trackingAction: { action: UserAction.TapCopyUsernameFromItem, firstSession: false },
        actionText: <FormattedMessage id="emailOrUserNameCopied" />,
      }),
    ],
    [username, uuid],
  );

  const passwordActions = useMemo<Array<IAction>>(
    () => [
      createShowHideAction({
        itemUuid: uuid,
        actionId: `${showPassword ? ActionType.Hide : ActionType.Show}-pass`,
        value: showPassword,
        onClick: async () => setShowPassword(prev => !prev),
        isLimitedAccess: isLimitedAccess(acl),
      }),
      createCopyAction({
        itemUuid: uuid,
        actionId: 'copy-pass',
        value: password,
        isLimitedAccess: isLimitedAccess(acl),
        trackingAction: { action: UserAction.TapCopyPasswordFromItem, firstSession: false },
        actionText: <FormattedMessage id="passwordCopied" />,
      }),
    ],
    [showPassword, acl, password, uuid],
  );

  const urlActions = useMemo(() => [
    isValidUrl(url) && createLaunchAction({ actionId: 'launch-url', url }),
  ].filter(isTruthy), [url]);

  const noteActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-note',
    value: note,
    actionText: <FormattedMessage id="noteCopied" />,
  })], [note, uuid]);

  const additionalURLItems = (
    <div className="flex flex-col">
      {allWebsites.map((url, index) => (
        <ViewFieldValue
          key={index}
          actions={[
            createCopyAction({
              actionId: UserAction.MultipleURLCopied,
              itemUuid: uuid,
              actionText: <FormattedMessage id="websiteAddressCopied" />,
              trackingAction: { action: UserAction.MultipleURLCopied },
            }),
            isValidUrl(url) && createLaunchAction({
              actionId: UserAction.MultipleURLLaunched,
              url,
              trackingAction: { action: UserAction.MultipleURLLaunched },
            }),
          ].filter(isTruthy)}
          value={url}
        />
      ))}
    </div>
  );

  return (
    <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
      {username && (
        <ViewField
          label={formatMessage({ id: 'emailOrUsername' })}
          value={<ViewItemSelectableValue className="truncate" value={username} />}
          actions={usernameActions}
        />
      )}

      {password && (
        <>
          <ViewField
            noMarginBottom
            label={formatMessage({ id: 'password' })}
            value={
              <ViewItemSelectableValue
                className="overflow-hidden break-word"
                data-testid="passwordValue"
                value={showPassword ? getStylizedPassword(password) : '•••••••••••••••••'}
              />
            }
            actions={passwordActions}
          />

          <ViewField isPasswordSecurityField label={formatMessage({ id: 'passwordSecurity' })}>
            <PasswordStrengthMeter secret={password} checkWithPolicy={checkWithPolicy} />
          </ViewField>
        </>
      )}

      {item.mfa_value && <TotpValueField />}
      {hasMultipleWebsites ? (
        <ViewField
          hasExtraSpacing
          value={additionalURLItems}
          dataTestId="additional-websites"
          label={formatMessage({ id: 'websites' })}
        />
      ) : allWebsites[0] && (
        <ViewField
          label={formatMessage({ id: 'websiteUrl' })}
          value={<ViewItemSelectableValue className="truncate" value={allWebsites[0]} />}
          actions={urlActions}
        />
      )}

      <ViewCustomFields
        uuid={uuid}
        fields={custom_fields}
        featureFlag={FeatureFlag.CustomFields}
        vaultType={VaultType.Password}
      />

      {folder_name && (
        <ViewField
          label={formatMessage({ id: 'folder' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={folder_name} />}
        />
      )}

      {note && (
        <ViewField
          displayInvisibleAction
          label={formatMessage({ id: 'note' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={note} />}
          actions={noteActions}
        />
      )}
    </div>
  );
};
