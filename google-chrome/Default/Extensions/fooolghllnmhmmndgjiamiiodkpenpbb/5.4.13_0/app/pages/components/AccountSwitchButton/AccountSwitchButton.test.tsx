import { act, render, screen } from '@testing-library/react';
import { history } from '@extension/app/utils/history';
import { ROUTES } from '@extension/common/constants/routes';
import { wrapWithIntl } from '@tests/extension/utils/wrapWithIntl';
import { AccountSwitchButton } from './AccountSwitchButton';

jest.spyOn(history, 'push');

describe('AccountSwitchButton', () => {
  it('should render email first two letters', async () => {
    await act(async () => void render(wrapWithIntl(<AccountSwitchButton email="test@mail.com" disabled={false} />)));
    expect(screen.getByText('te')).toBeVisible();
  });

  it('should history push on click', async () => {
    await act(async () => void render(wrapWithIntl(<AccountSwitchButton email="test@mail.com" disabled={false} />)));
    screen.getByText('te').click();
    expect(history.push).toHaveBeenCalledWith(ROUTES.MP_SWITCH_ACCOUNT);
  });
});
