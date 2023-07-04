import { useCallback, useState } from 'react';
import { useIntl } from 'react-intl';
import { IAction, ViewField } from '@extension/app/pages/ViewItem/components/ViewField/ViewField';
import { ActionType } from '@common/components/ActionButton/constants/ActionType';
import { FeatureFlag } from '@common/constants/featureFlag';
import { CustomFieldType, TCustomField } from '@common/constants';
import { useExtensionFeature } from '@extension/app/utils/getIsFeatureEnabled';
import { createCopyAction, createShowHideAction } from '@extension/app/pages/ViewItem/utils/createAction';
import { VaultType } from '@common/constants/vault';
import { getCustomFieldsCopiedUserAction } from '@common/constants/customFields';

interface IViewCustomFields {
  uuid: string;
  fields: Array<TCustomField>;
  featureFlag: FeatureFlag;
  vaultType: VaultType;
}

export const ViewCustomFields = ({ uuid, fields, featureFlag, vaultType }: IViewCustomFields) => {
  const { formatMessage } = useIntl();
  const isCustomFieldsEnabled = useExtensionFeature(featureFlag);
  const [hiddenFieldVisibility, setHiddenFieldVisibility] = useState<Record<string, boolean>>({});

  const getCopyAction = useCallback(
    ({ value, label, type }: TCustomField, index: number): IAction => createCopyAction({
      itemUuid: uuid,
      actionId: `copy-field-${index}`,
      value,
      actionText: formatMessage({ id: 'itemCopied' }, { item: label }),
      trackingAction: {
        action: getCustomFieldsCopiedUserAction(type, vaultType),
        firstSession: false,
      },
    }),
    [formatMessage, uuid, vaultType],
  );

  const hiddenCustomFieldActions = useCallback(
    ({ value, label, type }: TCustomField, index: number): Array<IAction> => [
      createShowHideAction({
        itemUuid: uuid,
        actionId: `hidden-field-${index}-${hiddenFieldVisibility[index] ? ActionType.Hide : ActionType.Show}-value`,
        value: hiddenFieldVisibility[index] ? value : '',
        onClick: () => setHiddenFieldVisibility(prev => ({ ...prev, [index]: !prev[index] })),
      }),
      getCopyAction({ value, label, type }, index),
    ],
    [uuid, hiddenFieldVisibility, getCopyAction],
  );

  if (!isCustomFieldsEnabled) {
    return null;
  }

  const fieldsWithValue = fields.filter(field => field.value);

  return (
    <>
      {fieldsWithValue.map(({ type, label, value }, index) => (
        type === CustomFieldType.Text ? (
          <ViewField
            key={label}
            dataTestId={`field-text_${index}`}
            value={value}
            label={label}
            actions={[getCopyAction({ value, label, type }, index)]}
          />
        ) : (
          <ViewField
            noMarginBottom
            key={label}
            label={label}
            value={hiddenFieldVisibility[index] ? value : '•••••••••••••••••'}
            actions={(() => hiddenCustomFieldActions({ value, label, type }, index))()}
            dataTestId={`field-hidden_${index}`}
          />
        )
      ))}
    </>
  );
};
