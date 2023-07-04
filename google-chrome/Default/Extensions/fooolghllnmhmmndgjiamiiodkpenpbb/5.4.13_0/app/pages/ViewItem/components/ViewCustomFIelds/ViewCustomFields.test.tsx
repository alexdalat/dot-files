import { render } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { CustomFieldType, TCustomField } from '@common/constants';
import { ActionType } from '@common/components/ActionButton/constants/ActionType';
import userEvent from '@testing-library/user-event';
import * as getIsFeatureEnabled from '@extension/app/utils/getIsFeatureEnabled';
import { UserAction } from '@common/constants/userAction';
import { api } from '@extension/app/api';
import { FeatureFlag } from '@common/constants/featureFlag';
import { VaultType } from '@common/constants/vault';
import { ViewCustomFields } from './ViewCustomFields';

const uuid = '69';

const fields: Array<TCustomField> = [
  { type: CustomFieldType.Text, label: 'custom field 1', value: '789' },
  { type: CustomFieldType.Hidden, label: 'custom field 2', value: '123' },
];

jest.mock('@extension/app/utils/getIsFeatureEnabled');
jest.spyOn(api.action, 'save');
jest.spyOn(api.extension, 'copyToClipboard');

const setup = (fields: Array<TCustomField>, isEnabled = true) => {
  jest.spyOn(getIsFeatureEnabled, 'useExtensionFeature').mockReturnValue(isEnabled);

  return render(wrapWithProviders(
    <ViewCustomFields
      uuid={uuid}
      fields={fields}
      featureFlag={FeatureFlag.CustomFields}
      vaultType={VaultType.Password}
    />,
  ));
};

const maskedPassword = '•'.repeat(17);

describe('ViewCustomFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null if feature flag off', () => {
    const { queryByTestId } = setup(fields, false);

    expect(queryByTestId('field-text_0')).toBeNull();
    expect(queryByTestId('field-hidden_0')).toBeNull();
  });

  it('should NOT show fields with empty value', () => {
    const fields: Array<TCustomField> = [
      { type: CustomFieldType.Text, label: 'field 1', value: '' },
      { type: CustomFieldType.Hidden, label: 'field 2', value: '' },
    ];
    const { queryByTestId } = setup(fields, true);

    expect(queryByTestId('field-text_0')).toBeNull();
    expect(queryByTestId('field-hidden_0')).toBeNull();
  });

  it('should render fields', async () => {
    const { findByTestId } = setup(fields);

    expect(await findByTestId('field-text_0')).toBeVisible();
    expect(await findByTestId('field-hidden_1')).toBeVisible();
  });

  it.each([
    ['text', 1, fields[0]],
    ['hidden', 2, fields[1]],
  ])('%s should have actions = %s', async (_type: string, count: number, field: TCustomField) => {
    const { findAllByRole } = setup([field]);

    expect(await findAllByRole('button')).toHaveLength(count);
  });

  it.each([
    ['text', fields[0], UserAction.CustomTextCopied],
    ['hidden', fields[1], UserAction.CustomHiddenCopied],
  ])('%s should copy value to clipboard', async (_type: string, field: TCustomField, action: UserAction) => {
    const { findByTestId } = setup([field]);

    await userEvent.click(await findByTestId(ActionType.Copy));

    expect(api.extension.copyToClipboard).toHaveBeenCalledWith(field.value);
    expect(api.action.save).toHaveBeenCalledWith(action, { firstSession: false });
  });

  describe('type=hidden', () => {
    it('should toggle value visibility', async () => {
      const { findByTestId, queryByTestId, findByText, queryByText } = setup([fields[1]]);
      expect(await findByText(maskedPassword)).toBeVisible();
      expect(queryByText(fields[1].value)).toBeNull();

      await userEvent.click(await findByTestId(ActionType.Show));
      expect(queryByTestId(ActionType.Show)).toBeNull();
      expect(await findByTestId(ActionType.Hide)).toBeVisible();
      expect(await findByText(fields[1].value)).toBeVisible();
      expect(await queryByText(maskedPassword)).toBeNull();

      await userEvent.click(await findByTestId(ActionType.Hide));
      expect(queryByTestId(ActionType.Hide)).toBeNull();
      expect(await findByTestId(ActionType.Show)).toBeVisible();
      expect(await findByText(maskedPassword)).toBeVisible();
      expect(queryByText(fields[1].value)).toBeNull();
    });
  });
});
