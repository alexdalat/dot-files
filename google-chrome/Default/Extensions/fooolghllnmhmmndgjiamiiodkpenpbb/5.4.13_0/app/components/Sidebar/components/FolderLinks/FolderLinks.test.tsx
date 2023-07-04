import { IItem } from '@common/interfaces/item';
import { VaultContext, IVaultContext } from '@extension/app/context/VaultContext';
import { screen } from '@testing-library/react';
import { wrapWithProviders } from '@tests/extension/utils/wrapWithProviders';
import { renderWithInitEffects } from '@tests/utils/renderWithInitEffects';
import { FolderLinks } from './FolderLinks';

describe('FolderLinks', () => {
  const defaultVault: Partial<IVaultContext> = {
    vaultItems: [],
  };
  const setup = (vaultPersonalFolders: Array<IItem>, isLoading = false) => renderWithInitEffects(wrapWithProviders(
    <VaultContext.Provider value={{ ...defaultVault, vaultPersonalFolders, isLoading } as IVaultContext}>
      <FolderLinks onMenuClose={jest.fn} />
    </VaultContext.Provider>,
  ));

  it('should show nothing if loading', async () => {
    await setup([], true);

    expect(screen.queryByText('Folders')).toBeNull();
  });

  it('should show add new folder text when no folders are present', async () => {
    await setup([]);

    expect(screen.getByText('Add New Folder')).toBeVisible();
  });

  it('should not show add new folder text when folders are present', async () => {
    const title = 'Folder title';
    await setup([{ uuid: '123', title } as IItem]);

    expect(screen.queryByText('Add New Folder')).toBeNull();
    expect(screen.getByText(title)).toBeVisible();
  });
});
