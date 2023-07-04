import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { HeaderMenu } from './HeaderMenu';

const setup = () => renderWithInitEffects(wrapWithProviders(<HeaderMenu onMenuOpen={jest.fn()} />));

describe('HeaderMenu', () => {
  const viewInTabLinkTestId = 'view-in-tab';
  it('should NOT render view in tab icon if it is disabled', async () => {
    const { queryByTestId } = await setup();

    expect(queryByTestId(viewInTabLinkTestId)).toBeNull();
  });

  it('should render view in tab icon if it is enabled', async () => {
    Object.defineProperty(process.env, 'HAS_OPEN_APP_EXTENSION_LINK', { value: true });
    const { findByTestId } = await setup();

    expect(await findByTestId(viewInTabLinkTestId)).toBeVisible();
  });
});
