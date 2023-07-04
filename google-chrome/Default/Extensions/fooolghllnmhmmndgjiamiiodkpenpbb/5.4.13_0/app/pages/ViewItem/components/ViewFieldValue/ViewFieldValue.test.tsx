import { render, waitFor } from '@testing-library/react';
import { ActionType } from '@extension/app/pages/ViewItem/constants/constants/ActionType';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { ViewFieldValue } from './ViewFieldValue';

describe('<ViewFieldValue />', () => {
  const fieldActions = [{ action: ActionType.Copy, actionText: 'Copy', actionId: 'copy' }];
  const iconButtonTestId = 'icon-button';

  const setup = (actions: any = null) => render(wrapWithProviders(<ViewFieldValue value="Test" actions={actions} />));

  it('should display value', async () => {
    const { queryByText } = setup();
    await waitFor(() => {
      expect(queryByText('Test')).toBeVisible();
    });
  });

  describe('when actions are set', () => {
    it('should display IconButton', async () => {
      const { findByTestId } = setup(fieldActions);
      expect(await findByTestId(iconButtonTestId)).toBeVisible();
    });
  });

  describe('when no actions are set', () => {
    it('should not display IconButton', async () => {
      const { queryByTestId } = setup();

      await waitFor(() => {
        expect(queryByTestId(iconButtonTestId)).toBeNull();
      });
    });
  });
});
