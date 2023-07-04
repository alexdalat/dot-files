/* eslint-disable @typescript-eslint/naming-convention */
import { RemoteURL } from '@common/constants/remoteURL';
import { openInNewTab } from '@extension/common/utils/openInNewTab';
import { Link } from '@nordpass/ui';
import cx from 'classnames';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { IPasskeyItem } from '@common/contracts/contracts';
import { SVG } from '@nord/ui';
import { createCopyAction, createLaunchAction } from '@extension/app/pages/ViewItem/utils/createAction';
import { IAction, ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { ViewItemSelectableValue } from '@extension/app/pages/ViewItem/viewItemSelectableValue';
import { dateTimeFormatter } from '@common/utils/dateTimeFormatter';
import { Locale } from '@common/constants/locale';
import passkeyIcon from '@icons/passkey.svg';
import { getLocalDateFromUTCDate } from '@common/utils/date';
import { replaceSlashesWithDashes } from '@common/utils/replaceSlashesWithDashes';
import { isValidUrl } from '@common/utils/isValidUrl';
import { ViewCustomFields } from '@extension/app/pages/ViewItem/components/ViewCustomFIelds/ViewCustomFields';
import { FeatureFlag } from '@common/constants/featureFlag';
import { VaultType } from '@common/constants/vault';
import styles from './components/ItemTypeView/ItemTypeView.module.scss';

interface IViewPasskey {
  item: IPasskeyItem;
}

export const ViewPasskey = ({ item }: IViewPasskey) => {
  const { formatMessage, locale } = useIntl();
  const { folder_name, uuid, username, url, note, secret_version, custom_fields = [] } = item;

  const usernameActions = useMemo<Array<IAction>>(
    () => [
      createCopyAction({
        itemUuid: uuid,
        actionId: 'copy-username',
        value: username,
        actionText: <FormattedMessage id="emailOrUserNameCopied" />,
      }),
    ],
    [username, uuid],
  );

  const urlActions = useMemo<Array<IAction>>(
    () => [
      isValidUrl(url) && createLaunchAction({ actionId: 'launch-url', url }),
    ].filter(Boolean) as Array<IAction>,
    [url],
  );

  const noteActions = useMemo(
    () => [
      createCopyAction({
        itemUuid: uuid,
        actionId: 'copy-note',
        value: note,
        actionText: <FormattedMessage id="noteCopied" />,
      }),
    ],
    [note, uuid],
  );

  return (
    <>
      {secret_version && (
        <>
          <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
            <ViewField
              label={formatMessage({ id: 'passkeyFieldLabel' })}
              value={
                <ViewItemSelectableValue
                  className="truncate"
                  value={
                    <>
                      <SVG
                        noLazy
                        width={16}
                        height={16}
                        className="mr-2"
                        src={passkeyIcon}
                      />
                      {formatMessage(
                        { id: 'createdOnDateText' },
                        {
                          date: dateTimeFormatter(
                            locale as Locale,
                            getLocalDateFromUTCDate(
                              new Date(replaceSlashesWithDashes(secret_version)),
                            ),
                          ),
                        },
                      )}
                    </>
                  }
                />
              }
            />
          </div>

          <div className="px-2 mt-3 mb-6 color-primary-accent-17 text-micro">
            {formatMessage(
              { id: 'passkeyDescription' },
              {
                learnMoreLink: (
                  <Link
                    underline
                    rank="secondary"
                    className="text-micro"
                    onClick={() => openInNewTab(RemoteURL.PasskeysLearnMoreLink)}
                  >
                    {formatMessage({ id: 'learnMore' })}
                  </Link>
                ),
              },
            )}
          </div>
        </>
      )}

      <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
        {username && (
          <ViewField
            label={formatMessage({ id: 'emailOrUsername' })}
            value={<ViewItemSelectableValue className="truncate" value={username} />}
            actions={usernameActions}
          />
        )}

        <ViewField
          label={formatMessage({ id: 'websiteUrl' })}
          value={<ViewItemSelectableValue className="truncate" value={url} />}
          actions={urlActions}
        />

        <ViewCustomFields
          uuid={uuid}
          fields={custom_fields}
          featureFlag={FeatureFlag.PasskeyCustomFields}
          vaultType={VaultType.Passkey}
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
    </>
  );
};
