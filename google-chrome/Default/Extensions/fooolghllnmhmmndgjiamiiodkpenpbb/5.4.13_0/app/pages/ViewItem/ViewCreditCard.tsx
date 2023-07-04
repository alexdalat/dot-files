/* eslint-disable @typescript-eslint/naming-convention */

import styles from '@extension/app/pages/ViewItem/components/ItemTypeView/ItemTypeView.module.scss';
import { useHandleVaultChange } from '@extension/app/pages/ViewItem/hooks/useHandleVaultChange';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import cx from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getItemSecretChanges, getSecret } from '@extension/app/api/VaultApi';
import { createCopyAction, createShowHideAction } from '@extension/app/pages/ViewItem/utils/createAction';
import { ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { ICreditCardItem } from '@common/contracts/contracts';
import { FeatureFlag } from '@common/constants/featureFlag';
import { useRefState } from '@common/hooks/useRefState';
import { formatCardNumber } from '@common/utils/creditCard/creditCard';
import { UserAction } from '@common/constants/userAction';
import { isLimitedAccess } from '@common/utils/limitedAccessUtils/limitedAccessUtils';
import { ViewCustomFields } from '@extension/app/pages/ViewItem/components/ViewCustomFIelds/ViewCustomFields';
import { VaultType } from '@common/constants/vault';
import { ViewItemSelectableValue } from './viewItemSelectableValue';

interface IViewCreditCard {
  item: ICreditCardItem;
}

export const ViewCreditCard = ({ item }: IViewCreditCard) => {
  const { formatMessage } = useIntl();
  const [showCVC, setShowCVC] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [cvcValue, setCvcValue] = useRefState<string>();
  const [cardNumberValue, setCardNumberValue] = useRefState<string>();
  const [pinValue, setPinValue] = useRefState<string>();
  const isAccessLimited = isLimitedAccess(item.acl);
  const isPinCodeEnabled = useExtensionFeature(FeatureFlag.CreditCardPin);

  const { uuid, cardholder_name, expiry_date, zip_code, note, folder_name, custom_fields = [] } = item;

  const getCardDetails = useCallback(async () => {
    const { cvc, card_number, pin } = await getSecret(uuid);
    setCvcValue(cvc);
    setPinValue(pin);
    setCardNumberValue(card_number);
  }, [setCardNumberValue, setCvcValue, setPinValue, uuid]);

  useEffect(() => {
    getCardDetails();
  }, [getCardDetails]);

  const onVaultChange = async () => {
    const { cvc, card_number, pin } = await getItemSecretChanges(uuid);
    setCvcValue(cvc);
    setPinValue(pin);
    setCardNumberValue(card_number);
  };

  useHandleVaultChange(item, uuid, onVaultChange);

  const cardholderActions = useMemo(() => [createCopyAction({
    actionId: 'copy-cardholder-name',
    value: cardholder_name,
    itemUuid: uuid,
    trackingAction: { action: UserAction.TapCopyValueFromCC },
    actionText: <FormattedMessage id="cardHolderNameCopied" />,
  })], [cardholder_name, uuid]);

  const cardNumberActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-card-number',
    value: cardNumberValue,
    trackingAction: { action: UserAction.TapCopyValueFromCC },
    actionText: <FormattedMessage id="cardNumberCopied" />,
  })], [cardNumberValue, uuid]);

  const cvcActions = useMemo(
    () => [
      createShowHideAction({
        actionId: `${showCVC ? 'hide' : 'show'}-cvc`,
        value: showCVC,
        onClick: () => setShowCVC(prev => !prev),
        isLimitedAccess: isAccessLimited,
        itemUuid: uuid,
      }),
      createCopyAction({
        actionId: 'copy-cvc',
        value: cvcValue,
        isLimitedAccess: isAccessLimited,
        itemUuid: uuid,
        trackingAction: { action: UserAction.TapCopyValueFromCC },
        actionText: <FormattedMessage id="cvvCopied" />,
      }),
    ],
    [cvcValue, showCVC, isAccessLimited, uuid],
  );

  const pinActions = useMemo(
    () => [createShowHideAction({
      actionId: `${showPIN ? 'hide' : 'show'}-pin`,
      value: showPIN,
      onClick: () => setShowPIN(prev => !prev),
      isLimitedAccess: isAccessLimited,
      itemUuid: uuid,
    })],
    [showPIN, isAccessLimited, uuid],
  );

  const expDateActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-exp-date',
    value: expiry_date,
    trackingAction: { action: UserAction.TapCopyValueFromCC },
    actionText: <FormattedMessage id="expirationDateCopied" />,
  })], [expiry_date, uuid]);

  const zipActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-zip',
    value: zip_code,
    trackingAction: { action: UserAction.TapCopyValueFromCC },
    actionText: <FormattedMessage id="zipCodeCopied" />,
  })], [uuid, zip_code]);

  const noteActions = useMemo(() => [createCopyAction({
    itemUuid: uuid,
    actionId: 'copy-note',
    value: note,
    trackingAction: { action: UserAction.TapCopyValueFromCC },
    actionText: <FormattedMessage id="noteCopied" />,
  })], [note, uuid]);

  return (
    <div className={cx(styles['item-type-view'], 'bg-primary-accent-8 rounded-2')}>
      {cardholder_name && (
        <ViewField
          label={formatMessage({ id: 'cardholderName' })}
          value={<ViewItemSelectableValue className="truncate" value={cardholder_name} />}
          actions={cardholderActions}
        />
      )}

      {cardNumberValue && (
        <ViewField
          label={formatMessage({ id: 'cardNumber' })}
          value={<ViewItemSelectableValue className="truncate" value={formatCardNumber(cardNumberValue)} />}
          actions={cardNumberActions}
        />
      )}

      {expiry_date && (
        <ViewField
          label={formatMessage({ id: 'expirationDate' })}
          value={<ViewItemSelectableValue className="truncate" value={expiry_date} />}
          actions={expDateActions}
        />
      )}

      {cvcValue && (
        <ViewField
          label={formatMessage({ id: 'cvvLabel' })}
          value={<ViewItemSelectableValue className="overflow-hidden break-word" value={showCVC ? cvcValue : '•••'} />}
          actions={cvcActions}
        />
      )}

      {isPinCodeEnabled && pinValue && (
        <ViewField
          label={formatMessage({ id: 'cardPin' })}
          value={<ViewItemSelectableValue className="overflow-hidden break-word" value={showPIN ? pinValue : '••••'} />}
          actions={pinActions}
        />
      )}

      {zip_code && (
        <ViewField
          label={formatMessage({ id: 'zipOrPostalCode' })}
          value={<ViewItemSelectableValue className="truncate" value={zip_code} />}
          actions={zipActions}
        />
      )}

      <ViewCustomFields
        uuid={uuid}
        fields={custom_fields}
        featureFlag={FeatureFlag.CreditCardCustomFields}
        vaultType={VaultType.CreditCard}
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
