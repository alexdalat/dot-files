import { IItem } from '@common/interfaces/item';
import { VaultContext, IVaultContext } from '@extension/app/context/VaultContext';
import { screen } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { SharedFolderLinks } from './SharedFolderLinks';

jest.mock('./components/SharedFolderActions', () => ({
  SharedFolderActions: () => <span />,
}));

describe('SharedFolderLinks', () => {
  const defaultVault: Partial<IVaultContext> = {
    vaultItems: [],
  };

  const setup = (vaultSharedFolders: Array<IItem>, isLoading = false) => renderWithInitEffects(wrapWithProviders(
    <VaultContext.Provider value={{ ...defaultVault, vaultSharedFolders, isLoading } as IVaultContext}>
      <SharedFolderLinks onMenuClose={jest.fn} />
    </VaultContext.Provider>,
  ));

  it('should show nothing if loading', async () => {
    await setup([], true);
    expect(screen.queryByText('Shared folders')).toBeNull();
  });

  it('should show add new shared folder text when no folders are present', async () => {
    await setup([]);

    expect(screen.getByText('Add New Folder')).toBeVisible();
  });

  it('should not show add new shared folder text when folders are present', async () => {
    const title = 'Folder title';
    await setup([{ uuid: '123', title } as IItem]);

    expect(screen.queryByText('Add New Folder')).toBeNull();
    expect(screen.getByText(title)).toBeVisible();
  });
});
