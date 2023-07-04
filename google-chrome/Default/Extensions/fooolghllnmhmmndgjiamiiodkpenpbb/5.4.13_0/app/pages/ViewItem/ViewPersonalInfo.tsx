/* eslint-disable @typescript-eslint/naming-convention */
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import cx from 'classnames';
import { ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { createCopyAction } from '@extension/app/pages/ViewItem/utils/createAction';
import { ViewFieldValue } from '@extension/app/pages/ViewItem/components/ViewFieldValue/ViewFieldValue';
import { isPersonalInfoAddressPresent } from '@common/utils/isPersonalInfoAddressPresent/isPersonalInfoAddressPresent';
import { IPersonalInfoItem } from '@common/contracts/contracts';
import styles from '@extension/app/pages/ViewItem/components/ItemTypeView/ItemTypeView.module.scss';
import { UserAction } from '@common/constants/userAction';
import { ViewCustomFields } from '@extension/app/pages/ViewItem/components/ViewCustomFIelds/ViewCustomFields';
import { FeatureFlag } from '@common/constants/featureFlag';
import { VaultType } from '@common/constants/vault';
import { ViewItemSelectableValue } from './viewItemSelectableValue';

interface IViewPersonalInfo {
  item: IPersonalInfoItem;
}

const getFullAddress = (item: IPersonalInfoItem) => {
  const { address1, address2, city, state, zip_code, country } = item;
  return [address1, address2, city, state, zip_code, country].join('\n');
};

export const ViewPersonalInfo = ({ item }: IViewPersonalInfo) => {
  const { formatMessage } = useIntl();
  const {
    address1,
    address2,
    city,
    state,
    zip_code,
    country,
    name,
    email,
    phone_number,
    note,
    folder_name,
    uuid,
    custom_fields = [],
  } = item;

  const address1Actions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-address1',
    value: address1,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="addressLine1Copied" />,
  })], [address1, uuid]);

  const address2Actions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-address2',
    value: address2,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="addressLine2Copied" />,
  })], [address2, uuid]);

  const cityActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-city',
    value: city,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="cityCopied" />,
  })], [city, uuid]);

  const stateActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-state',
    value: state,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="stateCopied" />,
  })], [state, uuid]);

  const zipActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-zip',
    value: zip_code,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="zipCodeCopied" />,
  })], [zip_code, uuid]);

  const countryActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-country',
    value: country,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="countryCopied" />,
  })], [country, uuid]);

  const nameActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-name',
    value: name,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="fullNameCopied" />,
  })], [name, uuid]);

  const emailActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-email',
    value: email,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="emailCopied" />,
  })], [email, uuid]);

  const phoneActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-phone',
    value: phone_number,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="phoneCopied" />,
  })], [phone_number, uuid]);

  const fullAddressActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-full-address',
    value: getFullAddress(item),
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionMessage: formatMessage({ id: 'copyFullAddress' }),
    actionText: <FormattedMessage id="addressCopied" />,
  })], [formatMessage, item, uuid]);

  const noteActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-note',
    value: note,
    trackingAction: { action: UserAction.TapCopyValueFromIdentity },
    actionText: <FormattedMessage id="noteCopied" />,
  })], [note, uuid]);

  const addressItems = (
    <div className="flex flex-col">
      {address1 && <ViewFieldValue value={address1} actions={address1Actions} />}
      {address2 && <ViewFieldValue value={address2} actions={address2Actions} />}
      {city && <ViewFieldValue value={city} actions={cityActions} />}
      {state && <ViewFieldValue value={state} actions={stateActions} />}
      {zip_code && <ViewFieldValue value={zip_code} actions={zipActions} />}
      {country && <ViewFieldValue value={country} actions={countryActions} />}
    </div>
  );

  const isAddressPresent = isPersonalInfoAddressPresent(item);

  return (
    <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
      {name && (
        <ViewField
          displayInvisibleAction
          label={formatMessage({ id: 'fullName' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={name} />}
          actions={nameActions}
        />
      )}

      {email && (
        <ViewField
          displayInvisibleAction
          label={formatMessage({ id: 'email' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={email} />}
          actions={emailActions}
        />
      )}

      {phone_number && (
        <ViewField
          displayInvisibleAction
          label={formatMessage({ id: 'phone' })}
          value={<ViewItemSelectableValue className="whitespace-pre-wrap break-word w-full" value={phone_number} />}
          actions={phoneActions}
        />
      )}

      {isAddressPresent && (
        <ViewField
          displayInvisibleAction
          hasExtraSpacing
          label={formatMessage({ id: 'address' })}
          value={addressItems}
          actions={fullAddressActions}
        />
      )}

      <ViewCustomFields
        uuid={uuid}
        fields={custom_fields}
        featureFlag={FeatureFlag.PersonalInfoCustomFields}
        vaultType={VaultType.PersonalInfo}
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
